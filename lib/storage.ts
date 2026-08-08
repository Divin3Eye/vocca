import type {
  Settings,
  DictationEntry,
  DictationRecord,
  DailyStats,
  CustomSnippet,
  HotkeyChord,
  LastDictation,
} from "./types";

const SETTINGS_KEY = "vocca_settings";
const HISTORY_KEY = "vocca_history";
const WORDS_KEY = "vocca_words";
const STATS_KEY = "vocca_stats";
const SNIPPETS_KEY = "vocca_snippets";
const LAST_DICTATION_KEY = "vocca_last";

const DEFAULT_HOTKEYS: Record<string, HotkeyChord> = {
  dictate: { keys: ["ctrl", " "] },
  dictatePolish: { keys: ["ctrl", "shift", " "] },
  dictateHindi: { keys: ["ctrl", "alt", " "] },
  reinsertLast: { keys: [] },
  toggleMic: { keys: ["ctrl", "m"] },
};

const DEFAULT_SETTINGS: Settings = {
  hotkeyEnabled: true,
  micButtonEnabled: true,
  mode: "instant",
  language: "en-US",
  translateEnabled: false,
  aiEndpoint: "https://opencode.ai/zen/v1",
  aiModel: "deepseek-v4-flash-free",
  aiKey: "",
  hotkeys: DEFAULT_HOTKEYS as Settings["hotkeys"],
};

const DEFAULT_SNIPPETS: CustomSnippet[] = [
  {
    id: "snip_linkedin",
    cue: "linkedin",
    insertion: "https://www.linkedin.com/in/divine-eye",
  },
  {
    id: "snip_email",
    cue: "my email",
    insertion: "admin@xohosting.in",
  },
];

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed.mode === "polish") parsed.mode = "email";
    if (!parsed.hotkeys) {
      parsed.hotkeys = { ...DEFAULT_HOTKEYS };
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadHistory(): DictationEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHistory(history: DictationEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addToHistory(entry: DictationEntry): DictationEntry[] {
  const history = loadHistory();
  const updated = [entry, ...history].slice(0, 50);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_KEY);
}

// --- My Words dictionary ---

export function loadWords(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WORDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveWords(words: string[]): void {
  if (typeof window === "undefined") return;
  const deduped = [...new Set(words.map((w) => w.trim()))].filter(Boolean);
  localStorage.setItem(WORDS_KEY, JSON.stringify(deduped));
}

export function addWord(word: string): string[] {
  const words = loadWords();
  const trimmed = word.trim();
  if (!trimmed) return words;
  if (words.some((w) => w.toLowerCase() === trimmed.toLowerCase())) return words;
  const updated = [...words, trimmed];
  saveWords(updated);
  return updated;
}

export function removeWord(word: string): string[] {
  const words = loadWords();
  const updated = words.filter((w) => w !== word);
  saveWords(updated);
  return updated;
}

// --- Custom Snippets ---

export function loadSnippets(): CustomSnippet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SNIPPETS_KEY);
    if (!raw) {
      saveSnippets(DEFAULT_SNIPPETS);
      return DEFAULT_SNIPPETS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SNIPPETS;
  }
}

export function saveSnippets(snippets: CustomSnippet[]): void {
  if (typeof window === "undefined") return;
  const filtered = snippets.filter((s) => s.cue.trim() && s.insertion.trim());
  const deduped: CustomSnippet[] = [];
  for (const s of filtered) {
    if (!deduped.some((d) => d.cue.toLowerCase() === s.cue.toLowerCase())) {
      deduped.push(s);
    }
  }
  const capped = deduped.slice(0, 50);
  localStorage.setItem(SNIPPETS_KEY, JSON.stringify(capped));
}

export function addSnippet(cue: string, insertion: string): CustomSnippet[] {
  const snippets = loadSnippets();
  const trimmedCue = cue.trim();
  const trimmedInsertion = insertion.trim();
  if (!trimmedCue || !trimmedInsertion) return snippets;
  if (snippets.some((s) => s.cue.toLowerCase() === trimmedCue.toLowerCase())) {
    return snippets;
  }
  const newSnippet: CustomSnippet = {
    id: "snip_" + Date.now(),
    cue: trimmedCue,
    insertion: trimmedInsertion,
  };
  const updated = [...snippets, newSnippet].slice(0, 50);
  saveSnippets(updated);
  return updated;
}

export function removeSnippet(id: string): CustomSnippet[] {
  const snippets = loadSnippets();
  const updated = snippets.filter((s) => s.id !== id);
  saveSnippets(updated);
  return updated;
}

export function updateSnippet(
  id: string,
  cue: string,
  insertion: string
): CustomSnippet[] {
  const snippets = loadSnippets();
  const updated = snippets.map((s) =>
    s.id === id ? { ...s, cue: cue.trim(), insertion: insertion.trim() } : s
  );
  saveSnippets(updated);
  return updated;
}

// --- Last Dictation ---

export function saveLastDictation(entry: LastDictation): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_DICTATION_KEY, JSON.stringify(entry));
}

export function loadLastDictation(): LastDictation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_DICTATION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// --- Dictation stats ---

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getRecords(): DictationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRecords(records: DictationRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(records));
}

function pruneRecords(records: DictationRecord[]): DictationRecord[] {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return records.filter((r) => r.timestamp >= cutoff);
}

export function recordDictation(wordCount: number, recordingMs: number): void {
  const records = pruneRecords(getRecords());
  records.push({
    date: todayKey(),
    wordCount,
    recordingMs,
    timestamp: Date.now(),
  });
  saveRecords(records);
}

export function loadStats(): DailyStats {
  const records = pruneRecords(getRecords());
  const today = todayKey();

  const todayRecords = records.filter((r) => r.date === today);
  const words = todayRecords.reduce((s, r) => s + r.wordCount, 0);
  const dictations = todayRecords.length;

  let wpm = 0;
  const totalMs = todayRecords.reduce((s, r) => s + r.recordingMs, 0);
  const totalMinutes = totalMs / 60000;
  if (totalMinutes > 0 && words > 0) {
    wpm = Math.round(words / totalMinutes);
  }

  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (records.some((r) => r.date === key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  return { words, dictations, wpm, streak };
}