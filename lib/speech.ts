import type { Language, TranscriptEvent } from "./types";

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: unknown) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: Array<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

function getRecognitionClass(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (typeof SR !== "function") return null;
  return SR as unknown as new () => SpeechRecognitionInstance;
}

export function isSupported(): boolean {
  return getRecognitionClass() !== null;
}

export interface SpeechCallbacks {
  onTranscript: (event: TranscriptEvent) => void;
  onEnd: () => void;
  onError: (error: string) => void;
}

let recognition: SpeechRecognitionInstance | null = null;

export function startListening(
  language: Language,
  callbacks: SpeechCallbacks
): void {
  const RecognitionClass = getRecognitionClass();
  if (!RecognitionClass) {
    callbacks.onError("Speech recognition is not supported in this browser.");
    return;
  }

  stopListening();

  recognition = new RecognitionClass();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = language;

  recognition.onresult = (event: unknown) => {
    const e = event as SpeechRecognitionEvent;
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const result = e.results[i];
      const text = result[0].transcript;
      callbacks.onTranscript({ text, interim: !result.isFinal });
    }
  };

  recognition.onend = () => {
    callbacks.onEnd();
  };

  recognition.onerror = (event: unknown) => {
    const err = event as { error?: string };
    callbacks.onError(err.error ?? "Unknown speech error");
  };

  recognition.start();
}

export function stopListening(): void {
  if (recognition) {
    try {
      recognition.abort();
    } catch {
      // ignore
    }
    recognition = null;
  }
}
