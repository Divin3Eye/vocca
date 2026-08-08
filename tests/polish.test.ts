import { describe, it, expect } from "vitest";
import { localPolish, getPolishSystemPrompt, getTransformPrompt } from "../lib/polish";

describe("localPolish", () => {
  it("capitalizes first letter of sentences", () => {
    expect(localPolish("hello world")).toBe("Hello world");
  });

  it("capitalizes after period", () => {
    expect(localPolish("hello. world")).toBe("Hello. World");
  });

  it("removes extra spaces", () => {
    expect(localPolish("hello  world")).toBe("Hello world");
  });

  it("trims whitespace", () => {
    expect(localPolish("  hello  ")).toBe("Hello");
  });

  it("fixes space before period", () => {
    expect(localPolish("hello . world")).toBe("Hello. World");
  });

  it("fixes space before comma", () => {
    expect(localPolish("hello , world")).toBe("Hello, world");
  });

  it("handles empty string", () => {
    expect(localPolish("")).toBe("");
  });
});

describe("getPolishSystemPrompt", () => {
  it("returns a non-empty prompt for instant", () => {
    const prompt = getPolishSystemPrompt("instant");
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("includes instruction about self-corrections", () => {
    const prompt = getPolishSystemPrompt("instant");
    expect(prompt.toLowerCase()).toContain("self-correction");
  });

  it("includes instruction about fillers", () => {
    const prompt = getPolishSystemPrompt("instant");
    expect(prompt.toLowerCase()).toContain("fillers");
  });

  it("instructs to output only cleaned text", () => {
    const prompt = getPolishSystemPrompt("instant");
    expect(prompt.toLowerCase()).toContain("only the cleaned text");
  });

  it("returns email-specific prompt for email mode", () => {
    const prompt = getPolishSystemPrompt("email");
    expect(prompt.toLowerCase()).toContain("email");
    expect(prompt).toContain("professional");
  });

  it("returns chat-specific prompt for chat mode", () => {
    const prompt = getPolishSystemPrompt("chat");
    expect(prompt.toLowerCase()).toContain("chat");
    expect(prompt.toLowerCase()).toContain("short");
  });

  it("returns note-specific prompt for note mode", () => {
    const prompt = getPolishSystemPrompt("note");
    expect(prompt.toLowerCase()).toContain("note");
    expect(prompt.toLowerCase()).toContain("bullet");
  });

  it("returns code-specific prompt for code mode", () => {
    const prompt = getPolishSystemPrompt("code");
    expect(prompt.toLowerCase()).toContain("code");
    expect(prompt.toLowerCase()).toContain("fenced code blocks");
  });

  it("resolves 6 PM to 9 PM in self-correction", () => {
    const prompt = getPolishSystemPrompt("instant");
    expect(prompt).toContain("6 PM");
    expect(prompt).toContain("9 PM");
  });
});

describe("getTransformPrompt", () => {
  it("returns summary prompt", () => {
    const prompt = getTransformPrompt("summary");
    expect(prompt.toLowerCase()).toContain("summar");
  });

  it("returns rewrite prompt", () => {
    const prompt = getTransformPrompt("rewrite");
    expect(prompt.toLowerCase()).toContain("rewrit");
    expect(prompt.toLowerCase()).toContain("professional");
  });

  it("returns trim prompt", () => {
    const prompt = getTransformPrompt("trim");
    expect(prompt.toLowerCase()).toContain("trim");
    expect(prompt.toLowerCase()).toContain("filler");
  });

  it("returns empty string for unknown transform", () => {
    expect(getTransformPrompt("unknown")).toBe("");
  });

  it("transform prompts do not invent cue words", () => {
    const summary = getTransformPrompt("summary");
    expect(summary.toLowerCase()).not.toContain("linkedin");
    expect(summary.toLowerCase()).not.toContain("mythrix");
  });
});