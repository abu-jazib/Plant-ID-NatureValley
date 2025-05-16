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
  try {
    const photoDataUriLength = input.photoDataUri ? input.photoDataUri.length : 0;
    console.log(`[Flow Call] identifyPlantFromImage with input photoDataUri length: ${photoDataUriLength}`);
    if (photoDataUriLength > 100) {
        console.log('[Flow Call Detail] photoDataUri starts with:', input.photoDataUri.substring(0, 100) + '...');
    } else if (photoDataUriLength > 0) {
        console.log('[Flow Call Detail] photoDataUri:', input.photoDataUri);
    } else {
        console.log('[Flow Call Detail] photoDataUri is empty or undefined.');
    }

    const result = await identifyPlantFromImageFlow(input);
    console.log('[Flow Success] identifyPlantFromImage completed.');
    return result;
  } catch (error) {
    console.error('[Flow Error] identifyPlantFromImage failed:', error);
    throw new Error(`Failed in identifyPlantFromImage flow: ${error instanceof Error ? error.message : String(error)}`);
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
    return output;
  }
);
