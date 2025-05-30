import { AIFormatResponseType, AIRequest } from "../../../lib/types/AITypes.ts";
import { supabase } from "@/lib/supabase/client.ts";
import { aicache } from "@/lib/cache.ts";
import {
  getMaxCharacterLimit,
  isPremiumUser,
} from "../../../lib/getPremiumStatus.ts";
import { userMetadata } from "../../../lib/types/userMetadata.ts";
import { CustomError, fetchPost, run } from "../../../lib/errors.ts";
import { BACKEND_URL } from "@/lib/utils.ts";

export async function getAIResult(req: AIRequest) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data || !data.session || !data.session.user)
    throw new CustomError(
      "NotLoggedIn",
      error?.message ?? "No session found",
      "Subscribe to use AI features",
    );

  if (!isPremiumUser(data.session.user.user_metadata as userMetadata))
    throw new CustomError(
      "NotSubscribed",
      "User not subscribed",
      "Subscribe to use AI features",
    );

  if (req.prompt.length === 0)
    throw new CustomError("EmptyPrompt", "Empty Prompt", "");

  const maxPromptLength = getMaxCharacterLimit(
    data.session.user.user_metadata.subscription.product_name,
  );

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

  const responseResult = await run(
    fetchPost(`${BACKEND_URL}/user/ai`, req, {
      Authorization: `Bearer ${data?.session?.access_token}`,
      Refresh: data?.session?.refresh_token || "",
    }),
  );
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
