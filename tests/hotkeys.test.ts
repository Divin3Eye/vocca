import { describe, it, expect } from "vitest";
import {
  normalizeChord,
  chordsEqual,
  chordToString,
  findChordConflict,
} from "../lib/hotkeys";
import type { HotkeyChord, HotkeyAction } from "../lib/types";

describe("normalizeChord", () => {
  it("normalizes a simple chord", () => {
    expect(normalizeChord({ keys: ["ctrl", " "] })).toBe("ctrl+ ");
  });

  it("normalizes a 3-key chord", () => {
    expect(normalizeChord({ keys: ["ctrl", "alt", "s"] })).toBe("ctrl+alt+s");
  });

  it("sorts modifiers before regular keys", () => {
    expect(normalizeChord({ keys: ["ctrl", "alt", "s"] })).toBe(normalizeChord({ keys: ["alt", "ctrl", "s"] }));
  });

  it("is case-insensitive", () => {
    expect(normalizeChord({ keys: ["Ctrl", "S"] })).toBe(normalizeChord({ keys: ["ctrl", "s"] }));
  });

  it("handles empty chord", () => {
    expect(normalizeChord({ keys: [] })).toBe("");
  });
});

describe("chordsEqual", () => {
  it("returns true for identical chords", () => {
    expect(chordsEqual({ keys: ["ctrl", " "] }, { keys: ["ctrl", " "] })).toBe(true);
  });

  it("returns true for same keys in different order", () => {
    expect(chordsEqual({ keys: ["ctrl", "alt", "s"] }, { keys: ["alt", "ctrl", "s"] })).toBe(true);
  });

  it("returns false for different chords", () => {
    expect(chordsEqual({ keys: ["ctrl", " "] }, { keys: ["ctrl", "m"] })).toBe(false);
  });

  it("returns false for different key counts", () => {
    expect(chordsEqual({ keys: ["ctrl", " "] }, { keys: ["ctrl", "alt", " "] })).toBe(false);
  });
});

describe("chordToString", () => {
  it("formats a 2-key chord", () => {
    expect(chordToString({ keys: ["ctrl", " "] })).toBe("ctrl+ ");
  });

  it("formats a 3-key chord", () => {
    expect(chordToString({ keys: ["ctrl", "alt", "s"] })).toBe("ctrl+alt+s");
  });
});

describe("findChordConflict", () => {
  const actions: Record<HotkeyAction, HotkeyChord> = {
    dictate: { keys: ["ctrl", " "] },
    dictatePolish: { keys: ["ctrl", "shift", " "] },
    dictateHindi: { keys: ["ctrl", "alt", " "] },
    reinsertLast: { keys: [] },
    toggleMic: { keys: ["ctrl", "m"] },
  };

  it("returns null when no conflict", () => {
    expect(findChordConflict({ keys: ["ctrl", "a"] }, actions)).toBeNull();
  });

  it("detects conflict with dictate", () => {
    expect(findChordConflict({ keys: ["ctrl", " "] }, actions)).toBe("dictate");
  });

  it("detects conflict with toggleMic", () => {
    expect(findChordConflict({ keys: ["ctrl", "m"] }, actions)).toBe("toggleMic");
  });

  it("detects conflict with 3-key chord", () => {
    expect(findChordConflict({ keys: ["ctrl", "shift", " "] }, actions)).toBe("dictatePolish");
  });

  it("ignores the excluded action", () => {
    expect(findChordConflict({ keys: ["ctrl", " "] }, actions, "dictate")).toBeNull();
  });

  it("returns null for empty chord", () => {
    expect(findChordConflict({ keys: [] }, actions)).toBeNull();
  });

  it("detects conflict regardless of key order", () => {
    expect(findChordConflict({ keys: ["alt", "ctrl", " "] }, actions)).toBe("dictateHindi");
  });
});