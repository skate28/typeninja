"use client";

import Link from "next/link";
import type { TypingStats } from "@/lib/typing-utils";
import { RestartIcon } from "./Icons";

interface ResultsProps {
  stats: TypingStats;
  sessionSaved?: boolean;
  sessionSaveError?: string | null;
  onRestart: () => void;
}

export function Results({
  stats,
  sessionSaved,
  sessionSaveError,
  onRestart,
}: ResultsProps) {
  const isDbMissing = sessionSaveError?.includes("typing_sessions");

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-center">
        <div>
          <div className="text-sub text-sm mb-1">wpm</div>
          <div className="text-accent text-4xl sm:text-5xl font-mono">
            {stats.wpm}
          </div>
        </div>
        <div>
          <div className="text-sub text-sm mb-1">acc</div>
          <div className="text-main text-4xl sm:text-5xl font-mono">
            {stats.accuracy}%
          </div>
        </div>
        <div>
          <div className="text-sub text-sm mb-1">raw</div>
          <div className="text-main text-4xl sm:text-5xl font-mono">
            {stats.rawWpm}
          </div>
        </div>
        <div>
          <div className="text-sub text-sm mb-1">errors</div>
          <div className="text-error text-4xl sm:text-5xl font-mono">
            {stats.incorrectChars + stats.extraChars}
          </div>
        </div>
      </div>

      {sessionSaved ? (
        <p className="text-accent text-sm">
          Session saved!{" "}
          <Link href="/dashboard" className="underline hover:opacity-80">
            View dashboard
          </Link>
        </p>
      ) : sessionSaveError ? (
        <div className="text-center max-w-md space-y-2">
          <p className="text-error text-sm">
            Could not save session: {sessionSaveError}
          </p>
          {isDbMissing && (
            <p className="text-sub text-xs">
              The database table hasn&apos;t been created yet.{" "}
              <Link href="/setup" className="text-accent hover:underline">
                Run setup instructions
              </Link>
            </p>
          )}
        </div>
      ) : (
        <p className="text-sub text-sm">
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>{" "}
          to save your progress
        </p>
      )}

      <button
        onClick={onRestart}
        className="flex items-center gap-2 text-sub hover:text-main transition-colors mt-2"
        aria-label="Restart test"
      >
        <RestartIcon />
        <span className="text-sm">restart</span>
      </button>
    </div>
  );
}
