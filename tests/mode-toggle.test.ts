import { describe, it, expect, beforeEach } from "vitest";
import { loadSettings, saveSettings } from "../lib/storage";
import type { Mode } from "../lib/types";

beforeEach(() => {
  localStorage.clear();
});

describe("mode toggle persistence", () => {
  it("defaults to instant mode", () => {
    const settings = loadSettings();
    expect(settings.mode).toBe("instant");
  });

  it("saves and loads email mode", () => {
    const settings = loadSettings();
    settings.mode = "email";
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("email");
  });

  it("saves and loads chat mode", () => {
    const settings = loadSettings();
    settings.mode = "chat";
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("chat");
  });

  it("saves and loads note mode", () => {
    const settings = loadSettings();
    settings.mode = "note";
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("note");
  });

  it("saves and loads code mode", () => {
    const settings = loadSettings();
    settings.mode = "code";
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("code");
  });

  it("saves and loads instant mode", () => {
    const settings = loadSettings();
    settings.mode = "email";
    saveSettings(settings);
    settings.mode = "instant";
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("instant");
  });

  it("migrates legacy polish mode to email", () => {
    localStorage.setItem("vocca_settings", JSON.stringify({ mode: "polish" }));
    const loaded = loadSettings();
    expect(loaded.mode).toBe("email");
  });

  it("all five modes are valid", () => {
    const modes: Mode[] = ["instant", "email", "chat", "note", "code"];
    for (const mode of modes) {
      const settings = loadSettings();
      settings.mode = mode;
      saveSettings(settings);
      expect(loadSettings().mode).toBe(mode);
    }
  });

  it("provides default hotkeys when not in saved settings", () => {
    const loaded = loadSettings();
    expect(loaded.hotkeys).toBeDefined();
    expect(loaded.hotkeys.dictate).toEqual({ keys: ["ctrl", " "] });
  });
});