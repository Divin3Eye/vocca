"use client";

import { useEffect, useRef } from "react";
import type { Mode } from "@/lib/types";

const HEADER_LABELS: Record<Mode, string> = {
  instant: "Transcript",
  email: "Email draft",
  chat: "Message",
  note: "Note",
  code: "Snippet",
};

interface TranscriptAreaProps {
  transcript: string;
  interimText: string;
  onChange: (text: string) => void;
  placeholder?: string;
  mode: Mode;
  recording?: boolean;
  wordCount?: number;
  wpm?: number;
  polishing?: boolean;
}

const BAR_DELAYS = [0, 130, 260, 50, 190, 310];

export default function TranscriptArea({
  transcript,
  interimText,
  onChange,
  placeholder = "Your dictation will appear here...",
  mode,
  recording = false,
  wordCount = 0,
  wpm = 0,
  polishing = false,
}: TranscriptAreaProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (areaRef.current) {
      areaRef.current.style.height = "auto";
      areaRef.current.style.height = areaRef.current.scrollHeight + "px";
    }
  }, [transcript, interimText]);

  const displayText = transcript + (interimText ? " " + interimText : "");
  const headerLabel = polishing ? "Polishing\u2026" : recording ? "Listening\u2026" : HEADER_LABELS[mode];

  return (
    <div className={`w-full bg-white border rounded-[22px] overflow-hidden transition-all shadow-[0_1px_2px_rgba(20,20,10,.04),0_8px_24px_-12px_rgba(20,20,10,.10)] ${recording ? "border-[#84cc16] shadow-[0_0_0_4px_rgba(132,204,22,.15),0_1px_2px_rgba(20,20,10,.04),0_8px_24px_-12px_rgba(20,20,10,.10)]" : "border-[#e7e7e1]"}`}>
      <div className="flex items-center justify-between px-[18px] py-3 border-b border-[#f0f0ea]">
        <div className="flex items-center gap-2 text-[12px] font-bold text-[#a3a39a] uppercase tracking-[.1em]">
          <span className={`w-[7px] h-[7px] rounded-full ${recording ? "bg-[#ef4444] animate-pulse" : "bg-[#d4d4cc]"}`} />
          {headerLabel}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center text-[11.5px] font-semibold text-[#6f6f66] bg-[#f4f4f0] px-2.5 py-1 rounded-full">
            words <span className="text-[#1a1a17] tabular-nums ml-1">{wordCount}</span>
          </span>
          {(wpm > 0 || recording) && (
            <span className="inline-flex items-center text-[11.5px] font-semibold text-[#4d7c0f] bg-[#ecfccb] px-2.5 py-1 rounded-full">
              <span className="mr-1">{"\u26A1"}</span>
              <span className="tabular-nums">{wpm || "\u2014"}</span> WPM
            </span>
          )}
          <div className="flex items-end gap-[3px] h-[22px]">
            {BAR_DELAYS.map((delay, i) => (
              <span
                key={i}
                className={`w-[3px] rounded-sm bg-[#84cc16] ${recording ? "eq-bar opacity-100" : "opacity-35"}`}
                style={{ height: recording ? undefined : "5px", animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-[26px] py-[26px] min-h-[210px] relative">
        {displayText ? (
          <textarea
            ref={areaRef}
            value={displayText}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[170px] text-[19px] leading-[1.65] tracking-[-.01em] text-[#1a1a17] bg-transparent resize-none focus:outline-none"
            aria-label="Dictation transcript"
          />
        ) : (
          <p className="text-[19px] font-medium text-[#a3a39a] tracking-[-.01em] leading-[1.65]">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}