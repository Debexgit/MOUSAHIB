'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating activity ideas based on a topic, in both Arabic and French.
 *
 * It includes:
 * - `generateActivityIdeas`: The main function to call for generating activity ideas.
 * - `GenerateActivityIdeasInput`: The input type for the `generateActivityIdeas` function.
 * - `GenerateActivityIdeasOutput`: The output type for the `generateActivityIdeas` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateActivityIdeasInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate activity ideas.'),
});
export type GenerateActivityIdeasInput = z.infer<typeof GenerateActivityIdeasInputSchema>;

const GenerateActivityIdeasOutputSchema = z.object({
  activityIdeasArabic: z
    .string()
    .describe('A list of 3-4 activity ideas related to the topic, in Arabic.'),
  activityIdeasFrench: z
    .string()
    .describe('A list of 3-4 activity ideas related to the topic, in French.'),
});
export type GenerateActivityIdeasOutput = z.infer<typeof GenerateActivityIdeasOutputSchema>;

export async function generateActivityIdeas(
  input: GenerateActivityIdeasInput
): Promise<GenerateActivityIdeasOutput> {
  return generateActivityIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateActivityIdeasPrompt',
  input: {schema: GenerateActivityIdeasInputSchema},
  output: {schema: GenerateActivityIdeasOutputSchema},
  prompt: `You are an expert in early childhood education. Generate a list of 3-4 creative and engaging activity ideas for children based on the following topic.

Provide the response in both Arabic and French.
Provide ONLY the list of activities, without any introduction or conclusion.

Topic: {{{topic}}}
`,
});

const generateActivityIdeasFlow = ai.defineFlow(
  {
    name: 'generateActivityIdeasFlow',
    inputSchema: GenerateActivityIdeasInputSchema,
    outputSchema: GenerateActivityIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
