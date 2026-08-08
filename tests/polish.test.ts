import { describe, it, expect } from "vitest";
import { localPolish, getPolishSystemPrompt } from "../lib/polish";

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
  it("returns a non-empty prompt", () => {
    const prompt = getPolishSystemPrompt();
    expect(prompt.length).toBeGreaterThan(0);
  });

  it("includes instruction about self-corrections", () => {
    const prompt = getPolishSystemPrompt();
    expect(prompt.toLowerCase()).toContain("self-correction");
  });

  it("includes instruction about fillers", () => {
    const prompt = getPolishSystemPrompt();
    expect(prompt.toLowerCase()).toContain("fillers");
  });

  it("instructs to output only cleaned text", () => {
    const prompt = getPolishSystemPrompt();
    expect(prompt.toLowerCase()).toContain("only the cleaned text");
  });
});
