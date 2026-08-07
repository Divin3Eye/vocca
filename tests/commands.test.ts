import { describe, it, expect } from "vitest";
import { processCommands } from "../lib/commands";

describe("processCommands", () => {
  it("replaces 'period' with a dot", () => {
    expect(processCommands("hello period")).toBe("hello.");
  });

  it("replaces 'comma' with a comma", () => {
    expect(processCommands("yes comma no")).toBe("yes, no");
  });

  it("replaces 'new line' with newline", () => {
    expect(processCommands("hello new line world")).toBe("hello\nworld");
  });

  it("replaces 'new paragraph' with double newline", () => {
    expect(processCommands("a new paragraph b")).toBe("a\n\nb");
  });

  it("capitalizes word after 'caps'", () => {
    expect(processCommands("hello caps raj")).toBe("hello Raj");
  });

  it("processes multiple commands in one string", () => {
    expect(processCommands("Hello period new line world")).toBe("Hello.\nworld");
  });

  it("is case insensitive", () => {
    expect(processCommands("Hello PERIOD")).toBe("Hello.");
  });

  it("handles empty string", () => {
    expect(processCommands("")).toBe("");
  });

  it("strips command words from final text", () => {
    const result = processCommands("I said period and then comma");
    expect(result).not.toContain("period");
    expect(result).not.toContain("comma");
  });
});
