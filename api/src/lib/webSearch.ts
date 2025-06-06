import { fetchPost } from "~lib/errors";

const searchInstructions = `
You art a web search engine assistant to get real time information from web related to weather, finance, stocks, 
currency rates, commodities, ETFs, metals etc. Find the relevant information based on the user's query and return it in the specified format.
Your answer should be concise and precise, and in one sentence. Do not provide any additional information or context outside of the specified format.
There may be multiple queries in the user's prompt, Each query/web search result can be separated by a new line.
`;

type SearchResult = {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    search_context_size: string;
    citation_tokens: number;
    num_search_queries: number;
    reasoning_tokens: number;
  };
  object: "chat.completion";
  choices: [
    {
      index: number;
      finish_reason: "stop";
      message: {
        content: string;
        role: "system";
      };
    },
  ];
  citations: string[];
  search_results: [
    {
      title: string;
      url: string;
      date: string;
    },
  ];
};

export async function webSearch(searchQueries: string[], apiToken: string) {
  if (searchQueries.length === 0) {
    throw new Error("No search queries provided");
  }
  if (searchQueries.length > 5) {
    throw new Error("Too many search queries provided, maximum is 5");
  }

  const searchResults = await Promise.all(
    searchQueries.map(async (query) => {
      const body = {
        model: "sonar",
        web_search_options: {
          search_context_size: "low",
        },
        messages: [
          { role: "system", content: searchInstructions },
          { role: "user", content: query },
        ],
      };

      const result = await fetchPost<SearchResult>(
        "https://api.perplexity.ai/chat/completions",
        body,
        {
          Authorization: `Bearer ${apiToken}`,
        },
      );
      if (!result || !result.choices) {
        return "Cannot find real time data for the query: " + query;
      }

      return result.choices.map((res) => res.message.content).join("\n");
    }),
  );

  return searchResults.join("\n");
}
