import { getCurrentWordIndex } from "./words";

/** Global character index where a word starts in "word1 word2 word3" text */
export function getWordStartIndex(words: string[], wordIndex: number): number {
  let index = 0;
  for (let i = 0; i < wordIndex; i++) {
    index += words[i].length + 1;
  }
  return index;
}

export function getActiveWordIndex(typedInput: string): number {
  return getCurrentWordIndex(typedInput);
}

export function getCharStatus(
  globalIndex: number,
  typedInput: string,
  targetText: string
): "untyped" | "correct" | "incorrect" {
  if (globalIndex >= typedInput.length) return "untyped";
  if (globalIndex >= targetText.length) return "incorrect";
  return typedInput[globalIndex] === targetText[globalIndex]
    ? "correct"
    : "incorrect";
}
