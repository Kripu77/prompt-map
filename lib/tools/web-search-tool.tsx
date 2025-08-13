import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';
import 'dotenv/config';

// Initialize Exa client
const exa = new Exa(process.env.EXA_API_KEY);

export const webSearchTool = tool({
  description: 'Search the web for current information on a specific query. Use this for weather, current events, recent data, or any time-sensitive information.',
  parameters: z.object({
    query: z.string().describe('The search query to run'),
  }),
  execute: async ({ query }) => {
    console.log(` Web search tool called with query: "${query}"`);

    try {
      if (!process.env.EXA_API_KEY) {
        console.error('Error: EXA_API_KEY not found in environment variables');
        console.error('Please add EXA_API_KEY to your .env.local file');
        return { 
          results: [], 
          error: 'Web search is not configured. Please add EXA_API_KEY to environment variables.' 
        };
      }

      console.log(`Searching web for: "${query}"`);
      const { results } = await exa.searchAndContents(query, {
        livecrawl: 'always',
        numResults: 5,
      });

      if (!results || results.length === 0) {
        console.log('No search results found');
        return { results: [], error: 'No results found for this query' };
      }

      console.log(`Found ${results.length} search results`);
      const formattedResults = results.map(r => ({
        title: r.title || '',
        url: r.url,
        content: r.text,
      }));
      
      console.log(`Returning ${formattedResults.length} formatted results`);
      return { results: formattedResults };
    } catch (error) {
      console.error('Error searching the web:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      return {
        results: [],
        error: `Web search failed: ${errorMessage}`,
      };
    }
  },
});