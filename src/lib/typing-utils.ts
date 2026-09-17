export type CharStatus = "untyped" | "correct" | "incorrect" | "extra";

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  totalTyped: number;
}

export const TIME_OPTIONS = [30, 60, 90, 120] as const;
export type TimeOption = (typeof TIME_OPTIONS)[number];

export function calculateWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((correctChars / 5) / minutes);
}

export function calculateRawWpm(totalChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return Math.round((totalChars / 5) / minutes);
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

export function buildStats(
  correctChars: number,
  incorrectChars: number,
  extraChars: number,
  elapsedMs: number
): TypingStats {
  const totalTyped = correctChars + incorrectChars + extraChars;
  return {
    wpm: calculateWpm(correctChars, elapsedMs),
    rawWpm: calculateRawWpm(totalTyped, elapsedMs),
    accuracy: calculateAccuracy(correctChars, totalTyped),
    correctChars,
    incorrectChars,
    extraChars,
    totalTyped,
  };
}
