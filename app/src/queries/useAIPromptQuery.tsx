import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AIFormatResponseType, AIRequest } from "../../../lib/types/AITypes.ts";
import { useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase/client.ts";
import { aicache } from "@/lib/cache.ts";
import {
  getMaxCharacterLimit,
  isPremiumUser,
} from "../../../lib/getPremiumStatus.ts";
import { userMetadata } from "../../../lib/types/userMetadata.ts";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { CustomError, fetchPost, run } from "../../../lib/errors.ts";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useAIPromptQuery(
  req: AIRequest,
  insertText: (text: string) => void,
) {
  const queryClient = useQueryClient();
  const { currentPage, updateNote } = useContext(PageContext);

  const AIResponse = useQuery<AIFormatResponseType, CustomError>({
    queryKey: ["AIResponse", req.prompt],
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    queryFn: () => getAIResult(req),
  });

  useEffect(() => {
    if (AIResponse.data) {
      if (currentPage?.type === "chat") {
        updateNote(currentPage.id, "", "chat", {
          content: AIResponse.data.naturalAnswer,
          expressions: AIResponse.data.expressions.map((x) => x.expression),
          createdAt: Date.now(),
          role: "hissab",
          error: false,
        });
      }
    } else if (AIResponse.error) {
      if (currentPage?.type === "chat") {
        updateNote(currentPage.id, "", "chat", {
          content: AIResponse.error.userMessage,
          expressions: [],
          createdAt: Date.now(),
          role: "hissab",
          error: true,
        });
      }
    }
    queryClient.removeQueries({ queryKey: ["AIResponse", prompt] });
    return;
  }, [
    AIResponse.data,
    AIResponse.error,
    currentPage?.type,
    insertText,
    queryClient,
  ]);

  return AIResponse;
}

export async function getAIResult(req: AIRequest) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data || !data.session || !data.session.user)
    throw new CustomError(
      "NotLoggedIn",
      error?.message ?? "No session found",
      "Please log in to use AI features",
    );

  if (!isPremiumUser(data.session.user.user_metadata as userMetadata))
    throw new CustomError(
      "NotSubscribed",
      "User not subscribed",
      "Please Subscribe to use AI features",
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
  aicache.set(req.prompt, {
    naturalAnswer: AIResponse.naturalAnswer,
    expressions: AIResponse.expressions,
    error: null,
  });
  return AIResponse;
}
