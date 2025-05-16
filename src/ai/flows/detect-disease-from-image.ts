
// src/ai/flows/detect-disease-from-image.ts
'use server';

/**
 * @fileOverview Detects diseases from an image of a plant leaf.
 *
 * - detectDiseaseFromImage - A function that handles the disease detection process.
 * - DetectDiseaseFromImageInput - The input type for the detectDiseaseFromImage function.
 * - DetectDiseaseFromImageOutput - The return type for the detectDiseaseFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import sharp from 'sharp'; // User needs to install sharp: npm install sharp

const TARGET_IMAGE_SIZE_BYTES = 1024 * 1024; // 1MB

// Helper to parse data URI and get buffer
function parseDataUri(dataUri: string): { mimeType: string; buffer: Buffer } | null {
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

const DetectDiseaseFromImageInputSchema = z.object({
  leafImageDataUri: z
    .string()
    .describe(
      "A photo of a plant leaf, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  plantSpecies: z.string().describe('The species of the plant the leaf belongs to.'),
});
export type DetectDiseaseFromImageInput = z.infer<typeof DetectDiseaseFromImageInputSchema>;

const DetectDiseaseFromImageOutputSchema = z.object({
  diseaseDetected: z.boolean().describe('Whether a disease or abnormality is detected on the leaf.'),
  likelyCauses: z.string().describe('The likely causes of the detected disease or abnormality in English.'),
  diseaseStatusUrdu: z.string().optional().describe('The disease status in Urdu (e.g., "بیماری پائی گئی", "صحت مند"). Provide empty string if not applicable.'),
  likelyCausesUrdu: z.string().optional().describe('The likely causes of the detected disease or abnormality in Urdu. Provide empty string if not applicable.'),
});
export type DetectDiseaseFromImageOutput = z.infer<typeof DetectDiseaseFromImageOutputSchema>;

export async function detectDiseaseFromImage(input: DetectDiseaseFromImageInput): Promise<DetectDiseaseFromImageOutput> {
  const leafImageDataUriLength = input.leafImageDataUri ? input.leafImageDataUri.length : 0;
  console.log(`[Flow Entry] detectDiseaseFromImage: Received request. Original leafImageDataUri length: ${leafImageDataUriLength}, plantSpecies: ${input.plantSpecies}.`);
  if (leafImageDataUriLength > 0 && leafImageDataUriLength <= 200) {
    console.log(`[Flow Detail] detectDiseaseFromImage: Original leafImageDataUri (short): ${input.leafImageDataUri}`);
  } else if (leafImageDataUriLength > 200) {
    console.log(`[Flow Detail] detectDiseaseFromImage: Original leafImageDataUri (prefix): ${input.leafImageDataUri.substring(0,100)}... (Total length: ${leafImageDataUriLength})`);
  } else {
    console.log(`[Flow Detail] detectDiseaseFromImage: Original leafImageDataUri is empty or undefined.`);
  }
  
  let finalLeafImageDataUri = input.leafImageDataUri;

  if (input.leafImageDataUri) {
    const parsedInput = parseDataUri(input.leafImageDataUri);
    if (parsedInput) {
      console.log(`[ImageResize] detectDiseaseFromImage: Original image binary size: ${parsedInput.buffer.length} bytes. Target: ${TARGET_IMAGE_SIZE_BYTES} bytes.`);
      if (parsedInput.buffer.length > TARGET_IMAGE_SIZE_BYTES) {
        console.log('[ImageResize] detectDiseaseFromImage: Image exceeds target size. Attempting to resize...');
        try {
          const resizedBuffer = await sharp(parsedInput.buffer)
            .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75 }) // Output as JPEG
            .toBuffer();
          finalLeafImageDataUri = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
          console.log(`[ImageResize] detectDiseaseFromImage: Image resized successfully. New binary size: ${resizedBuffer.length} bytes. New data URI length: ${finalLeafImageDataUri.length}`);
        } catch (resizeError: any) {
          console.error(`[ImageResize CRITICAL] detectDiseaseFromImage: Error during image resizing: ${resizeError.message}. Using original image.`, resizeError);
        }
      } else {
        console.log('[ImageResize] detectDiseaseFromImage: Image size is within limits. Using original image.');
      }
    } else {
      console.warn('[ImageResize] detectDiseaseFromImage: Invalid data URI format. Skipping resize.');
    }
  }

  const flowInput = { ...input, leafImageDataUri: finalLeafImageDataUri };
  
  try {
    console.log(`[Flow Action] detectDiseaseFromImage: Calling detectDiseaseFromImageFlow with potentially resized image (new data URI length: ${finalLeafImageDataUri.length}).`);
    const result = await detectDiseaseFromImageFlow(flowInput);
    console.log('[Flow Success] detectDiseaseFromImage: Flow executed successfully. Disease detected:', result?.diseaseDetected);
    return result;
  } catch (error: any) {
    const errorMessage = `[Flow CRITICAL ERROR] detectDiseaseFromImage: Execution failed in wrapper function.`;
    console.error(errorMessage);
    console.error(`[Flow CRITICAL ERROR Input] plantSpecies: ${input.plantSpecies}, original leafImageDataUri length: ${input.leafImageDataUri?.length ?? 'N/A'}, potentially resized URI length: ${finalLeafImageDataUri?.length ?? 'N/A'}`);
    if (input.leafImageDataUri && input.leafImageDataUri.length <=200) {
        console.error(`[Flow CRITICAL ERROR Input Detail] original leafImageDataUri (short): ${input.leafImageDataUri}`);
    } else if (input.leafImageDataUri) {
        console.error(`[Flow CRITICAL ERROR Input Detail] original leafImageDataUri (prefix): ${input.leafImageDataUri.substring(0,100)}...`);
    }
    console.error('[Flow CRITICAL ERROR Message]', error.message);
    if (error.stack) {
      console.error('[Flow CRITICAL ERROR Stack]', error.stack);
    }
    try {
        const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error('[Flow CRITICAL ERROR Full Object (JSON)]', errorString);
    } catch (stringifyError: any) {
        console.error('[Flow CRITICAL ERROR] Could not stringify full error object. Original error object:', error);
        console.error('[Flow CRITICAL ERROR Stringify Error]', stringifyError.message);
    }
    throw new Error(`Server-side analysis failed during disease detection. Please check server logs for details.`);
  }
}

const prompt = ai.definePrompt({
  name: 'detectDiseaseFromImagePrompt',
  input: {schema: DetectDiseaseFromImageInputSchema}, // Stays the same
  output: {schema: DetectDiseaseFromImageOutputSchema},
  prompt: `You are an expert in plant pathology. Analyze the provided image of a plant leaf and detect potential diseases or abnormalities.

Plant Species: {{{plantSpecies}}}
Leaf Image: {{media url=leafImageDataUri}}

Provide the following information in the specified JSON structure:
- \`diseaseDetected\`: (boolean) Whether a disease or abnormality is detected.
- \`likelyCauses\`: (string) The likely causes in English.
- \`diseaseStatusUrdu\`: (string, optional) The disease status in Urdu. For example, if a disease is detected, use "بیماری پائی گئی". If healthy, use "صحت مند". If not applicable, provide an empty string.
- \`likelyCausesUrdu\`: (string, optional) The likely causes in Urdu. If not applicable, provide an empty string.
`,
});

const detectDiseaseFromImageFlow = ai.defineFlow(
  {
    name: 'detectDiseaseFromImageFlow',
    inputSchema: DetectDiseaseFromImageInputSchema, // Input here is after potential resizing
    outputSchema: DetectDiseaseFromImageOutputSchema,
  },
  async (flowInput: DetectDiseaseFromImageInput) => { // Explicitly type flowInput
    const {output} = await prompt(flowInput); // Use potentially modified leafImageDataUri
    if (!output) {
      console.error('[CRITICAL FlowInternal] detectDiseaseFromImageFlow: AI model did not return an output.');
      throw new Error('AI model did not return an output for disease detection.');
    }
    console.log(`[DEBUG FlowInternal] detectDiseaseFromImageFlow: Output obtained. Preview (first 100 chars): ${JSON.stringify(output)?.substring(0,100)}`);
    return output;
  }
);

