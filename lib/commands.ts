const COMMANDS: [RegExp, string][] = [
  [/\bperiod\b/gi, "."],
  [/\bcomma\b/gi, ","],
  [/\bnew\s+line\b/gi, "\n"],
  [/\bnew\s+paragraph\b/gi, "\n\n"],
];

const CAPS_PATTERN = /\bcaps\s+(\w+)/gi;

export function processCommands(text: string): string {
  let result = text;

  for (const [pattern, replacement] of COMMANDS) {
    result = result.replace(pattern, replacement);
  }

  result = result.replace(CAPS_PATTERN, (_match, word: string) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  result = result.replace(/ +/g, " ");
  result = result.replace(/ ([.,])/g, "$1");
  result = result.replace(/ \n/g, "\n");
  result = result.replace(/\n /g, "\n");
  result = result.trim();

  return result;
}

export function getCommandHints(): string[] {
  return ["period", "comma", "new line", "new paragraph", "caps X"];
}
