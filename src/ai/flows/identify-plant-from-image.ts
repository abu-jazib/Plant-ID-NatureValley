
// src/ai/flows/identify-plant-from-image.ts
'use server';
/**
 * @fileOverview Identifies a plant species from an image, providing details in English and Urdu.
 *
 * - identifyPlantFromImage - A function that handles the plant identification process.
 * - IdentifyPlantFromImageInput - The input type for the identifyPlantFromImage function.
 * - IdentifyPlantFromImageOutput - The return type for the identifyPlantFromImage function.
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

const IdentifyPlantFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyPlantFromImageInput = z.infer<typeof IdentifyPlantFromImageInputSchema>;

const EnglishIdentificationSchema = z.object({
  commonName: z.string().describe('The common name of the identified plant species in English.'),
  latinName: z.string().describe('The scientific/Latin name of the identified plant species.'),
});

const UrduIdentificationSchema = z.object({
  commonName: z.string().optional().describe('The common name of the identified plant species in Urdu. Omit if not applicable or unavailable.'),
  latinNameRepresentation: z.string().optional().describe('The scientific/Latin name phonetically transliterated or explained in Urdu script (e.g., "روزا انڈیکا" for "Rosa indica"). Omit if not applicable.'),
});

const IdentifyPlantFromImageOutputSchema = z.object({
  englishIdentification: EnglishIdentificationSchema.describe("Plant identification details in English."),
  urduIdentification: UrduIdentificationSchema.describe("Plant identification details in Urdu."),
  confidence: z.number().min(0).max(1).describe('The confidence level of the identification (0-1).'),
  wikiLink: z.string().describe('The link to the corresponding English Wikipedia article for the plant. Should be a valid URL.'),
});
export type IdentifyPlantFromImageOutput = z.infer<typeof IdentifyPlantFromImageOutputSchema>;


export async function identifyPlantFromImage(input: IdentifyPlantFromImageInput): Promise<IdentifyPlantFromImageOutput> {
  const photoDataUriLength = input.photoDataUri ? input.photoDataUri.length : 0;
  console.log(`[Flow Entry] identifyPlantFromImage: Received request. Original photoDataUri length: ${photoDataUriLength}.`);
  if (photoDataUriLength > 0 && photoDataUriLength <= 200) { 
    console.log(`[Flow Detail] identifyPlantFromImage: Original photoDataUri (short): ${input.photoDataUri}`);
  } else if (photoDataUriLength > 200) { 
    console.log(`[Flow Detail] identifyPlantFromImage: Original photoDataUri (prefix): ${input.photoDataUri.substring(0,100)}... (Total length: ${photoDataUriLength})`);
  } else {
    console.log(`[Flow Detail] identifyPlantFromImage: Original photoDataUri is empty or undefined.`);
  }

  let finalPhotoDataUri = input.photoDataUri;

  if (input.photoDataUri) {
    const parsedInput = parseDataUri(input.photoDataUri);
    if (parsedInput) {
      console.log(`[ImageResize] identifyPlantFromImage: Original image binary size: ${parsedInput.buffer.length} bytes. Target: ${TARGET_IMAGE_SIZE_BYTES} bytes.`);
      if (parsedInput.buffer.length > TARGET_IMAGE_SIZE_BYTES) {
        console.log('[ImageResize] identifyPlantFromImage: Image exceeds target size. Attempting to resize...');
        try {
          const resizedBuffer = await sharp(parsedInput.buffer)
            .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 75 }) // Output as JPEG for better compression
            .toBuffer();
          finalPhotoDataUri = `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
          console.log(`[ImageResize] identifyPlantFromImage: Image resized successfully. New binary size: ${resizedBuffer.length} bytes. New data URI length: ${finalPhotoDataUri.length}`);
        } catch (resizeError: any) {
          console.error(`[ImageResize CRITICAL] identifyPlantFromImage: Error during image resizing: ${resizeError.message}. Using original image.`, resizeError);
        }
      } else {
        console.log('[ImageResize] identifyPlantFromImage: Image size is within limits. Using original image.');
      }
    } else {
      console.warn('[ImageResize] identifyPlantFromImage: Invalid data URI format. Skipping resize.');
    }
  }
  
  const flowInput = { ...input, photoDataUri: finalPhotoDataUri };

  try {
    console.log(`[Flow Action] identifyPlantFromImage: Calling identifyPlantFromImageFlow with potentially resized image (new data URI length: ${finalPhotoDataUri.length}).`);
    const result = await identifyPlantFromImageFlow(flowInput);
    console.log('[Flow Success] identifyPlantFromImage: Flow executed successfully. Result commonName:', result?.englishIdentification?.commonName);
    return result;
  } catch (error: any) {
    const errorMessage = `[Flow CRITICAL ERROR] identifyPlantFromImage: Execution failed in wrapper function. Input photoDataUri length: ${input.photoDataUri?.length ?? 'N/A'}. Potentially resized URI length: ${finalPhotoDataUri?.length ?? 'N/A'}`;
    console.error(errorMessage);
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
    throw new Error('Server-side analysis failed during plant identification. Please check server logs for details.');
  }
}

const prompt = ai.definePrompt({
  name: 'identifyPlantFromImagePrompt',
  input: {schema: IdentifyPlantFromImageInputSchema}, // Stays the same, as resizing happens before this
  output: {schema: IdentifyPlantFromImageOutputSchema},
  prompt: `You are an expert botanist specializing in plant identification.
You will use the image to identify the plant species.

For the identified plant, provide the following information in the specified JSON structure:

1.  **englishIdentification**:
    *   \`commonName\`: The common name of the identified plant species in English.
    *   \`latinName\`: The scientific/Latin name of the identified plant species.
2.  **urduIdentification**:
    *   \`commonName\`: The common name of the identified plant species in Urdu. If an Urdu common name is not readily available or applicable, you may omit this field or provide an empty string.
    *   \`latinNameRepresentation\`: The scientific/Latin name phonetically transliterated or explained in Urdu script. For example, if the Latin name is "Rosa indica", you might provide "روزا انڈیکا". If not applicable, omit or provide an empty string.
3.  **confidence**: A numerical confidence level (0-1) for the identification (e.g., 0.95).
4.  **wikiLink**: A link to the English Wikipedia article for the plant. Ensure this is a complete and valid URL.

Photo: {{media url=photoDataUri}}
  `,
});

const identifyPlantFromImageFlow = ai.defineFlow(
  {
    name: 'identifyPlantFromImageFlow',
    inputSchema: IdentifyPlantFromImageInputSchema, // Input here is after potential resizing
    outputSchema: IdentifyPlantFromImageOutputSchema,
  },
  async (flowInput: IdentifyPlantFromImageInput) => { // Explicitly type flowInput
    const {output} = await prompt(flowInput); // Use potentially modified photoDataUri from flowInput
    if (!output) {
      console.error('[CRITICAL FlowInternal] identifyPlantFromImageFlow: AI model did not return an output.');
      throw new Error('AI model did not return an output for plant identification.');
    }
    console.log(`[DEBUG FlowInternal] identifyPlantFromImageFlow: Output obtained. Preview (first 100 chars): ${JSON.stringify(output)?.substring(0,100)}`);
    return output;
  }
);

