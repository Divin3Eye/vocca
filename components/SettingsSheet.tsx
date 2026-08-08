"use client";

import { useState } from "react";
import type { Settings, Mode, Language } from "@/lib/types";

interface SettingsSheetProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

export default function SettingsSheet({ settings, onSave, onClose }: SettingsSheetProps) {
  const [local, setLocal] = useState(settings);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...local, [key]: value };
    setLocal(next);
    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30" role="dialog" aria-label="Settings">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#1a1a17]">Settings</h2>
          <button onClick={onClose} aria-label="Close settings" className="text-[#a3a39a] hover:text-[#1a1a17] cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          <Section label="Hotkey">
            <Toggle
              checked={local.hotkeyEnabled}
              onChange={(v) => update("hotkeyEnabled", v)}
              label="Enable Ctrl+Space hotkey"
            />
          </Section>

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
            <Input
              value={local.aiEndpoint}
              onChange={(v) => update("aiEndpoint", v)}
              placeholder="API endpoint URL"
              label="Endpoint"
            />
            <Input
              value={local.aiModel}
              onChange={(v) => update("aiModel", v)}
              placeholder="Model name"
              label="Model"
            />
            <Input
              value={local.aiKey}
              onChange={(v) => update("aiKey", v)}
              placeholder="API key"
              label="API Key"
              type="password"
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#6f6f66] mb-2">{label}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-[#84cc16]" : "bg-gray-300"}`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`}
        />
      </div>
      <span className="text-sm text-[#6f6f66]">{label}</span>
    </label>
  );
}

function RadioGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            value === opt.value
              ? "bg-[#84cc16] text-white"
              : "bg-gray-100 text-[#6f6f66] hover:bg-gray-200"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  label,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[#a3a39a] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-[#e7e7e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
      />
    </div>
  );
}