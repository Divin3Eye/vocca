"use client";

import { useState, useCallback } from "react";
import type { Settings, Mode, Language, HotkeyAction, HotkeyChord, CustomSnippet } from "@/lib/types";
import { chordToString, findChordConflict, normalizeChord } from "@/lib/hotkeys";
import { loadSnippets, saveSnippets, addSnippet, removeSnippet, updateSnippet } from "@/lib/storage";

const HOTKEY_ACTIONS: { action: HotkeyAction; label: string; desc: string }[] = [
  { action: "dictate", label: "Dictate (push-to-talk)", desc: "Hold to dictate, release to stop" },
  { action: "dictatePolish", label: "Dictate + polish", desc: "Dictate and auto-polish on release" },
  { action: "dictateHindi", label: "Dictate in Hindi", desc: "Second language hotkey" },
  { action: "reinsertLast", label: "Re-insert last dictation", desc: "Paste the last dictation" },
  { action: "toggleMic", label: "Toggle floating mic", desc: "Show/hide the mic button" },
];

const ACTION_LABELS: Record<string, string> = {
  dictate: "Dictate",
  dictatePolish: "Dictate + polish",
  dictateHindi: "Dictate in Hindi",
  reinsertLast: "Re-insert last",
  toggleMic: "Toggle mic",
};

interface SettingsSheetProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

type Tab = "hotkeys" | "words" | "general";

export default function SettingsSheet({ settings, onSave, onClose }: SettingsSheetProps) {
  const [local, setLocal] = useState(settings);
  const [activeTab, setActiveTab] = useState<Tab>("hotkeys");
  const [recordingAction, setRecordingAction] = useState<HotkeyAction | null>(null);
  const [clashWarning, setClashWarning] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<CustomSnippet[]>(loadSnippets);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onSave(next);
  }, [local, onSave]);

  const updateHotkey = useCallback((action: HotkeyAction, chord: HotkeyChord) => {
    const conflict = findChordConflict(chord, local.hotkeys, action);
    if (conflict) {
      setClashWarning("Already used by " + ACTION_LABELS[conflict]);
      return;
    }
    setClashWarning(null);
    const newHotkeys = { ...local.hotkeys, [action]: chord };
    update("hotkeys", newHotkeys as Settings["hotkeys"]);
  }, [local, update]);

  const startRecording = useCallback((action: HotkeyAction) => {
    setRecordingAction(action);
    setClashWarning(null);
  }, []);

  const handleRecordingKey = useCallback((e: KeyboardEvent, action: HotkeyAction) => {
    e.preventDefault();
    const keys: string[] = [];
    if (e.ctrlKey) keys.push("ctrl");
    if (e.shiftKey) keys.push("shift");
    if (e.altKey) keys.push("alt");
    if (e.metaKey) keys.push("meta");
    const key = e.key.toLowerCase();
    if (!["control", "shift", "alt", "meta"].includes(key)) {
      keys.push(key);
    }
    if (keys.length >= 2) {
      updateHotkey(action, { keys });
    }
    setRecordingAction(null);
  }, [updateHotkey]);

  const handleAddSnippet = useCallback(() => {
    setSnippets(addSnippet("", ""));
  }, []);

  const handleUpdateSnippet = useCallback((id: string, cue: string, insertion: string) => {
    setSnippets(updateSnippet(id, cue, insertion));
  }, []);

  const handleRemoveSnippet = useCallback((id: string) => {
    setSnippets(removeSnippet(id));
  }, []);

  const handleSaveSnippets = useCallback(() => {
    saveSnippets(snippets.filter((s) => s.cue.trim() && s.insertion.trim()));
  }, [snippets]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" role="dialog" aria-label="Settings">
      <RecordingListener recordingAction={recordingAction} onKey={handleRecordingKey} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#e7e7e1]">
          <h2 className="text-lg font-bold text-[#1a1a17]">Settings</h2>
          <button onClick={onClose} aria-label="Close settings" className="text-[#a3a39a] hover:text-[#1a1a17] cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 p-4 border-b border-[#e7e7e1]">
          {([
            { id: "hotkeys" as Tab, label: "Custom Keys" },
            { id: "words" as Tab, label: "Custom Words" },
            { id: "general" as Tab, label: "General" },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setClashWarning(null); }}
              className={`px-4 py-2 rounded-[10px] text-[13px] font-semibold cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "bg-[#1a1a17] text-white"
                  : "bg-white border border-[#e7e7e1] text-[#6f6f66] hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "hotkeys" && (
            <div>
              <p className="text-[12.5px] text-[#8a8a80] mb-4">
                Record keyboard shortcuts (2-3 keys) for each action. Hold all keys together.
              </p>
              <div className="space-y-0">
                {HOTKEY_ACTIONS.map(({ action, label, desc }) => {
                  const chord = local.hotkeys[action];
                  const isRecording = recordingAction === action;
                  const chordStr = chord && chord.keys.length > 0 ? chordToString(chord) : "Not set";
                  const isDefault =
                    (action === "dictate" && normalizeChord(chord) === normalizeChord({ keys: ["ctrl", " "] })) ||
                    (action === "dictatePolish" && normalizeChord(chord) === normalizeChord({ keys: ["ctrl", "shift", " "] })) ||
                    (action === "dictateHindi" && normalizeChord(chord) === normalizeChord({ keys: ["ctrl", "alt", " "] })) ||
                    (action === "toggleMic" && normalizeChord(chord) === normalizeChord({ keys: ["ctrl", "m"] }));

                  return (
                    <div key={action} className="flex items-center gap-3 py-2.5 border-b border-[#e7e7e1] last:border-b-0">
                      <div className="flex-1">
                        <div className="text-[13.5px] font-semibold text-[#1a1a17]">{label}</div>
                        <div className="text-[11.5px] text-[#8a8a80]">{desc}</div>
                      </div>
                      <button
                        onClick={() => startRecording(action)}
                        className={`min-w-[120px] text-center py-1.5 px-3 border-2 border-dashed rounded-[10px] font-bold text-[13px] cursor-pointer transition-all ${
                          isRecording
                            ? "border-[#84cc16] bg-[#d9f2a8] animate-pulse"
                            : "border-[#e2e2da] bg-[#f4f4f0] hover:border-[#84cc16]"
                        }`}
                      >
                        {isRecording ? "press keys\u2026" : chordStr}
                      </button>
                      {isDefault ? (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#d9f2a8] text-[#3f6212]">default</span>
                      ) : chord.keys.length > 0 ? (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-[#6f6f66]">custom</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              {clashWarning && (
                <div className="mt-3 text-[12px] font-semibold text-[#ef4444] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {clashWarning}
                </div>
              )}
              <div className="mt-4">
                <Toggle
                  checked={local.hotkeyEnabled}
                  onChange={(v) => update("hotkeyEnabled", v)}
                  label="Master hotkey switch"
                />
              </div>
            </div>
          )}

          {activeTab === "words" && (
            <div>
              <div className="space-y-0">
                {snippets.map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5 py-2.5 border-b border-[#e7e7e1] last:border-b-0">
                    <input
                      type="text"
                      value={s.cue}
                      onChange={(e) => handleUpdateSnippet(s.id, e.target.value, s.insertion)}
                      placeholder="say\u2026"
                      className="w-[30%] bg-[#f4f4f0] border border-[#e2e2da] rounded-lg px-2.5 py-1.5 text-[13px] font-bold outline-none focus:border-[#84cc16]"
                    />
                    <span className="text-[13px] text-[#8a8a80]">\u2192</span>
                    <input
                      type="text"
                      value={s.insertion}
                      onChange={(e) => handleUpdateSnippet(s.id, s.cue, e.target.value)}
                      placeholder="insert\u2026"
                      className="flex-1 bg-[#f4f4f0] border border-[#e2e2da] rounded-lg px-2.5 py-1.5 text-[13px] outline-none focus:border-[#84cc16]"
                    />
                    <button
                      onClick={() => handleRemoveSnippet(s.id)}
                      className="w-7 h-7 rounded-lg border border-[#e2e2da] bg-white text-[#8a8a80] cursor-pointer font-bold hover:text-[#ef4444] flex items-center justify-center"
                    >
                      {"\u2716"}
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddSnippet}
                className="flex items-center gap-2 text-[#8a8a80] text-[13px] cursor-pointer mt-3 hover:text-[#1a1a17]"
              >
                <span className="w-[22px] h-[22px] rounded-full border border-[#8a8a80] flex items-center justify-center text-[14px]">{"\u2713"}</span>
                Add custom word\u2026
              </button>
              <p className="text-[11.5px] text-[#a3a39a] mt-3 leading-relaxed">
                Custom words expand voice cues to text (e.g. say "linkedin" {"\u2192"} inserts your URL). Smart: won&apos;t expand when you&apos;re teaching about a term.
              </p>
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-5">
              <Section label="Mic Button">
                <Toggle
                  checked={local.micButtonEnabled}
                  onChange={(v) => update("micButtonEnabled", v)}
                  label="Show floating mic button"
                />
              </Section>
              <Section label="Default mode">
                <RadioGroup
                  value={local.mode}
                  options={[
                    { value: "instant", label: "Instant" },
                    { value: "email", label: "Email" },
                    { value: "chat", label: "Chat" },
                    { value: "note", label: "Note" },
                    { value: "code", label: "Code" },
                  ]}
                  onChange={(v) => update("mode", v as Mode)}
                />
              </Section>
              <Section label="Language">
                <RadioGroup
                  value={local.language}
                  options={[
                    { value: "en-US", label: "English" },
                    { value: "hi-IN", label: "Hindi" },
                  ]}
                  onChange={(v) => update("language", v as Language)}
                />
              </Section>
              <Section label="Translate">
                <Toggle
                  checked={local.translateEnabled}
                  onChange={(v) => update("translateEnabled", v)}
                  label="Enable translation after dictation"
                />
              </Section>
              <Section label="BYO AI">
                <Input value={local.aiEndpoint} onChange={(v) => update("aiEndpoint", v)} placeholder="API endpoint URL" label="Endpoint" />
                <Input value={local.aiModel} onChange={(v) => update("aiModel", v)} placeholder="Model name" label="Model" />
                <Input value={local.aiKey} onChange={(v) => update("aiKey", v)} placeholder="API key" label="API Key" type="password" />
              </Section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordingListener({ recordingAction, onKey }: { recordingAction: HotkeyAction | null; onKey: (e: KeyboardEvent, action: HotkeyAction) => void }) {
  const actionRef = useState(recordingAction);

  useState(() => {
    if (!recordingAction) return;
    const handler = (e: KeyboardEvent) => onKey(e, recordingAction);
    window.addEventListener("keydown", handler, { once: true });
    return () => window.removeEventListener("keydown", handler);
  });

  return null;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#6f6f66] mb-2">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-[#84cc16]" : "bg-gray-300"}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
      </div>
      <span className="text-sm text-[#6f6f66]">{label}</span>
    </label>
  );
}

function RadioGroup({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            value === opt.value ? "bg-[#84cc16] text-white" : "bg-gray-100 text-[#6f6f66] hover:bg-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Input({ value, onChange, placeholder, label, type = "text" }: { value: string; onChange: (v: string) => void; placeholder: string; label: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs text-[#a3a39a] mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 text-sm border border-[#e7e7e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
    </div>
  );
}