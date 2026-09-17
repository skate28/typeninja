"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimeOption } from "@/lib/typing-utils";
import { useTypingTest } from "@/hooks/useTypingTest";
import { GlobeIcon, RestartIcon, SettingsIcon } from "./Icons";
import { TimeSelector } from "./TimeSelector";
import { WordDisplay } from "./WordDisplay";
import { Results } from "./Results";

export function TypingTest() {
  const [duration, setDuration] = useState<TimeOption>(30);
  const {
    phase,
    words,
    targetText,
    typedInput,
    timeLeft,
    stats,
    liveStats,
    isReady,
    sessionSaved,
    sessionSaveError,
    handleInput,
    resetTest,
  } = useTypingTest(duration);

  const inputRef = useRef<HTMLInputElement>(null);
  const tabPressedRef = useRef(false);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput, phase]);

  const handleDurationChange = (time: TimeOption) => {
    if (phase === "idle") {
      setDuration(time);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      tabPressedRef.current = true;
      return;
    }

    if (e.key === "Enter" && tabPressedRef.current) {
      e.preventDefault();
      tabPressedRef.current = false;
      resetTest();
      return;
    }

    tabPressedRef.current = false;

    if (phase === "finished") return;

    if (e.key === "Backspace") {
      e.preventDefault();
      handleInput(typedInput.slice(0, -1));
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      handleInput(typedInput + e.key);
    }
  };

  const isActive = phase === "active" || phase === "idle";

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-8">
      {/* Mode & time selectors */}
      <div className="flex items-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-4 text-sub">
          <button className="text-accent underline underline-offset-4">
            time
          </button>
          <button className="hover:text-main transition-colors" disabled>
            words
          </button>
          <button className="hover:text-main transition-colors" disabled>
            quote
          </button>
          <button className="hover:text-main transition-colors" disabled>
            zen
          </button>
          <button className="hover:text-main transition-colors" disabled>
            custom
          </button>
        </div>
        <div className="h-4 w-px bg-sub/30 hidden sm:block" />
        <TimeSelector
          selected={duration}
          onSelect={handleDurationChange}
          disabled={phase !== "idle"}
        />
      </div>

      {/* Timer / live stats */}
      {phase === "active" && (
        <div className="flex items-center gap-8 mb-6 text-sub text-sm font-mono">
          <span className="text-accent text-3xl">{timeLeft}</span>
          {liveStats && (
            <>
              <span>
                <span className="text-sub">wpm </span>
                <span className="text-main">{liveStats.wpm}</span>
              </span>
              <span>
                <span className="text-sub">acc </span>
                <span className="text-main">{liveStats.accuracy}%</span>
              </span>
            </>
          )}
        </div>
      )}

      {phase === "idle" && (
        <div className="text-accent text-3xl font-mono mb-6">{duration}</div>
      )}

      {/* Test settings button */}
      {phase !== "finished" && (
        <button
          className="flex items-center gap-2 text-sub hover:text-accent text-sm mb-6 px-4 py-2 rounded-lg bg-bg-elevated border border-white/5 transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
          test settings
        </button>
      )}

      {/* Results or typing area */}
      {phase === "finished" && stats ? (
        <Results
          stats={stats}
          sessionSaved={sessionSaved}
          sessionSaveError={sessionSaveError}
          onRestart={resetTest}
        />
      ) : (
        <div
          className="w-full max-w-4xl cursor-text"
          onClick={focusInput}
        >
          <div className="flex items-center gap-2 text-sub text-sm mb-4">
            <GlobeIcon />
            <span>english</span>
          </div>

          {isReady ? (
            <WordDisplay
              words={words}
              targetText={targetText}
              typedInput={typedInput}
              isActive={isActive}
            />
          ) : (
            <div
              className="font-mono text-2xl sm:text-3xl leading-relaxed text-sub/30 select-none"
              aria-hidden="true"
            >
              loading words...
            </div>
          )}

          <button
            onClick={resetTest}
            className="mt-6 text-sub hover:text-main transition-colors"
            aria-label="Restart test"
          >
            <RestartIcon />
          </button>
        </div>
      )}

      {/* Hidden input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        className="sr-only"
        value={typedInput}
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Keyboard shortcuts hint */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sub text-xs">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-white/5 text-main">tab</kbd>
          {" + "}
          <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-white/5 text-main">
            enter
          </kbd>
          {" "}- restart test
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-white/5 text-main">
            escape
          </kbd>
          {" "}or{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-white/5 text-main">
            ctrl
          </kbd>
          {" + "}
          <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-white/5 text-main">
            shift
          </kbd>
          {" + "}
          <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-white/5 text-main">p</kbd>
          {" "}- command line
        </span>
      </div>
    </main>
  );
}
