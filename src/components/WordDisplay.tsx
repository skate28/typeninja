"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  getActiveWordIndex,
  getCharStatus,
  getWordStartIndex,
} from "@/lib/word-layout";

interface WordDisplayProps {
  words: string[];
  targetText: string;
  typedInput: string;
  isActive: boolean;
}

const VISIBLE_LINES = 3;

export function WordDisplay({
  words,
  targetText,
  typedInput,
  isActive,
}: WordDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);

  const activeWordIndex = getActiveWordIndex(typedInput);
  const cursorGlobalIndex = typedInput.length;

  const measureLineHeight = useCallback(() => {
    const content = contentRef.current;
    if (!content) return 0;

    const computed = window.getComputedStyle(content);
    const fontSize = parseFloat(computed.fontSize);
    const lineHeightPx = parseFloat(computed.lineHeight);
    return Number.isNaN(lineHeightPx) ? fontSize * 1.5 : lineHeightPx;
  }, []);

  const updateScrollPosition = useCallback(() => {
    const activeWord = activeWordRef.current;
    const lh = measureLineHeight();
    if (lh <= 0) return;

    if (!activeWord || !isActive || typedInput.length === 0) {
      setScrollOffset(0);
      return;
    }

    // Derive scroll from active word line so backspace scrolls back up
    const activeLine = Math.floor(activeWord.offsetTop / lh);
    setScrollOffset(Math.max(0, activeLine * lh));
  }, [isActive, measureLineHeight, typedInput.length]);

  useEffect(() => {
    if (typedInput.length === 0) {
      setScrollOffset(0);
    }
  }, [typedInput.length]);

  useLayoutEffect(() => {
    const lh = measureLineHeight();
    setLineHeight(lh);
    updateScrollPosition();
  }, [activeWordIndex, isActive, typedInput, words.length, measureLineHeight, updateScrollPosition]);

  useEffect(() => {
    const handleResize = () => {
      const lh = measureLineHeight();
      setLineHeight(lh);
      updateScrollPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [measureLineHeight, updateScrollPosition]);

  const viewportHeight =
    lineHeight > 0 ? lineHeight * VISIBLE_LINES : undefined;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: viewportHeight }}
      aria-label="Typing test words"
    >
      <div
        ref={contentRef}
        className="font-mono text-2xl sm:text-3xl leading-[1.5] tracking-wide select-none transition-transform duration-125 ease-out"
        style={{
          transform:
            scrollOffset > 0 ? `translateY(-${scrollOffset}px)` : undefined,
        }}
      >
        {words.map((word, wordIndex) => {
          const wordStart = getWordStartIndex(words, wordIndex);
          const isActiveWord = wordIndex === activeWordIndex;
          const isPastWord = wordIndex < activeWordIndex;

          return (
            <span
              key={`${wordIndex}-${word}`}
              ref={isActiveWord ? activeWordRef : undefined}
              className={`inline-block mr-[0.5ch] ${
                isPastWord ? "text-main" : ""
              }`}
            >
              {word.split("").map((targetChar, charIndex) => {
                const globalIndex = wordStart + charIndex;
                const status = getCharStatus(
                  globalIndex,
                  typedInput,
                  targetText
                );
                const isCursor =
                  isActive && globalIndex === cursorGlobalIndex;
                const hasBeenTyped = globalIndex < typedInput.length;
                const displayChar = hasBeenTyped
                  ? typedInput[globalIndex]
                  : targetChar;

                let className = "text-sub";
                if (status === "correct") className = "text-main";
                if (status === "incorrect")
                  className = "text-error underline decoration-error";

                return (
                  <span key={charIndex} className="relative">
                    {isCursor && (
                      <span
                        className="absolute left-0 top-[0.1em] w-[2px] h-[1.3em] bg-accent animate-pulse"
                        aria-hidden="true"
                      />
                    )}
                    <span className={className}>
                      {displayChar === " " ? "\u00A0" : displayChar}
                    </span>
                  </span>
                );
              })}
              {wordIndex < words.length - 1 && (() => {
                const spaceIndex = wordStart + word.length;
                const status = getCharStatus(
                  spaceIndex,
                  typedInput,
                  targetText
                );
                const isCursor =
                  isActive && spaceIndex === cursorGlobalIndex;
                const hasBeenTyped = spaceIndex < typedInput.length;
                const displayChar = hasBeenTyped
                  ? typedInput[spaceIndex]
                  : " ";

                let className = "text-sub";
                if (status === "correct") className = "text-main";
                if (status === "incorrect")
                  className = "text-error underline decoration-error";

                return (
                  <span className="relative">
                    {isCursor && (
                      <span
                        className="absolute left-0 top-[0.1em] w-[2px] h-[1.3em] bg-accent animate-pulse"
                        aria-hidden="true"
                      />
                    )}
                    <span className={className}>
                      {displayChar === " " ? "\u00A0" : displayChar}
                    </span>
                  </span>
                );
              })()}
            </span>
          );
        })}
        {typedInput.length > targetText.length &&
          typedInput
            .slice(targetText.length)
            .split("")
            .map((char, i) => (
              <span
                key={`extra-${i}`}
                className="text-error underline decoration-error"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
        {isActive && cursorGlobalIndex >= targetText.length && (
          <span
            className="inline-block w-[2px] h-[1.3em] bg-accent align-middle animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
