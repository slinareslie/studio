'use server';

/**
 * @fileOverview This file defines a Genkit flow to analyze trending issues from alerts.
 *
 * - analyzeTrendingIssues - Analyzes alert descriptions to identify top 5 trending keywords.
 * - AnalyzeTrendingIssuesInput - The input type for the analyzeTrendingIssues function (empty object).
 * - AnalyzeTrendingIssuesOutput - The return type for the analyzeTrendingIssues function, containing the top keywords.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTrendingIssuesInputSchema = z.object({});
export type AnalyzeTrendingIssuesInput = z.infer<typeof AnalyzeTrendingIssuesInputSchema>;

const AnalyzeTrendingIssuesOutputSchema = z.object({
  topKeywords: z.array(z.string()).describe('The top 5 trending keywords from the alert descriptions.'),
});
export type AnalyzeTrendingIssuesOutput = z.infer<typeof AnalyzeTrendingIssuesOutputSchema>;

export async function analyzeTrendingIssues(
  input: AnalyzeTrendingIssuesInput
): Promise<AnalyzeTrendingIssuesOutput> {
  return analyzeTrendingIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTrendingIssuesPrompt',
  input: {schema: AnalyzeTrendingIssuesInputSchema},
  output: {schema: AnalyzeTrendingIssuesOutputSchema},
  prompt: `You are an AI assistant tasked with identifying the top 5 trending keywords from a collection of alert descriptions related to the city of Tacna. Analyze the following descriptions and extract the most relevant keywords, ensuring they reflect the prevalent issues or concerns mentioned.

Alert Descriptions: {{{alertDescriptions}}}

Identify and return the top 5 keywords that best represent the trending issues.

Output the keywords as an array of strings.

For Example:
{
"topKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`,
});

const analyzeTrendingIssuesFlow = ai.defineFlow(
  {
    name: 'analyzeTrendingIssuesFlow',
    inputSchema: AnalyzeTrendingIssuesInputSchema,
    outputSchema: AnalyzeTrendingIssuesOutputSchema,
  },
  async input => {
    // Fetch alert descriptions from the database.
    const alertDescriptions = await getAlertDescriptions();

    const {output} = await prompt({
      ...input,
      alertDescriptions: JSON.stringify(alertDescriptions),
    });
    return output!;
  }
);

async function getAlertDescriptions(): Promise<string[]> {
  // TODO: Implement fetching alert descriptions from Firestore.
  // This is a placeholder implementation.
  return [
    'Infrastructure damage due to recent earthquake.',
    'Environmental pollution from factory discharge.',
    'Security concerns in downtown Tacna after dark.',
    'Noise complaints near the stadium during events.',
    'Public services disruption due to water pipeline burst.',
    'Infrastructure damage on the main road.',
    'Environmental pollution affecting local wildlife.',
    'Security incidents reported near schools.',
    'Noise levels exceeding limits in residential areas.',
    'Public services delayed due to strike.',
  ];
}
