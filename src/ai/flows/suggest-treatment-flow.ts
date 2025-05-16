
'use server';
/**
 * @fileOverview Suggests treatments for plant diseases in English and Urdu.
 *
 * - suggestPlantTreatment - A function that provides treatment suggestions.
 * - SuggestPlantTreatmentInput - The input type for the suggestPlantTreatment function.
 * - SuggestPlantTreatmentOutput - The return type for the suggestPlantTreatment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPlantTreatmentInputSchema = z.object({
  plantSpecies: z.string().describe('The species of the plant.'),
  diseaseDescription: z.string().describe('A description of the detected disease or symptoms in English.'),
  diseaseDescriptionUrdu: z.string().optional().describe('A description of the detected disease or symptoms in Urdu. (Optional, use English if not provided)'),
});
export type SuggestPlantTreatmentInput = z.infer<typeof SuggestPlantTreatmentInputSchema>;

const SuggestPlantTreatmentOutputSchema = z.object({
  suggestedSolutions: z.string().describe('Detailed steps or treatments to address the plant disease, in English. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers.'),
  preventativeMeasures: z.string().describe('Measures to prevent future occurrences or spread of the disease, in English. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers.'),
  suggestedSolutionsUrdu: z.string().optional().describe('Detailed steps or treatments to address the plant disease, in Urdu. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers. Provide empty string if not applicable.'),
  preventativeMeasuresUrdu: z.string().optional().describe('Measures to prevent future occurrences or spread of the disease, in Urdu. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers. Provide empty string if not applicable.'),
});
export type SuggestPlantTreatmentOutput = z.infer<typeof SuggestPlantTreatmentOutputSchema>;

export async function suggestPlantTreatment(input: SuggestPlantTreatmentInput): Promise<SuggestPlantTreatmentOutput> {
  console.log(`[Flow Entry] suggestPlantTreatment: Received request. plantSpecies: ${input.plantSpecies}, diseaseDescription length: ${input.diseaseDescription.length}, diseaseDescriptionUrdu length: ${input.diseaseDescriptionUrdu ? input.diseaseDescriptionUrdu.length : 'N/A'}.`);
  
  try {
    console.log(`[Flow Action] suggestPlantTreatment: Calling suggestPlantTreatmentFlow.`);
    const result = await suggestPlantTreatmentFlow(input);
    console.log(`[Flow Success] suggestPlantTreatment: Flow executed successfully. English solutions length: ${result?.suggestedSolutions?.length}`);
    return result;
  } catch (error: any) {
    const errorMessage = `[Flow CRITICAL ERROR] suggestPlantTreatment: Execution failed in wrapper function.`;
    console.error(errorMessage);
    console.error(`[Flow CRITICAL ERROR Input] plantSpecies: ${input.plantSpecies}, diseaseDescription length: ${input.diseaseDescription?.length ?? 'N/A'}, diseaseDescriptionUrdu length: ${input.diseaseDescriptionUrdu?.length ?? 'N/A'}`);
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
    throw new Error(`Server-side analysis failed during treatment suggestion. Please check server logs for details.`);
  }
}

const prompt = ai.definePrompt({
  name: 'suggestPlantTreatmentPrompt',
  input: {schema: SuggestPlantTreatmentInputSchema},
  output: {schema: SuggestPlantTreatmentOutputSchema},
  prompt: `You are a plant health expert and advisor.
A plant of species '{{{plantSpecies}}}' has been diagnosed with the following issue:
English: '{{{diseaseDescription}}}'
{{#if diseaseDescriptionUrdu}}Urdu: '{{{diseaseDescriptionUrdu}}}'{{/if}}

Please provide the following in English AND Urdu:
1.  **suggestedSolutions / suggestedSolutionsUrdu**: Detailed, actionable suggested solutions to treat the current problem. For each solution, provide clear, step-by-step instructions if applicable. Present these solutions as a series of distinct paragraphs or items separated by newlines. Do NOT use markdown list markers like asterisks (*) or hyphens (-).
2.  **preventativeMeasures / preventativeMeasuresUrdu**: Practical preventative measures to avoid this issue in the future or prevent its spread to other plants. Present these measures similarly, as distinct paragraphs or items separated by newlines, without markdown list markers.

Structure your response clearly with distinct sections for solutions and preventative measures for both languages.
Use clear, easy-to-understand language. If an Urdu translation for a specific technical term is difficult, you may use a common transliteration.
If Urdu output for any field is not applicable or cannot be reliably generated, provide an empty string for that specific Urdu field.
`,
});

const suggestPlantTreatmentFlow = ai.defineFlow(
  {
    name: 'suggestPlantTreatmentFlow',
    inputSchema: SuggestPlantTreatmentInputSchema,
    outputSchema: SuggestPlantTreatmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      console.error('[CRITICAL FlowInternal] suggestPlantTreatmentFlow: AI model did not return an output.');
      throw new Error('AI model did not return an output for treatment suggestion.');
    }
    console.log(`[DEBUG FlowInternal] suggestPlantTreatmentFlow: Output obtained. Preview (first 100 chars): ${JSON.stringify(output)?.substring(0, 100)}`);
    return output;
  }
);
