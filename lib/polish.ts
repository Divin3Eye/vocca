import type { Settings } from "./types";

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
          {
            role: "system",
            content:
              "Fix punctuation, capitalization, and light fluency issues in the following dictated text. Do not change the meaning or wording. Return only the corrected text.",
          },
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
