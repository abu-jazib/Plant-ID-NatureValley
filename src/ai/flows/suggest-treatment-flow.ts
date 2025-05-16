
'use server';
/**
 * @fileOverview Suggests treatments for plant diseases in English and Urdu, including chemical options and example products in Pakistan.
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

const ProductInfoSchema = z.object({
  brandName: z.string().describe("Brand name of an example commercial product containing the chemical, potentially available in Pakistan based on general knowledge."),
  manufacturer: z.string().optional().describe("Manufacturer of the example product, if known."),
  cropUsage: z.string().optional().describe("General recommended crops for this type of product, if specified (e.g., 'Vegetables, Cotton')."),
});

const ChemicalTreatmentSchema = z.object({
  chemicalName: z.string().describe('The common or chemical name of the active ingredient in English.'),
  instructions: z.string().describe('General application instructions, quantity, frequency, or other relevant details for use in English. Include any important safety precautions.'),
  chemicalNameUrdu: z.string().optional().describe('The common or chemical name of the active ingredient in Urdu. Omit if not applicable or direct translation is difficult.'),
  instructionsUrdu: z.string().optional().describe('General application instructions in Urdu. Omit if not applicable or direct translation is difficult.'),
  productsInPakistan: z.array(ProductInfoSchema).optional().describe("Examples of commercial products available in Pakistan containing this chemical, including brand names, manufacturers, and crop usage. This information is based on general knowledge and may not be exhaustive or current. Users should always verify local availability and follow product labels."),
});

const SuggestPlantTreatmentOutputSchema = z.object({
  suggestedSolutions: z.string().describe('Detailed steps or treatments to address the plant disease, in English. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers.'),
  preventativeMeasures: z.string().describe('Measures to prevent future occurrences or spread of the disease, in English. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers.'),
  suggestedSolutionsUrdu: z.string().optional().describe('Detailed steps or treatments to address the plant disease, in Urdu. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers. Provide empty string if not applicable.'),
  preventativeMeasuresUrdu: z.string().optional().describe('Measures to prevent future occurrences or spread of the disease, in Urdu. Present as distinct paragraphs or items separated by newlines. Do NOT use markdown list markers. Provide empty string if not applicable.'),
  chemicalTreatments: z.array(ChemicalTreatmentSchema).optional().describe('A list of chemical treatment options for the plant disease, including English and Urdu details, and example product information. If no specific chemical treatments are applicable or found, this array can be empty or omitted.'),
  additionalNotes: z.string().optional().describe('A general disclaimer in English, such as: "Always verify product suitability and follow local regulations and label instructions. Chemical availability and regulations can vary." This should be generated if chemical treatments are listed.'),
});
export type SuggestPlantTreatmentOutput = z.infer<typeof SuggestPlantTreatmentOutputSchema>;

export async function suggestPlantTreatment(input: SuggestPlantTreatmentInput): Promise<SuggestPlantTreatmentOutput> {
  try {
    const result = await suggestPlantTreatmentFlow(input);
    return result;
  } catch (error: any) {
    console.error(`Error in suggestPlantTreatment flow for plant ${input?.plantSpecies}, disease: ${input?.diseaseDescription}:`, error);
    throw new Error(`Server-side analysis failed during treatment suggestion.`);
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

Please provide the following:
1.  **suggestedSolutions / suggestedSolutionsUrdu**: Detailed, actionable suggested solutions (non-chemical if possible) to treat the current problem, in English AND Urdu. For each solution, provide clear, step-by-step instructions if applicable. Present these solutions as a series of distinct paragraphs or items separated by newlines. Do NOT use markdown list markers like asterisks (*) or hyphens (-).
2.  **preventativeMeasures / preventativeMeasuresUrdu**: Practical preventative measures to avoid this issue in the future or prevent its spread to other plants, in English AND Urdu. Present these measures similarly, as distinct paragraphs or items separated by newlines, without markdown list markers.
3.  **chemicalTreatments**: If applicable, research and provide specific chemical treatment options for the diagnosed issue and plant species. Present these chemical treatments as an array of objects. Each object must have the following properties:
    *   'chemicalName' (the common or chemical name of the active ingredient, in English)
    *   'instructions' (general application instructions, including quantity, frequency, safety precautions, etc., in English).
    *   'chemicalNameUrdu' (the common or chemical name of the active ingredient, in Urdu. If direct translation of technical terms is difficult, use a common transliteration or leave empty).
    *   'instructionsUrdu' (general application instructions, in Urdu. If direct translation is difficult, use common transliteration or leave empty).
    *   'productsInPakistan' (array of objects): For this chemical, list 1-2 example commercial products believed to be available in Pakistan, based on your training data. Each product object should have: 'brandName' (string), 'manufacturer' (string, optional), 'cropUsage' (string, optional, e.g., "Vegetables, Cotton"). This information is for guidance and is not an endorsement or real-time inventory. Users must always verify local availability, suitability, and follow product label instructions. If no specific product examples come to mind or are appropriate, provide an empty array for 'productsInPakistan'.
    If no specific chemical treatments are commonly recommended or applicable for this situation, you may omit the 'chemicalTreatments' field or provide an empty array.
4.  **additionalNotes**: A general disclaimer in English, such as: "Always verify product suitability and follow local regulations and label instructions. Chemical availability and regulations can vary." This should be generated if chemical treatments are listed. If no chemical treatments are listed, this field can be an empty string or omitted.

Structure your response clearly. Use clear, easy-to-understand language. If an Urdu translation for a specific technical term is difficult, you may use a common transliteration.
If Urdu output for general solutions or preventative measures is not applicable or cannot be reliably generated, provide an empty string for that specific Urdu field.
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
      throw new Error('AI model did not return an output for treatment suggestion.');
    }
    return output;
  }
);
