import { Schema, Type } from "@google/genai";

export const schema: Schema = {
  description: "List of Hissab Expressions",
  type: Type.OBJECT,
  required: ["expressions"],
  properties: {
    expressions: {
      type: Type.ARRAY,
      description: "List of Hissab expressions",
      nullable: false,
      items: {
        type: Type.STRING,
      },
    },
  },
};
// src/index.ts
/*
import { CloudflareWorkersAIEmbeddings } from "@langchain/cloudflare";
import { CloudflareD1VectorStore } from "@langchain/community/vectorstores/cloudflare_d1";
import { Ai } from "@cloudflare/ai"; // Import Ai binding type

// Define the environment bindings expected by the Worker
export interface Env {
  DB: D1Database; // D1 binding
  AI: Ai; // Workers AI binding
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const embeddings = new CloudflareWorkersAIEmbeddings({
      binding: env.AI,
      modelName: "@cf/baai/bge-base-en-v1.5", // Or choose another model available in Workers AI
    });

    const store = new CloudflareD1VectorStore(embeddings, {
      db: env.DB,
      tableName: "vectors", // Match the table you created
    });

    // --- 1. Embedding and Storing Document Chunks (Example Route: POST /embed) ---
    if (url.pathname === "/embed" && request.method === "POST") {
      try {
        const { textChunks } = (await request.json()) as {
          textChunks: string[];
        };

        if (!Array.isArray(textChunks) || textChunks.length === 0) {
          return new Response(
            "Request body must contain a 'textChunks' array.",
            { status: 400 },
          );
        }

        console.log(`Adding ${textChunks.length} document chunks...`);

        // Use fromTexts to embed and store the chunks
        // This handles embedding generation internally
        await CloudflareD1VectorStore.fromTexts(
          textChunks,
          [], // Optional metadata array, parallel to textChunks
          embeddings,
          {
            db: env.DB,
            tableName: "vectors",
          },
        );

        console.log("Documents embedded and stored successfully.");
        return new Response("Documents embedded successfully.", {
          status: 200,
        });
      } catch (error: any) {
        console.error("Embedding error:", error);
        return new Response(`Error embedding documents: ${error.message}`, {
          status: 500,
        });
      }
    }

    // --- 2. Querying (Example Route: GET /query?q=...) ---
    if (url.pathname === "/query" && request.method === "GET") {
      const query = url.searchParams.get("q");

      if (!query) {
        return new Response("Missing query parameter 'q'", { status: 400 });
      }

      try {
        console.log(`Performing similarity search for query: "${query}"`);

        // Perform similarity search. This embeds the query and searches the DB.
        const results = await store.similaritySearch(
          query,
          4, // Number of results to return (k)
        );

        console.log("Search results:", results);

        // --- Optional: Prepare context for LLM ---
        // You would typically take the `pageContent` from the results
        // and format it into a prompt for your LLM.
        const contextForLLM = results
          .map((doc) => doc.pageContent)
          .join("\n\n---\n\n");
        console.log("\nContext to send to LLM:\n", contextForLLM);
        // TODO: Add your LLM call here using the contextForLLM

        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: any) {
        console.error("Query error:", error);
        return new Response(`Error during query: ${error.message}`, {
          status: 500,
        });
      }
    }

    // --- Default Route ---
    return new Response("Not Found. Use POST /embed or GET /query?q=", {
      status: 404,
    });
  },
};
*/
