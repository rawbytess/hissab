import { useAuth } from "@/components/user/auth/AuthProvider.tsx";
import { aicache } from "@/lib/cache.ts";
import { BACKEND_URL, fetchPost } from "@/lib/utils.ts";
import { CustomError, run } from "../../../lib/errors.ts";
import {
  getMaxCharacterLimit,
  isPremiumUser,
} from "../../../lib/getPremiumStatus.ts";
import type {
  AIFormatResponseType,
  AIRequest,
} from "../../../lib/types/AITypes.ts";
import {
  type ProductNames,
  userMetadata,
} from "../../../lib/types/userMetadata.ts";

export async function getAIResult(
  req: AIRequest,
  isAuthenticated: boolean,
  isPremium: ProductNames | null,
) {
  if (!isAuthenticated)
    throw new CustomError(
      "NotLoggedIn",
      "No session found",
      "Subscribe to use AI features",
    );

  if (!isPremium)
    throw new CustomError(
      "NotSubscribed",
      "User not subscribed",
      "Subscribe to use AI features",
    );

  if (req.prompt.length === 0)
    throw new CustomError("EmptyPrompt", "Empty Prompt", "");

  const maxPromptLength = getMaxCharacterLimit(isPremium);

  if (req.prompt.length > maxPromptLength)
    req.prompt = req.prompt.substring(0, maxPromptLength);
  const cacheResult = aicache.get(req.prompt);

  if (cacheResult) {
    if (cacheResult.error)
      throw new CustomError(
        "FetchResponse",
        cacheResult.error,
        cacheResult.error,
      );
    return cacheResult;
  }

  const responseResult = await run(fetchPost(`${BACKEND_URL}/user/ai`, req));
  if (responseResult.failed) {
    if (req.inline)
      aicache.set(req.prompt, {
        naturalAnswer: "",
        expressions: [],
        error: responseResult.error.userMessage,
      });
    throw new CustomError(
      "FetchResponse",
      responseResult.error.message,
      responseResult.error.userMessage,
    );
  }
  const AIResponse = responseResult.data as AIFormatResponseType;
  if (req.inline)
    aicache.set(req.prompt, {
      naturalAnswer: AIResponse.naturalAnswer,
      expressions: AIResponse.expressions,
      error: null,
    });
  return AIResponse;
}
