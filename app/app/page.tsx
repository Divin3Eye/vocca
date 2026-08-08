"use client";

import { useState, useEffect, useCallback } from "react";
import type { Settings, Mode, DictationEntry, TranscriptEvent } from "@/lib/types";
import { startListening, stopListening } from "@/lib/speech";
import { processCommands } from "@/lib/commands";
import { polishText, localPolish } from "@/lib/polish";
import { translateText } from "@/lib/translate";
import {
  loadSettings,
  saveSettings,
  addToHistory,
  clearHistory,
  loadHistory,
} from "@/lib/storage";
import { registerHotkey, unregisterHotkey } from "@/lib/hotkeys";
import MicButton from "@/components/MicButton";
import VoccaBar from "@/components/VoccaBar";
import TranscriptArea from "@/components/TranscriptArea";
import ModeBadge from "@/components/ModeBadge";
import CommandHints from "@/components/CommandHints";
import SettingsSheet from "@/components/SettingsSheet";
import HistoryDrawer from "@/components/HistoryDrawer";

function usePersistedSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const updateSettings = useCallback((s: Settings) => {
    saveSettings(s);
    setSettings(s);
  }, []);

  return [settings, updateSettings] as const;
}

function usePersistedHistory() {
  const [history, setHistory] = useState<DictationEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  return [history, setHistory] as const;
}

export default function Home() {
  const [settings, setSettings] = usePersistedSettings();
  const [history, setHistory] = usePersistedHistory();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [polishing, setPolishing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>("instant");

  useEffect(() => {
    if (settings) setActiveMode(settings.mode);
  }, [settings]);

  const handleTranscript = useCallback((event: TranscriptEvent) => {
    if (event.interim) {
      setInterimText(event.text);
    } else {
      setTranscript((prev) => {
        const processed = processCommands(event.text);
        return prev ? prev + " " + processed : processed;
      });
      setInterimText("");
    }
  }, []);

  const handleStop = useCallback(async () => {
    setRecording(false);
    setInterimText("");

    const currentText =
      document.querySelector<HTMLTextAreaElement>("textarea")?.value ??
      transcript;
    if (!currentText.trim()) return;

    if (activeMode === "polish") {
      setPolishing(true);
      try {
        const polished = await polishText(currentText, settings!);
        setTranscript(polished);
      } catch {
        setTranscript(localPolish(currentText));
      }
      setPolishing(false);
    }

    if (settings?.translateEnabled && settings.aiEndpoint && settings.aiKey) {
      setTranslating(true);
      try {
        const translated = await translateText(
          currentText,
          settings.language,
          settings
        );
        const entry: DictationEntry = {
          id: Date.now().toString(),
          text: currentText,
          translated,
          timestamp: Date.now(),
          mode: activeMode,
          language: settings.language,
        };
        setHistory(addToHistory(entry));
      } catch {
        // translation failed silently
      }
      setTranslating(false);
    } else {
      const entry: DictationEntry = {
        id: Date.now().toString(),
        text: currentText,
        timestamp: Date.now(),
        mode: activeMode,
        language: settings?.language ?? "en-US",
      };
      setHistory(addToHistory(entry));
    }
  }, [activeMode, settings, transcript, setHistory]);

  const toggleRecording = useCallback(() => {
    if (!settings) return;

    if (recording) {
      stopListening();
      handleStop();
    } else {
      setTranscript("");
      setInterimText("");
      setRecording(true);
      startListening(settings.language, {
        onTranscript: handleTranscript,
        onEnd: () => {
          if (recording) handleStop();
        },
        onError: (err) => {
          if (err === "aborted") return;
          console.error("Speech error:", err);
          setRecording(false);
        },
      });
    }
  }, [recording, settings, handleTranscript, handleStop]);

  useEffect(() => {
    if (settings?.hotkeyEnabled) {
      const cleanup = registerHotkey(" ", ["ctrl"], toggleRecording);
      return () => {
        unregisterHotkey();
        cleanup();
      };
    }
    return () => unregisterHotkey();
  }, [settings?.hotkeyEnabled, toggleRecording]);

  const handleCopy = useCallback(() => {
    const text =
      document.querySelector<HTMLTextAreaElement>("textarea")?.value ??
      transcript;
    if (text) navigator.clipboard.writeText(text);
  }, [transcript]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, [setHistory]);

  const handleModeChange = useCallback(
    (mode: Mode) => {
      setActiveMode(mode);
      if (settings) {
        setSettings({ ...settings, mode });
      }
    },
    [settings, setSettings]
  );

  if (!settings) return null;

  const placeholder =
    activeMode === "polish"
      ? "Dictate \u2014 Vocca will clean it up like a pro"
      : "Your dictation will appear here...";

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Vocca
          </h1>
          <p className="text-gray-500">
            Press Ctrl+Space or tap the mic to dictate.
          </p>
          <div className="flex justify-center gap-2">
            <ModeBadge
              mode={activeMode}
              polishing={polishing}
              translating={translating}
            />
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
              aria-label="Open settings"
            >
              Settings
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
              aria-label="Open history"
            >
              History
            </button>
          </div>
        </header>

        <div className="flex justify-center">
          <div
            className="inline-flex rounded-full bg-gray-100 p-1"
            role="radiogroup"
            aria-label="Dictation mode"
          >
            <button
              role="radio"
              aria-checked={activeMode === "instant"}
              onClick={() => handleModeChange("instant")}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                activeMode === "instant"
                  ? "bg-lime-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Instant
            </button>
            <button
              role="radio"
              aria-checked={activeMode === "polish"}
              onClick={() => handleModeChange("polish")}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer ${
                activeMode === "polish"
                  ? "bg-lime-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              AI Polish
            </button>
          </div>
        </div>

        <TranscriptArea
          transcript={transcript}
          interimText={interimText}
          onChange={setTranscript}
          placeholder={placeholder}
        />

        <CommandHints />

        <div className="flex justify-center">
          <MicButton
            recording={recording}
            onClick={toggleRecording}
            visible={settings.micButtonEnabled}
          />
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleCopy}
            disabled={!transcript}
            className="px-6 py-3 bg-lime-500 hover:bg-lime-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>

      <VoccaBar
        recording={recording}
        onToggleMic={toggleRecording}
        onCopy={handleCopy}
      />

      {showSettings && (
        <SettingsSheet
          settings={settings}
          onSave={(s) => setSettings(s)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHistory && (
        <HistoryDrawer
          history={history}
          onRestore={(text) => {
            setTranscript(text);
            setShowHistory(false);
          }}
          onCopy={(text) => navigator.clipboard.writeText(text)}
          onClose={() => setShowHistory(false)}
          onClear={handleClearHistory}
        />
      )}
    </main>
  );
}
