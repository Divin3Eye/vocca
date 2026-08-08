import type { Settings, Mode } from "./types";

const BASE_POLISH_RULES = `Rules:
- Resolve self-corrections: if they say a value then correct it ("6 PM, no 9 PM", "on Tuesday — actually Wednesday"), keep ONLY the corrected value.
- Remove fillers and stumbles (um, uh, like, I mean).
- Apply proper punctuation, capitalization, and sentence breaks.
- Keep every real fact and number the speaker actually settled on. Never invent or drop information that wasn't corrected away.
- "The meeting" vs "meeting": keep the speaker's word choice; only fix obvious grammar that does not change meaning.`;

const FORMAT_PROMPTS: Record<Mode, string> = {
  instant: `You are a precise dictation editor. A user is speaking, and their raw speech has stumbles, corrections, and spoken punctuation. Produce the final clean text they meant.
${BASE_POLISH_RULES}
Output ONLY the cleaned text. No preamble, no quotes, no explanation.`,

  email: `You are an email writing assistant. A user is dictating an email. Transform their raw speech into a clean, professional email with proper greeting, body, and closing. Keep the meaning and facts exactly as spoken.
${BASE_POLISH_RULES}
- Structure as a proper email: greeting if implied, clear body paragraphs, professional closing.
- Use appropriate email tone: warm but professional.
- Format with proper paragraph breaks for readability.
Output ONLY the formatted email text. No preamble, no quotes, no explanation.`,

  chat: `You are a casual message assistant. A user is dictating a short chat message. Transform their raw speech into a brief, natural, message-ready text. No formality, just flow.
${BASE_POLISH_RULES}
- Keep it short and punchy — chat messages, not essays.
- Casual tone, no greeting/closing overhead.
- Preserve the speaker's voice and energy.
Output ONLY the message text. No preamble, no quotes, no explanation.`,

  note: `You are a note-taking assistant. A user is dictating notes. Transform their raw speech into clean, bullet-friendly notes that capture ideas before they evaporate.
${BASE_POLISH_RULES}
- Organize into bullet points or short sections where appropriate.
- Keep it scannable — headers, bullets, brief sentences.
- Preserve every idea and fact the speaker mentioned.
Output ONLY the notes. No preamble, no quotes, no explanation.`,

  code: `You are a code dictation assistant. A user is dictating code in plain English. Transform their spoken words into properly formatted code blocks.
${BASE_POLISH_RULES}
- Detect the programming language when possible from context.
- Format as fenced code blocks with language tag.
- Translate plain-English code descriptions into actual code syntax.
- If the user describes logic, produce pseudocode or the most likely target language.
Output ONLY the code block(s). No preamble, no quotes, no explanation.`,
};

export function getPolishSystemPrompt(mode: Mode = "instant"): string {
  return FORMAT_PROMPTS[mode] ?? FORMAT_PROMPTS.instant;
}

export async function polishText(
  text: string,
  settings: Settings,
  mode: Mode = "instant",
  protectedTerms?: string[]
): Promise<string> {
  if (!settings.aiEndpoint || !settings.aiKey) {
    return localPolish(text);
  }

  let systemPrompt = getPolishSystemPrompt(mode);

  if (protectedTerms && protectedTerms.length > 0) {
    systemPrompt += `\n\nIMPORTANT — Protected terms: The user has added these words to their dictionary. You MUST keep them EXACTLY as written, with the same capitalization and spelling. Never correct, change, or alter these words: ${protectedTerms.join(", ")}`;
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
          { role: "system", content: systemPrompt },
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