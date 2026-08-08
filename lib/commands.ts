interface CommandResult {
  text: string;
  scratchThat?: boolean;
}

const COMMANDS: [RegExp, string][] = [
  [/\bperiod\b/gi, "."],
  [/\bcomma\b/gi, ","],
  [/\bnew\s+line\b/gi, "\n"],
  [/\bnew\s+paragraph\b/gi, "\n\n"],
  [/\bdash\b/gi, "\u2014"],
  [/\bcolon\b/gi, ":"],
  [/\bquestion\s*marks?\b/gi, "?"],
  [/\bexclamation\s*marks?\b/gi, "!"],
  [/\bexclamations?\b/gi, "!"],
];

const CAPS_PATTERN = /\bcaps\s+(\w+)/gi;
const SCRATCH_PATTERN = /\bscratch\s+that\b/i;
const QUOTE_PATTERN = /\bquote\b/gi;

let quoteToggle = false;

export function processCommands(text: string): CommandResult {
  let result = text;

  if (SCRATCH_PATTERN.test(result)) {
    return { text: "", scratchThat: true };
  }

  for (const [pattern, replacement] of COMMANDS) {
    result = result.replace(pattern, replacement);
  }

  result = result.replace(QUOTE_PATTERN, () => {
    quoteToggle = !quoteToggle;
    return quoteToggle ? "\u201C" : "\u201D";
  });

  result = result.replace(CAPS_PATTERN, (_match, word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  result = result.replace(/ +/g, " ");
  result = result.replace(/ ([.,:?!])/g, "$1");
  result = result.replace(/\u2014 +/g, "\u2014");
  result = result.replace(/ +\u2014/g, "\u2014");
  result = result.replace(/ \n/g, "\n");
  result = result.replace(/\n /g, "\n");
  result = result.trim();

  return { text: result };
}

export function resetQuoteToggle(): void {
  quoteToggle = false;
}

export function getCommandHints(): string[] {
  return [
    "period",
    "comma",
    "new line",
    "new paragraph",
    "caps X",
    "quote",
    "dash",
    "colon",
    "question mark",
    "exclamation",
    "scratch that",
  ];
}