import type { HotkeyChord, HotkeyAction } from "./types";

function normalizeChord(chord: HotkeyChord): string {
  const sorted = chord.keys
    .map((k) => k.toLowerCase())
    .sort((a, b) => {
      const order = ["ctrl", "shift", "alt", "meta"];
      const aIdx = order.indexOf(a);
      const bIdx = order.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.localeCompare(b);
    });
  return sorted.join("+");
}

export { normalizeChord };

export function chordsEqual(a: HotkeyChord, b: HotkeyChord): boolean {
  return normalizeChord(a) === normalizeChord(b);
}

export function chordToString(chord: HotkeyChord): string {
  return chord.keys.join("+");
}

const bindings: ChordBinding[] = [];
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
let keyupHandler: ((e: KeyboardEvent) => void) | null = null;
const heldKeys = new Set<string>();
const firedChords = new Set<string>();

interface ChordBinding {
  action: HotkeyAction;
  chord: HotkeyChord;
  onPress: () => void;
  onRelease?: () => void;
}

function eventToChordKeys(e: KeyboardEvent): string[] {
  const keys: string[] = [];
  if (e.ctrlKey) keys.push("ctrl");
  if (e.shiftKey) keys.push("shift");
  if (e.altKey) keys.push("alt");
  if (e.metaKey) keys.push("meta");
  const key = e.key.toLowerCase();
  if (!["control", "shift", "alt", "meta"].includes(key)) {
    keys.push(key);
  }
  return keys;
}

function findMatchingBinding(): ChordBinding | null {
  const normalized = normalizeChord({ keys: Array.from(heldKeys) });
  for (const b of bindings) {
    if (normalizeChord(b.chord) === normalized) {
      return b;
    }
  }
  return null;
}

function handleKeydown(e: KeyboardEvent): void {
  const keys = eventToChordKeys(e);
  keys.forEach((k) => heldKeys.add(k));

  const binding = findMatchingBinding();
  if (binding) {
    const chordKey = normalizeChord(binding.chord);
    if (!firedChords.has(chordKey)) {
      e.preventDefault();
      firedChords.add(chordKey);
      binding.onPress();
    }
  }
}

function handleKeyup(e: KeyboardEvent): void {
  const keys = eventToChordKeys(e);
  keys.forEach((k) => heldKeys.delete(k));

  const chordKey = normalizeChord({ keys: Array.from(heldKeys) });
  firedChords.delete(chordKey);

  for (const b of bindings) {
    if (b.onRelease) {
      const releasedKey = e.key.toLowerCase();
      if (b.chord.keys.some((k) => k.toLowerCase() === releasedKey)) {
        b.onRelease();
      }
    }
  }
}

export function registerChordBindings(
  actions: Record<HotkeyAction, HotkeyChord>,
  callbacks: {
    dictationCallback: () => void;
    releaseCallback: () => void;
    dictatePolishCallback?: () => void;
    dictateHindiCallback?: () => void;
    reinsertLastCallback?: () => void;
    toggleMicCallback?: () => void;
  }
): () => void {
  unregisterAllChords();
  bindings.length = 0;

  if (actions.dictate?.keys?.length) {
    bindings.push({
      action: "dictate",
      chord: actions.dictate,
      onPress: callbacks.dictationCallback,
      onRelease: callbacks.releaseCallback,
    });
  }
  if (actions.dictatePolish?.keys?.length) {
    bindings.push({
      action: "dictatePolish",
      chord: actions.dictatePolish,
      onPress: callbacks.dictatePolishCallback ?? callbacks.dictationCallback,
      onRelease: callbacks.releaseCallback,
    });
  }
  if (actions.dictateHindi?.keys?.length) {
    bindings.push({
      action: "dictateHindi",
      chord: actions.dictateHindi,
      onPress: callbacks.dictateHindiCallback ?? callbacks.dictationCallback,
      onRelease: callbacks.releaseCallback,
    });
  }
  if (actions.reinsertLast?.keys?.length) {
    bindings.push({
      action: "reinsertLast",
      chord: actions.reinsertLast,
      onPress: callbacks.reinsertLastCallback ?? (() => {}),
    });
  }
  if (actions.toggleMic?.keys?.length) {
    bindings.push({
      action: "toggleMic",
      chord: actions.toggleMic,
      onPress: callbacks.toggleMicCallback ?? callbacks.dictationCallback,
    });
  }

  keydownHandler = handleKeydown;
  keyupHandler = handleKeyup;
  window.addEventListener("keydown", keydownHandler);
  window.addEventListener("keyup", keyupHandler);

  return unregisterAllChords;
}

export function unregisterAllChords(): void {
  if (keydownHandler) {
    window.removeEventListener("keydown", keydownHandler);
    keydownHandler = null;
  }
  if (keyupHandler) {
    window.removeEventListener("keyup", keyupHandler);
    keyupHandler = null;
  }
  bindings.length = 0;
  heldKeys.clear();
  firedChords.clear();
}

export function detectChordFromEvent(e: KeyboardEvent): HotkeyChord {
  const keys: string[] = [];
  if (e.ctrlKey) keys.push("ctrl");
  if (e.shiftKey) keys.push("shift");
  if (e.altKey) keys.push("alt");
  if (e.metaKey) keys.push("meta");
  const key = e.key.toLowerCase();
  if (!["control", "shift", "alt", "meta"].includes(key)) {
    keys.push(key);
  }
  return { keys };
}

export function findChordConflict(
  chord: HotkeyChord,
  actions: Record<HotkeyAction, HotkeyChord>,
  excludeAction?: HotkeyAction
): HotkeyAction | null {
  if (!chord.keys || chord.keys.length === 0) return null;
  const normalized = normalizeChord(chord);
  for (const [action, existing] of Object.entries(actions)) {
    if (excludeAction && action === excludeAction) continue;
    if (!existing.keys || existing.keys.length === 0) continue;
    if (normalizeChord(existing) === normalized) {
      return action as HotkeyAction;
    }
  }
  return null;
}