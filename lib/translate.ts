import type { Language, Settings } from "./types";

export async function translateText(
  text: string,
  sourceLanguage: Language,
  settings: Settings
): Promise<string> {
  if (!settings.aiEndpoint || !settings.aiKey) {
    throw new Error("AI key required for translation");
  }

  const targetLanguage = sourceLanguage === "hi-IN" ? "English" : "Hindi";
  const sourceLabel = sourceLanguage === "hi-IN" ? "Hindi" : "English";

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
          content: `Translate the following ${sourceLabel} text to ${targetLanguage}. Return only the translation, nothing else.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error("Translation request failed");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? text;
}
