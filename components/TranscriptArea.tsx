"use client";

import { useEffect, useRef } from "react";

interface TranscriptAreaProps {
  transcript: string;
  interimText: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export default function TranscriptArea({
  transcript,
  interimText,
  onChange,
  placeholder = "Your dictation will appear here...",
}: TranscriptAreaProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (areaRef.current) {
      areaRef.current.style.height = "auto";
      areaRef.current.style.height = areaRef.current.scrollHeight + "px";
    }
  }, [transcript, interimText]);

  const displayText = transcript + (interimText ? " " + interimText : "");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <textarea
        ref={areaRef}
        value={displayText}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[200px] p-6 text-lg leading-relaxed text-gray-900 bg-white border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent placeholder:text-gray-400"
        aria-label="Dictation transcript"
      />
      {interimText && (
        <p className="mt-2 text-sm text-gray-400 italic">Listening...</p>
      )}
    </div>
  );
}
