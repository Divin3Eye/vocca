"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Settings, Mode, DictationEntry, TranscriptEvent, HotkeyAction, HotkeyChord } from "@/lib/types";
import { startListening, stopListening } from "@/lib/speech";
import { processCommands } from "@/lib/commands";
import { polishText, localPolish, transformText } from "@/lib/polish";
import { translateText } from "@/lib/translate";
import {
  loadSettings,
  saveSettings,
  addToHistory,
  clearHistory,
  loadHistory,
  loadWords,
  addWord,
  removeWord,
  recordDictation,
  loadStats,
  loadSnippets,
  saveLastDictation,
  loadLastDictation,
} from "@/lib/storage";
import { registerChordBindings, unregisterAllChords, chordToString, findChordConflict, normalizeChord } from "@/lib/hotkeys";
import MicButton from "@/components/MicButton";
import TranscriptArea from "@/components/TranscriptArea";
import CommandHints from "@/components/CommandHints";
import SettingsSheet from "@/components/SettingsSheet";
import HistoryDrawer from "@/components/HistoryDrawer";

const ALL_MODES: Mode[] = ["instant", "email", "chat", "note", "code"];

const MODE_COPY: Record<Mode, { title: string; sub: string; placeholder: string }> = {
  instant: {
    title: "Ready when you are.",
    sub: 'Say "period", "new paragraph", "caps" \u2014 or just talk. Vocca cleans as you go.',
    placeholder: "Your dictation will appear here\u2026",
  },
  email: {
    title: "Email mode.",
    sub: "Vocca will shape what you say into a clean, professional email.",
    placeholder: "Dictate \u2014 Vocca will shape it\u2026",
  },
  chat: {
    title: "Chat mode.",
    sub: "Short, natural, message-ready. No formality, just flow.",
    placeholder: "Dictate \u2014 Vocca will shape it\u2026",
  },
  note: {
    title: "Note mode.",
    sub: "Fast bullet-friendly notes \u2014 ideas before they evaporate.",
    placeholder: "Dictate \u2014 Vocca will shape it\u2026",
  },
  code: {
    title: "Code mode.",
    sub: "Dictate code in plain words \u2014 Vocca formats it as code blocks.",
    placeholder: "Dictate \u2014 Vocca will shape it\u2026",
  },
};

const MODE_LABELS: Record<Mode, string> = {
  instant: "Instant",
  email: "\u2709 Email",
  chat: "\uD83D\uDCAC Chat",
  note: "\uD83D\uDCDD Note",
  code: "\u2318 Code",
};

const TRANSFORM_TYPES = [
  { id: "email", label: "Email" },
  { id: "chat", label: "Chat" },
  { id: "note", label: "Note" },
  { id: "code", label: "Code" },
  { id: "summary", label: "Summary" },
  { id: "rewrite", label: "Rewrite" },
  { id: "trim", label: "Trim" },
] as const;

function usePersistedSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => { setSettings(loadSettings()); }, []);
  const updateSettings = useCallback((s: Settings) => {
    saveSettings(s);
    setSettings(s);
  }, []);
  return [settings, updateSettings] as const;
}

function usePersistedHistory() {
  const [history, setHistory] = useState<DictationEntry[]>([]);
  useEffect(() => { setHistory(loadHistory()); }, []);
  return [history, setHistory] as const;
}

function useRecordingStats() {
  const [wordCount, setWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [dailyStats, setDailyStats] = useState(() => loadStats());
  const startTimeRef = useRef<number>(0);
  const wordCountRef = useRef(0);

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now();
    wordCountRef.current = 0;
    setWordCount(0);
    setWpm(0);
  }, []);

  const updateWordCount = useCallback((count: number) => {
    wordCountRef.current = count;
    setWordCount(count);
    const elapsed = (Date.now() - startTimeRef.current) / 60000;
    if (elapsed > 0 && count > 0) {
      setWpm(Math.round(count / elapsed));
    }
  }, []);

  const endTracking = useCallback(() => {
    const elapsedMs = Date.now() - startTimeRef.current;
    if (wordCountRef.current > 0) {
      recordDictation(wordCountRef.current, elapsedMs);
      setDailyStats(loadStats());
    }
    return { words: wordCountRef.current, ms: elapsedMs };
  }, []);

  return { wordCount, wpm, dailyStats, startTracking, updateWordCount, endTracking };
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
  const [words, setWords] = useState<string[]>([]);
  const [dictInput, setDictInput] = useState("");
  const [snippets, setSnippets] = useState(() => loadSnippets());
  const [snoozed, setSnoozed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [transforming, setTransforming] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  const { wordCount, wpm, dailyStats, startTracking, updateWordCount, endTracking } = useRecordingStats();

  useEffect(() => { if (settings) setActiveMode(settings.mode); }, [settings]);
  useEffect(() => { setWords(loadWords()); }, []);
  useEffect(() => { setSnippets(loadSnippets()); }, [showSettings]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const handleTranscript = useCallback((event: TranscriptEvent) => {
    if (event.interim) {
      setInterimText(event.text);
    } else {
      const result = processCommands(event.text, snippets);
      if (result.scratchThat) {
        setTranscript((prev) => {
          const parts = prev.trim().split(/\s+/);
          parts.pop();
          return parts.join(" ");
        });
      } else {
        setTranscript((prev) => prev ? prev + " " + result.text : result.text);
      }
      setInterimText("");
    }
  }, [snippets]);

  const handleStop = useCallback(async () => {
    setRecording(false);
    setInterimText("");

    const currentText = transcript;
    if (!currentText.trim()) {
      endTracking();
      return;
    }

    const wordC = currentText.trim().split(/\s+/).length;
    updateWordCount(wordC);

    saveLastDictation({ text: currentText, mode: activeMode, timestamp: Date.now() });

    if (activeMode !== "instant") {
      setPolishing(true);
      try {
        const polished = await polishText(currentText, settings!, activeMode, words);
        setTranscript(polished);
      } catch {
        setTranscript(localPolish(currentText));
      }
      setPolishing(false);
    }

    endTracking();

    if (settings?.translateEnabled && settings.aiEndpoint && settings.aiKey) {
      setTranslating(true);
      try {
        const translated = await translateText(currentText, settings.language, settings);
        const entry: DictationEntry = {
          id: Date.now().toString(),
          text: currentText,
          translated,
          timestamp: Date.now(),
          mode: activeMode,
          language: settings.language,
        };
        setHistory(addToHistory(entry));
      } catch { /* silent */ }
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
  }, [activeMode, settings, transcript, words, setHistory, endTracking, updateWordCount, snippets]);

  const toggleRecording = useCallback(() => {
    if (!settings) return;
    if (snoozed) { showToast("Mic is snoozed"); return; }
    if (recording) {
      stopListening();
      handleStop();
    } else {
      setTranscript("");
      setInterimText("");
      setRecording(true);
      startTracking();
      startListening(settings.language, {
        onTranscript: handleTranscript,
        onEnd: () => { if (recording) handleStop(); },
        onError: (err) => {
          if (err === "aborted") return;
          console.error("Speech error:", err);
          setRecording(false);
        },
      });
    }
  }, [recording, settings, handleTranscript, handleStop, startTracking, snoozed, showToast]);

  const handleReinsertLast = useCallback(() => {
    const last = loadLastDictation();
    if (!last) { showToast("Nothing to re-insert"); return; }
    setTranscript((prev) => prev ? prev + " " + last.text : last.text);
    showToast("Re-inserted last dictation");
  }, [showToast]);

  const handleTransform = useCallback(async (transformType: string) => {
    if (!settings || !transcript.trim()) return;
    setTransforming(true);
    try {
      if (["email", "chat", "note", "code"].includes(transformType)) {
        const result = await polishText(transcript, settings, transformType as Mode, words);
        setTranscript(result);
      } else {
        const result = await transformText(transcript, transformType, settings);
        setTranscript(result);
      }
    } catch {
      /* no-op */
    }
    setTransforming(false);
  }, [settings, transcript, words]);

  const handleSnooze = useCallback(() => {
    setSnoozed(true);
    showToast("Mic snoozed for 5 minutes");
    setTimeout(() => setSnoozed(false), 5 * 60 * 1000);
  }, [showToast]);

  useEffect(() => {
    if (!settings?.hotkeyEnabled || !settings?.hotkeys) return;
    const cleanup = registerChordBindings(settings.hotkeys, {
      dictationCallback: toggleRecording,
      releaseCallback: () => { if (recording) handleStop(); },
      dictatePolishCallback: toggleRecording,
      dictateHindiCallback: toggleRecording,
      reinsertLastCallback: handleReinsertLast,
      toggleMicCallback: toggleRecording,
    });
    return () => { unregisterAllChords(); cleanup(); };
  }, [settings?.hotkeyEnabled, settings?.hotkeys, toggleRecording, recording, handleStop, handleReinsertLast]);

  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.type === "pagehide" && transcript.trim() && !recording) {
        saveLastDictation({ text: transcript, mode: activeMode, timestamp: Date.now() });
      }
    };
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, [transcript, recording, activeMode]);

  useEffect(() => {
    const last = loadLastDictation();
    if (last && Date.now() - last.timestamp < 60000) {
      showToast("\u00BBRecover last dictation\u00AB \u2014 use re-insert hotkey");
    }
  }, []);

  const handleCopy = useCallback(() => {
    if (transcript) navigator.clipboard.writeText(transcript);
  }, [transcript]);

  const handleScratch = useCallback(() => {
    setTranscript("");
    setInterimText("");
  }, []);

  const handleRephrase = useCallback(async () => {
    if (!transcript.trim() || !settings) return;
    setPolishing(true);
    try {
      const polished = await polishText(transcript, settings, activeMode, words);
      setTranscript(polished);
    } catch {
      setTranscript(localPolish(transcript));
    }
    setPolishing(false);
  }, [transcript, settings, activeMode, words]);

  const handleClearHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, [setHistory]);

  const handleModeChange = useCallback((mode: Mode) => {
    setActiveMode(mode);
    if (settings) setSettings({ ...settings, mode });
  }, [settings, setSettings]);

  const handleAddWord = useCallback(() => {
    const trimmed = dictInput.trim();
    if (!trimmed) return;
    setWords(addWord(trimmed));
    setDictInput("");
  }, [dictInput]);

  const handleRemoveWord = useCallback((word: string) => {
    setWords(removeWord(word));
  }, []);

  const handleSelectionChange = useCallback((text: string) => {
    setSelectedText(text);
  }, []);

  if (!settings) return null;

  const modeCopy = MODE_COPY[activeMode];

  return (
    <div className="min-h-screen" style={{ background: "#f7f7f4" }}>
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        background: "radial-gradient(600px 240px at 50% -60px, rgba(132,204,22,.10), transparent 70%), radial-gradient(400px 200px at 90% 110%, rgba(132,204,22,.06), transparent 70%)"
      }} />

      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a17] text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="relative z-10 max-w-[1080px] mx-auto px-6 py-7 pb-16">
        {/* Top Bar */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5 font-extrabold text-xl tracking-[-.02em] text-[#1a1a17]">
            <span className="w-[26px] h-[26px] rounded-lg bg-[#84cc16] flex items-center justify-center text-white shadow-[inset_0_-2px_0_rgba(0,0,0,.15)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </span>
            Vocca
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-[7px] text-xs font-semibold text-[#4d7c0f] bg-[#ecfccb] border border-[#d9f2a8] px-3 py-[7px] rounded-full">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-[13px] h-[13px]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              No screenshots. Ever.
            </div>
            <button onClick={() => setShowHistory(true)} className="w-[38px] h-[38px] rounded-xl border border-[#e7e7e1] bg-white flex items-center justify-center text-[#6f6f66] cursor-pointer transition-all hover:text-[#1a1a17] hover:border-[#d4d4cc] hover:shadow-[0_1px_2px_rgba(20,20,10,.04),0_8px_24px_-12px_rgba(20,20,10,.10)]" aria-label="History">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            </button>
            <button onClick={() => setShowSettings(true)} className="w-[38px] h-[38px] rounded-xl border border-[#e7e7e1] bg-white flex items-center justify-center text-[#6f6f66] cursor-pointer transition-all hover:text-[#1a1a17] hover:border-[#d4d4cc] hover:shadow-[0_1px_2px_rgba(20,20,10,.04),0_8px_24px_-12px_rgba(20,20,10,.10)]" aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
          </div>
        </header>

        {/* Status Line */}
        <div className="text-center mb-[22px]">
          <div className="text-xs font-bold uppercase tracking-[.14em] text-[#a3a39a] mb-2">
            {settings.hotkeys?.dictate ? chordToString(settings.hotkeys.dictate) + " anywhere" : "Ctrl+Space anywhere"} &middot; or tap the mic
          </div>
          <h1 className="text-[clamp(26px,4vw,38px)] font-extrabold tracking-[-.03em] text-[#1a1a17]">
            {recording ? "Go ahead \u2014 I\u2019m listening." : polishing ? "Polishing\u2026" : transforming ? "Transforming\u2026" : modeCopy.title}
          </h1>
          <div className="text-[15px] text-[#6f6f66] mt-2">
            {recording ? "Pause to think all you want. Vocca keeps up." : polishing ? "Applying format-aware corrections\u2026" : modeCopy.sub}
          </div>
        </div>

        {/* Mode Row */}
        <div className="flex justify-center mb-[22px]">
          <div className="inline-flex bg-[#eee] rounded-[14px] p-1 gap-0.5 shadow-[inset_0_1px_2px_rgba(20,20,10,.06)]">
            {ALL_MODES.map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`border-none bg-transparent px-[18px] py-[9px] rounded-[11px] text-sm font-semibold cursor-pointer transition-all flex items-center gap-[7px] ${
                  activeMode === m
                    ? "bg-white text-[#1a1a17] shadow-[0_1px_3px_rgba(20,20,10,.10)]"
                    : "text-[#6f6f66] hover:text-[#1a1a17]"
                }`}
              >
                {MODE_LABELS[m]}
                {m === "instant" && (
                  <span className="text-[10px] font-extrabold px-[7px] py-[2px] rounded-full bg-[#ecfccb] text-[#4d7c0f]">LIVE</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Transcript */}
        <TranscriptArea
          transcript={transcript}
          interimText={interimText}
          onChange={setTranscript}
          placeholder={modeCopy.placeholder}
          mode={activeMode}
          recording={recording}
          wordCount={wordCount}
          wpm={wpm}
          polishing={polishing}
          onSelectionChange={handleSelectionChange}
        />

        {/* Transform bar */}
        {selectedText && (
          <div className="flex justify-center gap-2 mt-3">
            {TRANSFORM_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTransform(t.id)}
                disabled={transforming}
                className="px-3 py-1.5 text-[12px] font-semibold rounded-lg border border-[#d9f2a8] bg-[#ecfccb] text-[#3f6212] cursor-pointer hover:bg-[#d9f2a8] disabled:opacity-40"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Transcript Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2.5 px-0 py-2.5 mt-1">
          <div className="flex gap-2">
            <button onClick={handleScratch} className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[11px] border border-[#e7e7e1] bg-white text-[#6f6f66] cursor-pointer transition-all hover:text-[#1a1a17] hover:border-[#d4d4cc]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Scratch that
            </button>
            <button onClick={handleRephrase} disabled={!transcript} className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[11px] border border-[#e7e7e1] bg-white text-[#6f6f66] cursor-pointer transition-all hover:text-[#1a1a17] hover:border-[#d4d4cc] disabled:opacity-40 disabled:cursor-not-allowed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4z"/></svg>
              Rephrase
            </button>
            <button onClick={handleReinsertLast} className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[11px] border border-[#e7e7e1] bg-white text-[#6f6f66] cursor-pointer transition-all hover:text-[#1a1a17] hover:border-[#d4d4cc]">
              Re-insert
            </button>
            {snoozed && (
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-[#a3a39a]">
                Snoozed 5m
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {settings?.translateEnabled && (
              <button className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[11px] border border-[#e7e7e1] bg-white text-[#6f6f66] cursor-pointer transition-all hover:text-[#1a1a17] hover:border-[#d4d4cc]">
                {"\u0939\u093F\u0902\u0926\u0940"}
              </button>
            )}
            <button onClick={handleCopy} disabled={!transcript} className="inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[11px] border border-[#1a1a17] bg-[#1a1a17] text-white cursor-pointer transition-all hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              Copy
            </button>
          </div>
        </div>

        {/* Mic Zone */}
        <div className="flex justify-center mt-[34px] mb-1.5">
          <MicButton recording={recording} onClick={toggleRecording} visible={settings.micButtonEnabled} snoozed={snoozed} />
        </div>
        <div className="text-center text-[#a3a39a] text-[13px] mt-3.5">
          Hold <span className="inline-block text-[11px] font-bold text-[#6f6f66] border border-[#e7e7e1] rounded-[6px] px-[7px] py-[2px] bg-white mx-0.5">Ctrl</span>+<span className="inline-block text-[11px] font-bold text-[#6f6f66] border border-[#e7e7e1] rounded-[6px] px-[7px] py-[2px] bg-white mx-0.5">Space</span> while talking, release when done &middot; or tap the mic
        </div>

        {/* Command Hints */}
        <CommandHints onOpenSettings={() => setShowSettings(true)} />

        {/* Two-Column Grid */}
        <div className="grid grid-cols-[1fr_320px] gap-6 mt-11 items-start max-md:grid-cols-1">
          {/* Stats Card */}
          <div className="bg-white border border-[#e7e7e1] rounded-[18px] shadow-[0_1px_2px_rgba(20,20,10,.04),0_8px_24px_-12px_rgba(20,20,10,.10)] p-5">
            <h3 className="text-[13px] font-bold text-[#a3a39a] uppercase tracking-[.1em] mb-4">Today</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#fafaf7] border border-[#f0f0ea] rounded-[14px] p-3.5 pb-3">
                <div className="text-[24px] font-extrabold tracking-[-.03em] tabular-nums text-[#1a1a17]">{dailyStats.words}</div>
                <div className="text-[11.5px] font-semibold text-[#a3a39a] mt-0.5">words dictated</div>
              </div>
              <div className="bg-[#ecfccb] border border-[#d9f2a8] rounded-[14px] p-3.5 pb-3">
                <div className="text-[24px] font-extrabold tracking-[-.03em] tabular-nums text-[#4d7c0f]">{dailyStats.wpm}<span className="text-[13px] font-semibold text-[#a3a39a] ml-0.5">wpm</span></div>
                <div className="text-[11.5px] font-semibold text-[#a3a39a] mt-0.5">your speed today</div>
              </div>
              <div className="bg-[#fafaf7] border border-[#f0f0ea] rounded-[14px] p-3.5 pb-3">
                <div className="text-[24px] font-extrabold tracking-[-.03em] tabular-nums text-[#1a1a17]">{dailyStats.dictations}</div>
                <div className="text-[11.5px] font-semibold text-[#a3a39a] mt-0.5">dictations</div>
              </div>
              <div className="bg-[#fafaf7] border border-[#f0f0ea] rounded-[14px] p-3.5 pb-3">
                <div className="text-[24px] font-extrabold tracking-[-.03em] tabular-nums text-[#1a1a17]">{dailyStats.streak}<span className="text-[#f59e0b]">{"\uD83D\uDD25"}</span></div>
                <div className="text-[11.5px] font-semibold text-[#a3a39a] mt-0.5">day streak</div>
              </div>
            </div>
            <p className="text-xs text-[#a3a39a] mt-3.5">
              {"Typing average is 40 wpm. You talk at " + (dailyStats.wpm || 94) + ". That\u2019s the superpower."}
            </p>
          </div>

          <div>
            {/* My Words Card */}
            <div className="bg-white border border-[#e7e7e1] rounded-[18px] shadow-[0_1px_2px_rgba(20,20,10,.04),0_8px_24px_-12px_rgba(20,20,10,.10)] p-5">
              <h3 className="text-[13px] font-bold text-[#a3a39a] uppercase tracking-[.1em] mb-4">My words (dictionary)</h3>
              <div className="flex gap-2 mb-3.5">
                <input
                  type="text"
                  value={dictInput}
                  onChange={(e) => setDictInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddWord(); }}
                  placeholder="e.g. Mythrix, Rohan, AWS Lambda"
                  className="flex-1 border border-[#e7e7e1] rounded-[11px] px-3 py-[9px] text-[13.5px] outline-none transition-all focus:border-[#84cc16] focus:shadow-[0_0_0_3px_rgba(132,204,22,.18)]"
                />
                <button onClick={handleAddWord} className="border-none bg-[#1a1a17] text-white font-bold text-[13px] rounded-[11px] px-4 cursor-pointer hover:bg-black">Add</button>
              </div>
              <div className="flex flex-wrap gap-[7px]">
                {words.map((w) => (
                  <span key={w} className="inline-flex items-center text-[12.5px] font-semibold bg-[#f4f4f0] border border-[#eaeaE3] text-[#1a1a17] px-2.5 py-1.5 rounded-full gap-1.5">
                    {w}
                    <button onClick={() => handleRemoveWord(w)} className="text-[#a3a39a] cursor-pointer font-extrabold text-[13px] hover:text-[#ef4444] bg-transparent border-none p-0">&times;</button>
                  </span>
                ))}
              </div>
              <p className="text-[11.5px] text-[#a3a39a] mt-3 leading-relaxed">
                {"Words you add are protected: Vocca never \u201Ccorrects\u201D them, and AI polish keeps them exactly as written."}
              </p>
            </div>

            {/* Privacy Card */}
            <div className="bg-white border border-[#e7e7e1] rounded-[18px] shadow-[0_1px_2px_rgba(20,20,10,.04),0_8px_24px_-12px_rgba(20,20,10,.10)] p-5 mt-6">
              <h3 className="text-[13px] font-bold text-[#a3a39a] uppercase tracking-[.1em] mb-4">Why Vocca is safe</h3>
              <ul className="list-none space-y-1.5">
                <li className="flex gap-2.5 text-[13.5px] text-[#6f6f66] py-[7px] leading-relaxed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#4d7c0f]"><path d="M20 6L9 17l-5-5"/></svg>
                  {"No screenshots. Vocca never sees your screen \u2014 it\u2019s a web app, it can\u2019t."}
                </li>
                <li className="flex gap-2.5 text-[13.5px] text-[#6f6f66] py-[7px] leading-relaxed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#4d7c0f]"><path d="M20 6L9 17l-5-5"/></svg>
                  {"Dictation happens in your browser. No account, no cloud storage."}
                </li>
                <li className="flex gap-2.5 text-[13.5px] text-[#6f6f66] py-[7px] leading-relaxed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#4d7c0f]"><path d="M20 6L9 17l-5-5"/></svg>
                  {"AI polish uses "}
                  <b>{"your own key"}</b>
                  {" (BYO AI). Free tier: DeepSeek v4 flash, no charge."}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-14 text-center text-[#a3a39a] text-[12.5px] leading-[1.7]">
          {"Vocca v3 \u00B7 open-source (MIT) \u00B7 works on Windows, Mac, Linux \u00B7 free forever"}
          <br />
          {"Made with "}
          <span className="text-[#ef4444]">{"\u2665"}</span>
          {" for people who think faster than they type"}
        </footer>
      </div>

      {showSettings && (
        <SettingsSheet settings={settings} onSave={(s) => setSettings(s)} onClose={() => setShowSettings(false)} />
      )}
      {showHistory && (
        <HistoryDrawer
          history={history}
          onRestore={(text) => { setTranscript(text); setShowHistory(false); }}
          onCopy={(text) => navigator.clipboard.writeText(text)}
          onClose={() => setShowHistory(false)}
          onClear={handleClearHistory}
        />
      )}
    </div>
  );
}