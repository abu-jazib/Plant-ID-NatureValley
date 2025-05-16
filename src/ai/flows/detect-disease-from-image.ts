
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
import sharp from 'sharp';

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
  let finalLeafImageDataUri = input.leafImageDataUri;

  if (input.leafImageDataUri) {
    const parsedInput = parseDataUri(input.leafImageDataUri);
    if (parsedInput) {
      if (parsedInput.buffer.length > TARGET_IMAGE_SIZE_BYTES) {
        try {
          const resizedBuffer = await sharp(parsedInput.buffer)
            .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75 })
            .toBuffer();
          finalLeafImageDataUri = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
        } catch (resizeError: any) {
          console.error(`Error during image resizing for disease detection (plant: ${input.plantSpecies}): ${resizeError.message}. Using original image.`);
          // Proceed with original image if resize fails
        }
      }
    }
  }

  const flowInput = { ...input, leafImageDataUri: finalLeafImageDataUri };
  
  try {
    const result = await detectDiseaseFromImageFlow(flowInput);
    return result;
  } catch (error: any) {
    console.error(`Error in detectDiseaseFromImage flow for plant ${input?.plantSpecies}:`, error);
    throw new Error(`Server-side analysis failed during disease detection.`);
  }
}

const prompt = ai.definePrompt({
  name: 'detectDiseaseFromImagePrompt',
  input: {schema: DetectDiseaseFromImageInputSchema},
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
    inputSchema: DetectDiseaseFromImageInputSchema,
    outputSchema: DetectDiseaseFromImageOutputSchema,
  },
  async (flowInput: DetectDiseaseFromImageInput) => {
    const {output} = await prompt(flowInput);
    if (!output) {
      throw new Error('AI model did not return an output for disease detection.');
    }
    return output;
  }
);
