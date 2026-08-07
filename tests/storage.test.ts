import { describe, it, expect, beforeEach } from "vitest";
import {
  loadSettings,
  saveSettings,
  loadHistory,
  saveHistory,
  addToHistory,
  clearHistory,
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
      mode: "polish",
      language: "hi-IN",
      translateEnabled: true,
      aiEndpoint: "https://api.example.com",
      aiModel: "gpt-4",
      aiKey: "test-key",
    };
    saveSettings(custom);
    const loaded = loadSettings();
    expect(loaded).toEqual(custom);
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
