import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AIResponseType } from "../../../lib/types/AIResponse.ts";
import { useContext, useEffect } from "react";
import { supabase } from "@/lib/supabase/client.ts";
import { aicache } from "@/lib/cache.ts";
import { isPremiumUser } from "../../../lib/getPremiumStatus.ts";
import { userMetadata } from "../../../lib/types/userMetadata.ts";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { chats } from "@/lib/editor/chatPromptWidget.ts";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useAIPromptQuery(
  prompt: string,
  insertText: (text: string) => void,
) {
  const queryClient = useQueryClient();
  const { currentPage, updateNote } = useContext(PageContext);

  const AIResponse = useQuery<AIResponseType>({
    queryKey: ["AIResponse", prompt],
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    queryFn: () => getAIResult(prompt),
  });

  useEffect(() => {
    if (AIResponse.data) {
      if (currentPage?.type === "chat") {
        updateNote(currentPage.id, "", "chat", {
          content: AIResponse.data.AIResponse.naturalAnswer,
          expressions: AIResponse.data.AIResponse.expressions,
          createdAt: Date.now(),
          role: "hissab",
        });
      }
      // editorOperations.insertText(`[[${prompt}]]`);
      queryClient.removeQueries({ queryKey: ["AIResponse", prompt] });
      return;
    }
    if (AIResponse.error) {
      queryClient.removeQueries({ queryKey: ["AIResponse", prompt] });
      return;
    }
  }, [
    AIResponse.data,
    AIResponse.error,
    currentPage?.type,
    insertText,
    queryClient,
  ]);

  return AIResponse;
}

export async function getAIResult(prompt: string) {
  const { data, error } = await supabase.auth.getSession();
  if (!data || !data.session || !data.session.user)
    throw new Error("No session found");

  if (!isPremiumUser(data.session.user.user_metadata as userMetadata))
    throw new Error("Not a premium user");

  if (prompt.length === 0) {
    throw new Error("Empty prompt");
  }
  const cacheResult = aicache.get(prompt);
  if (cacheResult) {
    return {
      AIResponse: {
        expressions: cacheResult.expressions,
      },
    };
  }
  if (error) {
    throw new Error("Failed to get session" + error.message);
  }
  const response = await fetch(`${BACKEND_URL}/user/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data?.session?.access_token}`,
      Refresh: data?.session?.refresh_token || "",
    },
    body: JSON.stringify({ prompt: prompt }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch AI response" + response.status);
  }
  const AIResponse = (await response.json()) as AIResponseType;
  aicache.set(prompt, {
    expressions: AIResponse.AIResponse.expressions,
    type: "inline",
  });
  return AIResponse;
}
