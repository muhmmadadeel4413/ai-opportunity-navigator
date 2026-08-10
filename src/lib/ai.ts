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
 * Handles auth, fetch, errors, and response parsing.
 */
export async function callAI(
  options: CallAIOptions
): Promise<CallAIResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be signed in to use AI features.");
  }

  const resp = await fetch(
    "https://bficpbbezccjpdifzxek.supabase.co/functions/v1/ai-query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(options),
    }
  );

  const result = await resp.json();

  if (!resp.ok) {
    throw new Error(
      result.error ||
        "The AI service is unavailable. Please try again."
    );
  }

  let content = "";

  if (typeof result.content === "string") {
    content = result.content;
  } else if (result.data) {
    content = JSON.stringify(result.data);
  }

  return {
    content,
    data: result.data ?? undefined,
  };
}