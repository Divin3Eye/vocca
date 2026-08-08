import type { Settings, DictationEntry, DictationRecord, DailyStats } from "./types";

const SETTINGS_KEY = "vocca_settings";
const HISTORY_KEY = "vocca_history";
const WORDS_KEY = "vocca_words";
const STATS_KEY = "vocca_stats";

const DEFAULT_SETTINGS: Settings = {
  hotkeyEnabled: true,
  micButtonEnabled: true,
  mode: "instant",
  language: "en-US",
  translateEnabled: false,
  aiEndpoint: "https://opencode.ai/zen/v1",
  aiModel: "deepseek-v4-flash-free",
  aiKey: "",
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (parsed.mode === "polish") parsed.mode = "email";
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