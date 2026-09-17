import type { TypingStats } from "@/lib/typing-utils";
import type { SessionRecord } from "@/lib/dashboard-stats";
import { createClient } from "./client";

export interface SaveSessionInput {
  durationSeconds: number;
  stats: TypingStats;
}

export type SaveSessionResult =
  | { success: true }
  | { error: string };

export async function saveTypingSession(
  input: SaveSessionInput
): Promise<SaveSessionResult> {
  const response = await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    return { error: data.error ?? "Failed to save session" };
  }

  return { success: true };
}

export async function checkDatabaseReady(): Promise<{
  ready: boolean;
  error?: string;
}> {
  try {
    const response = await fetch("/api/db-status");
    return await response.json();
  } catch {
    return { ready: false, error: "Could not reach server" };
  }
}

export async function fetchAllSessions(): Promise<SessionRecord[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("typing_sessions")
    .select("id, wpm, raw_wpm, accuracy, duration_seconds, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: true });

  if (error || !data) return [];
  return data;
}
