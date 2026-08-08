import { describe, it, expect, beforeEach } from "vitest";
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
  addToHistory,
  clearHistory,
  loadWords,
  saveWords,
  addWord,
  removeWord,
  recordDictation,
  loadStats,
  loadSnippets,
  saveSnippets,
  addSnippet,
  removeSnippet,
  updateSnippet,
  saveLastDictation,
  loadLastDictation,
} from "../lib/storage";
import type { Settings, DictationEntry } from "../lib/types";

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("loads default settings when empty", () => {
    const settings = loadSettings();
    expect(settings.mode).toBe("instant");
    expect(settings.language).toBe("en-US");
    expect(settings.hotkeyEnabled).toBe(true);
  });

  it("saves and loads settings", () => {
    const custom: Settings = {
      hotkeyEnabled: false,
      micButtonEnabled: false,
      mode: "email",
      language: "hi-IN",
      translateEnabled: true,
      aiEndpoint: "https://api.example.com",
      aiModel: "gpt-4",
      aiKey: "test-key",
      hotkeys: {
        dictate: { keys: ["ctrl", " "] },
        dictatePolish: { keys: ["ctrl", "shift", " "] },
        dictateHindi: { keys: ["ctrl", "alt", " "] },
        reinsertLast: { keys: [] },
        toggleMic: { keys: ["ctrl", "m"] },
      },
    };
    saveSettings(custom);
    const loaded = loadSettings();
    expect(loaded).toEqual(custom);
  });

  it("migrates 'polish' mode to 'email' on load", () => {
    const settings = loadSettings();
    settings.mode = "polish" as Settings["mode"];
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("email");
  });

  it("loads empty history when none exists", () => {
    expect(loadHistory()).toEqual([]);
  });

  it("adds entry to history", () => {
    const entry: DictationEntry = {
      id: "1",
      text: "Hello world",
      timestamp: Date.now(),
      mode: "instant",
      language: "en-US",
    };
    const history = addToHistory(entry);
    expect(history).toHaveLength(1);
    expect(history[0].text).toBe("Hello world");
  });

  it("limits history to 50 entries", () => {
    for (let i = 0; i < 60; i++) {
      addToHistory({
        id: i.toString(),
        text: `Entry ${i}`,
        timestamp: Date.now(),
        mode: "instant",
        language: "en-US",
      });
    }
    const history = loadHistory();
    expect(history).toHaveLength(50);
    expect(history[0].text).toBe("Entry 59");
  });

  it("clears history", () => {
    addToHistory({
      id: "1",
      text: "test",
      timestamp: Date.now(),
      mode: "instant",
      language: "en-US",
    });
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});

describe("My Words dictionary", () => {
  it("loads empty words when none exist", () => {
    expect(loadWords()).toEqual([]);
  });

  it("adds a word", () => {
    const words = addWord("Mythrix");
    expect(words).toEqual(["Mythrix"]);
  });

  it("deduplicates on add (case-insensitive)", () => {
    addWord("mythrix");
    const words = addWord("Mythrix");
    expect(words).toHaveLength(1);
  });

  it("trims whitespace on add", () => {
    const words = addWord("  Rohan  ");
    expect(words).toEqual(["Rohan"]);
  });

  it("does not add empty strings", () => {
    const words = addWord("  ");
    expect(words).toEqual([]);
  });

  it("removes a word", () => {
    addWord("Mythrix");
    addWord("Rohan");
    const words = removeWord("Mythrix");
    expect(words).toEqual(["Rohan"]);
  });

  it("persists across save/load", () => {
    addWord("AWS Lambda");
    addWord("xohosting");
    const loaded = loadWords();
    expect(loaded).toEqual(["AWS Lambda", "xohosting"]);
  });
});

describe("Custom Snippets", () => {
  it("loads default snippets when empty", () => {
    const snippets = loadSnippets();
    expect(snippets.length).toBeGreaterThan(0);
  });

  it("adds a snippet", () => {
    const snippets = addSnippet("test cue", "test insertion");
    expect(snippets.some((s) => s.cue === "test cue")).toBe(true);
  });

  it("deduplicates by cue", () => {
    addSnippet("test", "first");
    const snippets = addSnippet("test", "second");
    expect(snippets.filter((s) => s.cue === "test")).toHaveLength(1);
  });

  it("removes a snippet", () => {
    const added = addSnippet("removeme", "value");
    const id = added[added.length - 1].id;
    const snippets = removeSnippet(id);
    expect(snippets.some((s) => s.id === id)).toBe(false);
  });

  it("updates a snippet", () => {
    const added = addSnippet("updateme", "old");
    const id = added[added.length - 1].id;
    const snippets = updateSnippet(id, "updateme", "new");
    const updated = snippets.find((s) => s.id === id);
    expect(updated?.insertion).toBe("new");
  });

  it("caps at 50 snippets", () => {
    for (let i = 0; i < 55; i++) {
      addSnippet(`cue${i}`, `insert${i}`);
    }
    const snippets = loadSnippets();
    expect(snippets.length).toBeLessThanOrEqual(50);
  });
});

describe("Last Dictation", () => {
  it("loads null when empty", () => {
    expect(loadLastDictation()).toBeNull();
  });

  it("saves and loads last dictation", () => {
    saveLastDictation({ text: "hello", mode: "instant", timestamp: 123 });
    const last = loadLastDictation();
    expect(last?.text).toBe("hello");
    expect(last?.mode).toBe("instant");
  });
});

describe("stats rollup", () => {
  it("loads zero stats when empty", () => {
    const stats = loadStats();
    expect(stats.words).toBe(0);
    expect(stats.dictations).toBe(0);
    expect(stats.wpm).toBe(0);
    expect(stats.streak).toBe(0);
  });

  it("records a dictation and updates stats", () => {
    recordDictation(50, 30000);
    const stats = loadStats();
    expect(stats.words).toBe(50);
    expect(stats.dictations).toBe(1);
    expect(stats.wpm).toBe(100);
  });

  it("accumulates multiple dictations", () => {
    recordDictation(30, 20000);
    recordDictation(70, 40000);
    const stats = loadStats();
    expect(stats.words).toBe(100);
    expect(stats.dictations).toBe(2);
  });

  it("computes streak across day boundaries", () => {
    recordDictation(10, 5000);
    const stats = loadStats();
    expect(stats.streak).toBeGreaterThanOrEqual(1);
  });
});