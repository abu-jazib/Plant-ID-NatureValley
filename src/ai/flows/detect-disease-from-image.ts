
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
  console.log(`[Flow Entry] detectDiseaseFromImage: Received request. leafImageDataUri length: ${leafImageDataUriLength}, plantSpecies: ${input.plantSpecies}.`);
  if (leafImageDataUriLength > 0 && leafImageDataUriLength <= 200) {
    console.log(`[Flow Detail] detectDiseaseFromImage: leafImageDataUri (short): ${input.leafImageDataUri}`);
  } else if (leafImageDataUriLength > 200) {
    console.log(`[Flow Detail] detectDiseaseFromImage: leafImageDataUri (prefix): ${input.leafImageDataUri.substring(0,100)}... (Total length: ${leafImageDataUriLength})`);
  } else {
    console.log(`[Flow Detail] detectDiseaseFromImage: leafImageDataUri is empty or undefined.`);
  }
  
  try {
    console.log(`[Flow Action] detectDiseaseFromImage: Calling detectDiseaseFromImageFlow.`);
    const result = await detectDiseaseFromImageFlow(input);
    console.log('[Flow Success] detectDiseaseFromImage: Flow executed successfully. Disease detected:', result?.diseaseDetected);
    return result;
  } catch (error: any) {
    const errorMessage = `[Flow CRITICAL ERROR] detectDiseaseFromImage: Execution failed.`;
    console.error(errorMessage);
    console.error(`[Flow CRITICAL ERROR] Input: plantSpecies: ${input.plantSpecies}, leafImageDataUri length: ${input.leafImageDataUri?.length ?? 'N/A'}`);
    if (input.leafImageDataUri && input.leafImageDataUri.length <=200) {
        console.error(`[Flow CRITICAL ERROR] Input leafImageDataUri (short): ${input.leafImageDataUri}`);
    } else if (input.leafImageDataUri) {
        console.error(`[Flow CRITICAL ERROR] Input leafImageDataUri (prefix): ${input.leafImageDataUri.substring(0,100)}...`);
    }
    console.error('[Flow CRITICAL ERROR] Error Message:', error.message);
    if (error.stack) {
      console.error('[Flow CRITICAL ERROR] Stack Trace:', error.stack);
    }
    try {
        const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
        console.error('[Flow CRITICAL ERROR] Full Error Object (JSON):', errorString);
    } catch (stringifyError) {
        console.error('[Flow CRITICAL ERROR] Could not stringify full error object. Original error object:', error);
    }
    throw new Error(`Server-side analysis failed during disease detection. Please check server logs for details.`);
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
