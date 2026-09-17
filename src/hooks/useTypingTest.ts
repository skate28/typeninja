"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appendWordsIfNeeded, generateInitialWords } from "@/lib/words";
import {
  buildStats,
  type TimeOption,
  type TypingStats,
} from "@/lib/typing-utils";
import type { TypingSessionUpdate } from "@/lib/types";
import { saveTypingSession } from "@/lib/supabase/sessions";
import { useTypingSessionSync } from "./useTypingSessionSync";

export type TestPhase = "idle" | "active" | "finished";

function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useTypingTest(duration: TimeOption) {
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [words, setWords] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [sessionSaveError, setSessionSaveError] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const typedInputRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFinishedRef = useRef(false);
  const targetText = useMemo(() => words.join(" "), [words]);

  typedInputRef.current = typedInput;

  const { syncUpdate, flushSession } = useTypingSessionSync(sessionId);

  const computeCharStats = useCallback(
    (input: string) => {
      let correct = 0;
      let incorrect = 0;
      let extra = 0;

      for (let i = 0; i < input.length; i++) {
        if (i >= targetText.length) {
          extra++;
        } else if (input[i] === targetText[i]) {
          correct++;
        } else {
          incorrect++;
        }
      }

      return { correct, incorrect, extra };
    },
    [targetText]
  );

  const finishTest = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const input = typedInputRef.current;
    const elapsed =
      startTimeRef.current !== null
        ? Date.now() - startTimeRef.current
        : 0;
    const { correct, incorrect, extra } = computeCharStats(input);
    const finalStats = buildStats(correct, incorrect, extra, elapsed);

    setStats(finalStats);
    setPhase("finished");
    flushSession();

    setSessionSaveError(null);
    saveTypingSession({
      durationSeconds: duration,
      stats: finalStats,
    }).then((result) => {
      if ("success" in result && result.success) {
        setSessionSaved(true);
      } else if ("error" in result) {
        setSessionSaveError(result.error);
      }
    });
  }, [computeCharStats, flushSession, duration]);

  const resetTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setWords(generateInitialWords());
    setTypedInput("");
    setTimeLeft(duration);
    setStats(null);
    setPhase("idle");
    setSessionId(null);
    setSessionSaved(false);
    setSessionSaveError(null);
    startTimeRef.current = null;
    hasFinishedRef.current = false;
  }, [duration]);

  const startTest = useCallback(() => {
    const id = createSessionId();
    setSessionId(id);
    startTimeRef.current = Date.now();
    setPhase("active");

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        if (prev === 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [finishTest]);

  const handleInput = useCallback(
    (value: string) => {
      if (phase === "finished") return;

      if (phase === "idle" && value.length > 0) {
        startTest();
      }

      if (phase === "idle" || phase === "active") {
        setWords((prev) => appendWordsIfNeeded(prev, value));
        setTypedInput(value);

        if (phase === "active" && sessionId && startTimeRef.current) {
          const { correct, incorrect, extra } = computeCharStats(value);
          const elapsed = Date.now() - startTimeRef.current;
          const currentStats = buildStats(correct, incorrect, extra, elapsed);

          const update: TypingSessionUpdate = {
            sessionId,
            typedInput: value,
            cursorPosition: value.length,
            correctChars: correct,
            incorrectChars: incorrect,
            extraChars: extra,
            elapsedMs: elapsed,
            wpm: currentStats.wpm,
            accuracy: currentStats.accuracy,
            timestamp: Date.now(),
          };
          syncUpdate(update);
        }
      }
    },
    [phase, sessionId, startTest, computeCharStats, syncUpdate]
  );

  const liveStats = useMemo(() => {
    if (phase !== "active" || startTimeRef.current === null) return null;
    const { correct, incorrect, extra } = computeCharStats(typedInput);
    const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
    return buildStats(correct, incorrect, extra, elapsed);
  }, [phase, typedInput, computeCharStats]);

  // Generate words only on the client to avoid SSR hydration mismatch
  useEffect(() => {
    setWords(generateInitialWords());
    setIsReady(true);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "idle") {
      setTimeLeft(duration);
    }
  }, [duration, phase]);

  return {
    phase,
    words,
    targetText,
    typedInput,
    timeLeft,
    duration,
    stats,
    liveStats,
    isReady,
    sessionSaved,
    sessionSaveError,
    handleInput,
    resetTest,
    finishTest,
  };
}
