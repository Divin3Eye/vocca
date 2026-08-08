export type Mode = "instant" | "email" | "chat" | "note" | "code";

export type Language = "en-US" | "hi-IN";

export interface Settings {
  hotkeyEnabled: boolean;
  micButtonEnabled: boolean;
  mode: Mode;
  language: Language;
  translateEnabled: boolean;
  aiEndpoint: string;
  aiModel: string;
  aiKey: string;
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