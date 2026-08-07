import type { Settings, DictationEntry } from "./types";

const SETTINGS_KEY = "vocca_settings";
const HISTORY_KEY = "vocca_history";

const DEFAULT_SETTINGS: Settings = {
  hotkeyEnabled: true,
  micButtonEnabled: true,
  mode: "instant",
  language: "en-US",
  translateEnabled: false,
  aiEndpoint: "",
  aiModel: "",
  aiKey: "",
};

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
