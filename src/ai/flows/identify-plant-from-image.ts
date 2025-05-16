
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
  console.log(`[Flow Entry] identifyPlantFromImage: Received request. photoDataUri length: ${photoDataUriLength}.`);
  // Shorten log for very long data URIs to avoid cluttering logs, but confirm it's received.
  if (photoDataUriLength > 0 && photoDataUriLength <= 200) { // Log short URIs
    console.log(`[Flow Detail] identifyPlantFromImage: photoDataUri (short): ${input.photoDataUri}`);
  } else if (photoDataUriLength > 200) { // Log prefix for long URIs
    console.log(`[Flow Detail] identifyPlantFromImage: photoDataUri (prefix): ${input.photoDataUri.substring(0,100)}... (Total length: ${photoDataUriLength})`);
  } else {
    console.log(`[Flow Detail] identifyPlantFromImage: photoDataUri is empty or undefined.`);
  }

  try {
    console.log(`[Flow Action] identifyPlantFromImage: Calling identifyPlantFromImageFlow.`);
    const result = await identifyPlantFromImageFlow(input);
    console.log('[Flow Success] identifyPlantFromImage: Flow executed successfully. Result commonName:', result?.englishIdentification?.commonName);
    return result;
  } catch (error: any) {
    console.error(`[Flow CRITICAL ERROR] identifyPlantFromImage: Execution failed. Input photoDataUri length: ${photoDataUriLength}.`);
    console.error('[Flow CRITICAL ERROR] identifyPlantFromImage: Error Message:', error.message);
    if (error.stack) {
      console.error('[Flow CRITICAL ERROR] identifyPlantFromImage: Stack Trace:', error.stack);
    }
    // Attempt to stringify the error object for more details, handling circular references
    try {
        const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error('[Flow CRITICAL ERROR] identifyPlantFromImage: Full Error Object (JSON):', errorString);
    } catch (stringifyError) {
        console.error('[Flow CRITICAL ERROR] identifyPlantFromImage: Could not stringify full error object. Original error object:', error);
    }
    // It's important to throw an error that the client can understand as a server failure
    throw new Error('Server-side analysis failed during plant identification. Please check server logs for details.');
  }
}

const prompt = ai.definePrompt({
  name: 'identifyPlantFromImagePrompt',
  input: {schema: IdentifyPlantFromImageInputSchema},
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
    inputSchema: IdentifyPlantFromImageInputSchema,
    outputSchema: IdentifyPlantFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI model did not return an output for plant identification.');
    }
    // Add detailed logging for output object before returning
    console.log(`[DEBUG FlowInternal] identifyPlantFromImageFlow: Output obtained. Type: ${typeof output}. Null/Undefined check: ${output === null || output === undefined}`);
    if (output) {
        try {
            const outputString = JSON.stringify(output);
            console.log(`[DEBUG FlowInternal] identifyPlantFromImageFlow: JSON.stringify SUCCESS. String length: ${outputString.length}. Preview (first 200 chars): ${outputString.substring(0, 200)}`);
        } catch (e: any) {
            console.error(`[CRITICAL DEBUG FlowInternal] identifyPlantFromImageFlow: JSON.stringify FAILED. Error: ${e.message}. Stack: ${e.stack}`);
        }
    }
    console.log('[DEBUG FlowInternal] identifyPlantFromImageFlow: Preparing to return output.');
    return output;
  }
);

