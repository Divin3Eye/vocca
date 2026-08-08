export type Mode = "instant" | "email" | "chat" | "note" | "code";

export type Language = "en-US" | "hi-IN";

export type HotkeyAction =
  | "dictate"
  | "dictatePolish"
  | "dictateHindi"
  | "reinsertLast"
  | "toggleMic";

export interface HotkeyChord {
  keys: string[];
}

export interface CustomSnippet {
  id: string;
  cue: string;
  insertion: string;
}

export interface Settings {
  hotkeyEnabled: boolean;
  micButtonEnabled: boolean;
  mode: Mode;
  language: Language;
  translateEnabled: boolean;
  aiEndpoint: string;
  aiModel: string;
  aiKey: string;
  hotkeys: Record<HotkeyAction, HotkeyChord>;
}

export interface DictationEntry {
  id: string;
  text: string;
  translated?: string;
  timestamp: number;
  mode: Mode;
  language: Language;
}

export type TranscriptEvent = {
  text: string;
  interim: boolean;
};

export interface DictationRecord {
  date: string;
  wordCount: number;
  recordingMs: number;
  timestamp: number;
}

export interface DailyStats {
  words: number;
  dictations: number;
  wpm: number;
  streak: number;
}

export interface LastDictation {
  text: string;
  mode: Mode;
  timestamp: number;
}