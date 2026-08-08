import type { CustomSnippet } from "./types";

export function expandSnippets(
  text: string,
  snippets: CustomSnippet[]
): string {
  if (snippets.length === 0) return text;

  let result = text;
  for (const snippet of snippets) {
    if (!snippet.cue || !snippet.insertion) continue;
    const pattern = new RegExp(
      "\\b" + escapeRegex(snippet.cue) + "\\b",
      "gi"
    );
    if (pattern.test(text)) {
      if (isSnippetAppropriate(snippet, text)) {
        result = result.replace(pattern, snippet.insertion);
      }
    }
  }
  return result;
}

function isSnippetAppropriate(
  snippet: CustomSnippet,
  fullText: string
): boolean {
  const cue = snippet.cue.toLowerCase();
  const lowerText = fullText.toLowerCase();

  const teachingPatterns = [
    "setup " + cue,
    "set up " + cue,
    "configure " + cue,
    "connect " + cue + " to",
    "connect " + cue + " with",
    "link " + cue + " to",
    "link " + cue + " with",
    "what is " + cue,
    "about " + cue,
    "tell me about " + cue,
    "spelled",
    "spelling",
    "spell",
  ];

  for (const pattern of teachingPatterns) {
    if (lowerText.includes(pattern)) {
      return false;
    }
  }

  const insertPhrases = [
    "insert ",
    "paste ",
    "put ",
    "write ",
    "type ",
  ];

  const hasInsertContext = insertPhrases.some((p) => lowerText.includes(p + cue));

  const hasUrl = snippet.insertion.match(/^https?:\/\//);

  if (hasUrl && !hasInsertContext) {
    const urlContextPatterns = [
      "link",
      "url",
      "website",
      "address",
      "profile",
      "page",
    ];
    const hasExplicitUrlRequest = urlContextPatterns.some((p) =>
      lowerText.includes(p)
    );
    if (!hasExplicitUrlRequest) {
      return false;
    }
  }

  const cueEscaped = escapeRegex(cue);
  const domainPattern = new RegExp(
    "https?://[^\\s]*" + cueEscaped + "|" + cueEscaped + "\\.\\w+|\\w+\\." + cueEscaped,
    "i"
  );
  if (domainPattern.test(fullText) && !hasInsertContext) {
    return false;
  }

  return true;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}