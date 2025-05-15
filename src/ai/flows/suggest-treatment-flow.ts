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
  return suggestPlantTreatmentFlow(input);
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
    return output!;
  }
);
