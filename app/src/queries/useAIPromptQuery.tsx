import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AIResponseType } from "../../../lib/types/AIResponse.ts";
import { useContext, useEffect } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useAIPromptQuery(
  prompt: string,
  insertText: (text: string) => void,
) {
  const queryClient = useQueryClient();
  const { session } = useContext(SessionContext);
  const AIResponse = useQuery<AIResponseType>({
    queryKey: ["AIResponse", prompt],
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    queryFn: async () => {
      if (prompt.length === 0) return;
      const response = await fetch(`${BACKEND_URL}/user/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          Refresh: session?.refresh_token || "",
        },
        body: JSON.stringify({ prompt: prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch AI response" + response.status);
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (AIResponse.data) {
      insertText(
        `[[${prompt.trim().split("\n").join("]]\n[[")}]]\n${AIResponse.data.AIResponse.expressions.join("\n")}`,
      );

      queryClient.removeQueries({ queryKey: ["AIResponse", prompt] });
      return;
    }
    if (AIResponse.error) {
      queryClient.removeQueries({ queryKey: ["AIResponse", prompt] });
      return;
    }
  }, [AIResponse.data, AIResponse.error, insertText, prompt, queryClient]);

  return AIResponse;
}
