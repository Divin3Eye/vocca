"use client";

import { getCommandHints } from "@/lib/commands";

export default function CommandHints() {
  const hints = getCommandHints();

  return (
    <div className="flex flex-wrap gap-2 justify-center" aria-label="Voice commands">
      {hints.map((hint) => (
        <span
          key={hint}
          className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-md font-mono"
        >
          {hint}
        </span>
      ))}
    </div>
  );
}
