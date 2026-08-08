import { describe, it, expect, beforeEach } from "vitest";
import { processCommands, resetQuoteToggle } from "../lib/commands";

beforeEach(() => {
  resetQuoteToggle();
});

describe("processCommands", () => {
  it("replaces 'period' with a dot", () => {
    expect(processCommands("hello period").text).toBe("hello.");
  });

  it("replaces 'comma' with a comma", () => {
    expect(processCommands("yes comma no").text).toBe("yes, no");
  });

  it("replaces 'new line' with newline", () => {
    expect(processCommands("hello new line world").text).toBe("hello\nworld");
  });

  it("replaces 'new paragraph' with double newline", () => {
    expect(processCommands("a new paragraph b").text).toBe("a\n\nb");
  });

  it("capitalizes word after 'caps'", () => {
    expect(processCommands("hello caps raj").text).toBe("hello Raj");
  });

  it("processes multiple commands in one string", () => {
    expect(processCommands("Hello period new line world").text).toBe("Hello.\nworld");
  });

  it("is case insensitive", () => {
    expect(processCommands("Hello PERIOD").text).toBe("Hello.");
  });

  it("handles empty string", () => {
    expect(processCommands("").text).toBe("");
  });

  it("strips command words from final text", () => {
    const result = processCommands("I said period and then comma");
    expect(result.text).not.toContain("period");
    expect(result.text).not.toContain("comma");
  });

  it("replaces 'quote' with alternating curly quotes", () => {
    const result = processCommands("she said quote hello quote");
    expect(result.text).toContain("\u201C");
    expect(result.text).toContain("\u201D");
    expect(result.text).not.toContain("quote");
  });

  it("replaces 'quote' in single occurrence with opening quote", () => {
    const result = processCommands("say quote hello");
    expect(result.text).toContain("\u201C");
    expect(result.text).not.toContain("quote");
  });

  it("replaces 'dash' with em dash", () => {
    expect(processCommands("the end dash or not").text).toBe("the end\u2014or not");
  });

  it("replaces 'colon' with colon", () => {
    expect(processCommands("note colon buy milk").text).toBe("note: buy milk");
  });

  it("replaces 'question mark' with question mark", () => {
    expect(processCommands("really question mark").text).toBe("really?");
  });

  it("replaces 'questionmark' (no space)", () => {
    expect(processCommands("really questionmark").text).toBe("really?");
  });

  it("replaces 'question marks' (plural)", () => {
    expect(processCommands("really question marks").text).toBe("really?");
  });

  it("replaces 'exclamation' with exclamation mark", () => {
    expect(processCommands("wow exclamation").text).toBe("wow!");
  });

  it("replaces 'exclamation mark' with exclamation mark", () => {
    expect(processCommands("wow exclamation mark").text).toBe("wow!");
  });

  it("replaces 'exclamation marks' (plural)", () => {
    expect(processCommands("wow exclamation marks").text).toBe("wow!");
  });

  it("detects 'scratch that' and returns scratchThat flag", () => {
    const result = processCommands("scratch that");
    expect(result.scratchThat).toBe(true);
    expect(result.text).toBe("");
  });

  it("detects 'scratch that' mid-sentence", () => {
    const result = processCommands("hello scratch that world");
    expect(result.scratchThat).toBe(true);
  });

  it("replaces punctuation commands without extra spaces", () => {
    expect(processCommands("hello . world").text).toBe("hello. world");
  });
});