// 'use server';

/**
 * @fileOverview Detects diseases from an image of a plant leaf.
 *
 * - detectDiseaseFromImage - A function that handles the disease detection process.
 * - DetectDiseaseFromImageInput - The input type for the detectDiseaseFromImage function.
 * - DetectDiseaseFromImageOutput - The return type for the detectDiseaseFromImage function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  try {
    const leafImageDataUriLength = input.leafImageDataUri ? input.leafImageDataUri.length : 0;
    console.log(`[Flow Call] detectDiseaseFromImage with input leafImageDataUri length: ${leafImageDataUriLength}, plantSpecies: ${input.plantSpecies}`);
    if (leafImageDataUriLength > 100) {
        console.log('[Flow Call Detail] leafImageDataUri starts with:', input.leafImageDataUri.substring(0, 100) + '...');
    } else if (leafImageDataUriLength > 0) {
        console.log('[Flow Call Detail] leafImageDataUri:', input.leafImageDataUri);
    } else {
        console.log('[Flow Call Detail] leafImageDataUri is empty or undefined.');
    }
    
    const result = await detectDiseaseFromImageFlow(input);
    console.log('[Flow Success] detectDiseaseFromImage completed.');
    return result;
  } catch (error) {
    console.error('[Flow Error] detectDiseaseFromImage failed:', error);
    throw new Error(`Failed in detectDiseaseFromImage flow: ${error instanceof Error ? error.message : String(error)}`);
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
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI model did not return an output for disease detection.');
    }
    return output;
  }
);
