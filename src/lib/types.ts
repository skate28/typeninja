import type { TypingStats } from "./typing-utils";

/** Character-level typing state for a single position */
export interface CharState {
  char: string;
  status: "untyped" | "correct" | "incorrect" | "extra";
}

/** Snapshot of an active or completed typing session */
export interface TypingSession {
  id: string;
  userId?: string;
  words: string[];
  typedInput: string;
  durationSeconds: number;
  startedAt: number | null;
  endedAt: number | null;
  stats: TypingStats | null;
  isComplete: boolean;
}

/** Payload for future Supabase realtime sync */
export interface TypingSessionUpdate {
  sessionId: string;
  typedInput: string;
  cursorPosition: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  elapsedMs: number;
  wpm: number;
  accuracy: number;
  timestamp: number;
}

/** Future Supabase table shape */
export interface DbTypingSession {
  id: string;
  user_id: string | null;
  mode: "time";
  duration_seconds: number;
  words: string[];
  typed_input: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  correct_chars: number;
  incorrect_chars: number;
  extra_chars: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface DbTypingKeystroke {
  id: string;
  session_id: string;
  char: string;
  position: number;
  is_correct: boolean;
  timestamp: string;
}
