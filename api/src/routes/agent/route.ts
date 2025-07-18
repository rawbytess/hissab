// src/index.ts
// This is the main file for your Cloudflare Worker.

import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";

// --- OpenAI-Compatible Type Definitions ---
// Based on the official OpenAI API documentation, now including multi-modal content.

type ContentPart =
	| { type: "text"; text: string }
	| {
			type: "image_url";
			image_url: { url: string; detail?: "low" | "high" | "auto" };
	  };

interface Message {
	role: "user" | "assistant" | "system";
	content: string | ContentPart[];
}

interface ChatCompletionRequest {
	model: string;
	messages: Message[];
	stream?: boolean;
	// Add other properties like temperature, max_tokens etc. as needed
}

interface ChatCompletion {
	id: string;
	object: "chat.completion";
	created: number;
	model: string;
	choices: {
		index: number;
		message: {
			role: "assistant";
			content: string;
		};
		finish_reason: "stop" | "length";
	}[];
	usage: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

interface ChatCompletionChunk {
	id: string;
	object: "chat.completion.chunk";
	created: number;
	model: string;
	choices: {
		index: number;
		delta: {
			role?: "assistant";
			content?: string;
		};
		finish_reason: "stop" | "length" | null;
	}[];
}

// --- Hono App Initialization ---

const app = new Hono();

// --- Middleware ---
// Add CORS middleware to allow requests from any origin.
// This is important for browser-based clients.
app.use("/v1/*", cors());

// --- Core API Endpoint ---

app.post("/v1/chat/completions", async (c) => {
	const contentType = c.req.header("Content-Type");
	let requestBody: ChatCompletionRequest;

	// --- Step 1: Parse the incoming request ---
	// The server now supports both 'application/json' and 'multipart/form-data'.
	if (contentType?.includes("multipart/form-data")) {
		const formData = await c.req.formData();
		const requestJsonPayload = formData.get("request"); // The main JSON payload
		const file = formData.get("file") as File | null; // The uploaded file

		if (!requestJsonPayload || typeof requestJsonPayload !== "string") {
			return c.json(
				{
					error:
						"Multipart request must include a 'request' field containing the JSON payload.",
				},
				400,
			);
		}

		try {
			requestBody = JSON.parse(requestJsonPayload);
		} catch (e) {
			return c.json({ error: "Invalid JSON in 'request' field." }, 400);
		}

		if (file) {
			// Convert the uploaded file to a base64 data URL.
			// This is the format required for multi-modal models like GPT-4o.
			const arrayBuffer = await file.arrayBuffer();
			// btoa is available in the Cloudflare Worker environment.
			const base64 = btoa(
				new Uint8Array(arrayBuffer).reduce(
					(data, byte) => data + String.fromCharCode(byte),
					"",
				),
			);
			const dataUrl = `data:${file.type};base64,${base64}`;

			// Find the last user message to append the image to.
			// This is a common pattern for multi-modal chat.
			const lastUserMessage = requestBody.messages
				.slice()
				.reverse()
				.find((m) => m.role === "user");

			if (lastUserMessage) {
				const imagePart: ContentPart = {
					type: "image_url",
					image_url: { url: dataUrl },
				};

				if (typeof lastUserMessage.content === "string") {
					// If content is a simple string, convert it to the array format.
					lastUserMessage.content = [
						{ type: "text", text: lastUserMessage.content },
						imagePart,
					];
				} else if (Array.isArray(lastUserMessage.content)) {
					// If content is already an array, just push the image part.
					lastUserMessage.content.push(imagePart);
				}
			} else {
				// Handle case where there's no user message (less common, but possible).
				console.warn(
					"File uploaded but no user message found to attach it to.",
				);
			}
		}
	} else {
		// Fallback for standard application/json requests (no file upload).
		requestBody = await c.req.json<ChatCompletionRequest>();
	}

	// --- Step 2: Process the request (streaming or non-streaming) ---
	const { stream, model, messages } = requestBody;
	const chatId = `chatcmpl-${crypto.randomUUID()}`;
	const created = Math.floor(Date.now() / 1000);

	// --- This is where you would call your actual AI model ---
	// The 'messages' variable now includes the image data if it was uploaded.
	// You can pass this directly to a multi-modal AI model.
	const hasImage = messages.some(
		(m) =>
			Array.isArray(m.content) && m.content.some((p) => p.type === "image_url"),
	);

	// We'll simulate a response that acknowledges the file upload.
	const simulatedResponse = hasImage
		? "I see you've uploaded an image. How can I help you with it?"
		: "Hello! I'm a Hono-powered AI assistant running on Cloudflare Workers. How can I help you today?";
	const responseWords = simulatedResponse.split(" ");
	// -----------------------------------------------------------

	if (stream) {
		// --- Handle Streaming Response ---
		return streamSSE(c, async (stream) => {
			// First, send the role
			const roleChunk: ChatCompletionChunk = {
				id: chatId,
				object: "chat.completion.chunk",
				created: created,
				model: model,
				choices: [
					{ index: 0, delta: { role: "assistant" }, finish_reason: null },
				],
			};
			await stream.writeSSE({ data: JSON.stringify(roleChunk) });

			// Stream the response word by word
			for (const word of responseWords) {
				const chunk: ChatCompletionChunk = {
					id: chatId,
					object: "chat.completion.chunk",
					created: created,
					model: model,
					choices: [
						{ index: 0, delta: { content: word + " " }, finish_reason: null },
					],
				};
				await stream.writeSSE({ data: JSON.stringify(chunk) });
				await stream.sleep(50); // Simulate generation delay
			}

			// Send the final chunk with the finish reason
			const finalChunk: ChatCompletionChunk = {
				id: chatId,
				object: "chat.completion.chunk",
				created: created,
				model: model,
				choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
			};
			await stream.writeSSE({ data: JSON.stringify(finalChunk) });

			// Signal the end of the stream
			await stream.writeSSE({ data: "[DONE]" });
		});
	} else {
		// --- Handle Non-Streaming Response ---
		const response: ChatCompletion = {
			id: chatId,
			object: "chat.completion",
			created: created,
			model: model,
			choices: [
				{
					index: 0,
					message: {
						role: "assistant",
						content: simulatedResponse,
					},
					finish_reason: "stop",
				},
			],
			// You should calculate token usage accurately based on your model
			usage: {
				prompt_tokens: 100, // Placeholder
				completion_tokens: 50, // Placeholder
				total_tokens: 150, // Placeholder
			},
		};

		return c.json(response);
	}
});

// --- Catch-all for 404s ---
app.notFound((c) => {
	return c.text("Not Found", 404);
});

export default app;
