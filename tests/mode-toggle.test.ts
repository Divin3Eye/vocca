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

  it("saves and loads polish mode", () => {
    const settings = loadSettings();
    settings.mode = "polish" as Mode;
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("polish");
  });

  it("saves and loads instant mode", () => {
    const settings = loadSettings();
    settings.mode = "polish" as Mode;
    saveSettings(settings);
    settings.mode = "instant" as Mode;
    saveSettings(settings);
    const loaded = loadSettings();
    expect(loaded.mode).toBe("instant");
  });
});
