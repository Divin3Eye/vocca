"use client";

import type { Mode } from "@/lib/types";

interface ModeBadgeProps {
  mode: Mode;
  polishing?: boolean;
  translating?: boolean;
}

export default function ModeBadge({ mode, polishing, translating }: ModeBadgeProps) {
  let label = mode === "instant" ? "Instant" : "Polish";
  let color = "bg-lime-100 text-lime-700";

  if (translating) {
    label = "Translating...";
    color = "bg-blue-100 text-blue-700";
  } else if (polishing) {
    label = "Polishing...";
    color = "bg-amber-100 text-amber-700";
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${color}`}
      aria-live="polite"
    >
      {label}
    </span>
  );
}
