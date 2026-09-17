// Common English words used by Monkeytype-style typing tests
export const WORDS: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "person", "way", "order", "child", "seem", "state", "open", "hold", "turn", "stand",
  "never", "world", "life", "hand", "part", "place", "case", "week", "company", "system",
  "program", "question", "work", "government", "number", "night", "point", "home", "water", "room",
  "mother", "area", "money", "story", "fact", "month", "lot", "right", "study", "book",
  "eye", "job", "word", "business", "issue", "side", "kind", "head", "house", "service",
  "friend", "father", "power", "hour", "game", "line", "end", "member", "law", "car",
  "city", "name", "team", "minute", "idea", "kid", "body", "information", "back", "parent",
  "face", "others", "level", "office", "door", "health", "art", "war", "history", "party",
  "result", "change", "morning", "reason", "research", "girl", "guy", "moment", "air", "teacher",
  "force", "education", "foot", "boy", "age", "policy", "process", "music", "market", "sense",
  "nation", "plan", "college", "interest", "death", "experience", "effect", "use", "class", "control",
  "care", "field", "develop", "record", "mind", "love", "community", "data", "language", "food",
  "type", "free", "clear", "short", "low", "real", "leave", "reach", "remain", "sound",
  "small", "large", "next", "early", "young", "important", "few", "public", "bad", "same",
  "able", "human", "local", "sure", "something", "provide", "around", "national", "under", "always",
  "move", "tell", "try", "ask", "need", "feel", "become", "leave", "put", "mean",
  "keep", "let", "begin", "help", "talk", "turn", "start", "show", "hear", "play",
  "run", "move", "live", "believe", "bring", "happen", "write", "sit", "stand", "lose",
  "pay", "meet", "include", "continue", "set", "learn", "change", "lead", "understand", "watch",
  "follow", "stop", "create", "speak", "read", "allow", "add", "spend", "grow", "open",
  "walk", "win", "offer", "remember", "consider", "appear", "buy", "wait", "serve", "die",
  "send", "expect", "build", "stay", "fall", "cut", "reach", "kill", "remain", "suggest",
];

const INITIAL_WORD_COUNT = 80;
const WORD_BUFFER_SIZE = 50; // keep words ahead so new lines always have content
const WORD_APPEND_BATCH = 50;

export function generateWords(count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return result;
}

export function getCurrentWordIndex(typedInput: string): number {
  let index = 0;
  for (let i = 0; i < typedInput.length; i++) {
    if (typedInput[i] === " ") index++;
  }
  return index;
}

/** Append random words when the buffer ahead of the cursor runs low */
export function appendWordsIfNeeded(
  words: string[],
  typedInput: string
): string[] {
  const wordIndex = getCurrentWordIndex(typedInput);
  const wordsAhead = words.length - wordIndex;

  if (wordsAhead >= WORD_BUFFER_SIZE) {
    return words;
  }

  return [...words, ...generateWords(WORD_APPEND_BATCH)];
}

export function generateInitialWords(): string[] {
  return generateWords(INITIAL_WORD_COUNT);
}

export function wordsToText(words: string[]): string {
  return words.join(" ");
}
