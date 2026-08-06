import { supabase } from "./supabase";

interface CallAIResult {
  content: string;
  data?: unknown;
}

interface CallAIOptions {
  mode: string;
  query?: string;
  conversation?: { role: string; content: string }[];
  subjects?: string[];
  goals?: string;
  hours_per_week?: number;
}

/**
 * Unified helper for calling the AI edge function.
 * Handles auth, fetch, error normalization, and response parsing.
 */
export async function callAI(options: CallAIOptions): Promise<CallAIResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const resp = await fetch(
    "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/ai-query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(options),
    }
  );

  const result = await resp.json();

  if (!resp.ok) {
    throw new Error(result.error || "The AI service is unavailable. Please try again.");
  }

  return {
    content: result.content || result.data || "",
    data: result.data ?? undefined,
  };
}