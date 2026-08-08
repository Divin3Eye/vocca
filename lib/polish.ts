import type { Settings } from "./types";

const POLISH_SYSTEM_PROMPT = `You are a precise dictation editor. A user is speaking, and their raw speech has stumbles, corrections, and spoken punctuation. Produce the final clean text they meant.
Rules:
- Resolve self-corrections: if they say a value then correct it ("6 PM, no 9 PM", "on Tuesday — actually Wednesday"), keep ONLY the corrected value.
- Remove fillers and stumbles (um, uh, like, I mean).
- Apply proper punctuation, capitalization, and sentence breaks.
- Keep every real fact and number the speaker actually settled on. Never invent or drop information that wasn't corrected away.
- "The meeting" vs "meeting": keep the speaker's word choice; only fix obvious grammar that does not change meaning.
Output ONLY the cleaned text. No preamble, no quotes, no explanation.`;

export function getPolishSystemPrompt(): string {
  return POLISH_SYSTEM_PROMPT;
}

export async function polishText(
  text: string,
  settings: Settings
): Promise<string> {
  if (!settings.aiEndpoint || !settings.aiKey) {
    return localPolish(text);
  }

  try {
    const response = await fetch(settings.aiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.aiKey}`,
      },
      body: JSON.stringify({
        model: settings.aiModel,
        messages: [
          { role: "system", content: POLISH_SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) return localPolish(text);

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? localPolish(text);
  } catch {
    return localPolish(text);
  }
}

export function localPolish(text: string): string {
  let result = text.trim();

  result = result.replace(/\.\s*([a-z])/g, (_match, letter: string) => {
    return ". " + letter.toUpperCase();
  });

  result = result.replace(
    /(?:^|\.\s+)([a-z])/g,
    (_match, letter: string) => {
      return _match.replace(letter, letter.toUpperCase());
    }
  );

  result = result.replace(/\s+,/g, ",");
  result = result.replace(/\s+\./g, ".");
  result = result.replace(/\s{2,}/g, " ");

  return result;
}
