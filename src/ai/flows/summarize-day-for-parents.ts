'use server';
/**
 * @fileOverview Summarizes the day's activities for parents in a brief message, in both Arabic and French.
 *
 * - summarizeDayForParents - A function to generate the summary.
 * - SummarizeDayForParentsInput - The input type for the function.
 * - SummarizeDayForParentsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDayForParentsInputSchema = z.object({
  activities: z
    .string()
    .describe("A detailed description of the day's activities."),
});

export type SummarizeDayForParentsInput = z.infer<typeof SummarizeDayForParentsInputSchema>;

const SummarizeDayForParentsOutputSchema = z.object({
  summaryArabic: z.string().describe('A concise summary of the day for parents in Arabic (3-5 sentences).'),
  summaryFrench: z.string().describe('A concise summary of the day for parents in French (3-5 sentences).'),
});

export type SummarizeDayForParentsOutput = z.infer<typeof SummarizeDayForParentsOutputSchema>;

export async function summarizeDayForParents(
  input: SummarizeDayForParentsInput
): Promise<SummarizeDayForParentsOutput> {
  return summarizeDayForParentsFlow(input);
}

const summarizeDayForParentsPrompt = ai.definePrompt({
  name: 'summarizeDayForParentsPrompt',
  input: {schema: SummarizeDayForParentsInputSchema},
  output: {schema: SummarizeDayForParentsOutputSchema},
  prompt: `You are a helpful teacher. Based on the provided activities, create a short, informative, and positive summary for parents (3-5 sentences).

Provide the response in both Arabic and French.
Provide ONLY the summary, without any introduction or conclusion.

Activities: {{{activities}}}`,
});

const summarizeDayForParentsFlow = ai.defineFlow(
  {
    name: 'summarizeDayForParentsFlow',
    inputSchema: SummarizeDayForParentsInputSchema,
    outputSchema: SummarizeDayForParentsOutputSchema,
  },
  async input => {
    const {output} = await summarizeDayForParentsPrompt(input);
    return output!;
  }
);
