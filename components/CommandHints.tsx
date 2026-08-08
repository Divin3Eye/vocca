"use client";

import { getCommandHints } from "@/lib/commands";

interface CommandHintsProps {
  onOpenSettings?: () => void;
}

export default function CommandHints({ onOpenSettings }: CommandHintsProps) {
  const hints = getCommandHints();

  return (
    <div className="mt-[38px]" aria-label="Voice commands">
      <div className="text-[12px] font-bold text-[#a3a39a] uppercase tracking-[.12em] mb-3 text-center">
        Voice commands &#x2014; just say these while dictating
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {hints.map((hint) => (
          <span
            key={hint}
            className="inline-flex items-center text-[12.5px] font-semibold text-[#6f6f66] bg-white border border-[#e7e7e1] rounded-full px-[13px] py-[7px] transition-all hover:text-[#1a1a17] hover:border-[#cfcfc6] hover:-translate-y-px cursor-default"
          >
            <span className="text-[#4d7c0f] text-[11px] mr-1">&#x1F399;&#xFE0F;</span>
            &ldquo;{hint}&rdquo;
          </span>
        ))}
        <button
          onClick={onOpenSettings}
          className="inline-flex items-center text-[12.5px] font-semibold text-[#4d7c0f] bg-[#ecfccb] border border-[#cfe39a] border-dashed rounded-full px-[13px] py-[7px] transition-all hover:border-[#84cc16] cursor-pointer"
        >
          + more in settings
        </button>
      </div>
    </div>
  );
}