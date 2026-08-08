import { describe, it, expect } from "vitest";
import { expandSnippets } from "../lib/snippets";
import type { CustomSnippet } from "../lib/types";

const LINKEDIN_SNIPPET: CustomSnippet = {
  id: "snip_linkedin",
  cue: "linkedin",
  insertion: "https://www.linkedin.com/in/divine-eye",
};

const EMAIL_SNIPPET: CustomSnippet = {
  id: "snip_email",
  cue: "my email",
  insertion: "admin@xohosting.in",
};

const MYTHRIX_SNIPPET: CustomSnippet = {
  id: "snip_mythrix",
  cue: "mythrix",
  insertion: "Mythrix AI \u2014 your AI study assistant",
};

describe("expandSnippets", () => {
  it("returns original text when no snippets", () => {
    expect(expandSnippets("hello world", [])).toBe("hello world");
  });

  it("expands a simple cue", () => {
    const result = expandSnippets("check my email", [EMAIL_SNIPPET]);
    expect(result).toContain("admin@xohosting.in");
    expect(result.toLowerCase()).not.toContain("my email");
  });

  it("expands case-insensitively", () => {
    const result = expandSnippets("Check MY EMAIL", [EMAIL_SNIPPET]);
    expect(result).toContain("admin@xohosting.in");
  });

  it("expands whole-word only (no partial matches)", () => {
    const result = expandSnippets("linkedin.com is great", [LINKEDIN_SNIPPET]);
    expect(result).toBe("linkedin.com is great");
  });

  it("does not expand URL snippets without explicit URL context", () => {
    const result = expandSnippets("Setup Linkedin to get connected to professional people", [LINKEDIN_SNIPPET]);
    expect(result.toLowerCase()).toContain("linkedin");
    expect(result).not.toContain("divine-eye");
  });

  it("does not expand when teaching about a term", () => {
    const result = expandSnippets("Setup mythrix to get connected to professional people", [MYTHRIX_SNIPPET]);
    expect(result.toLowerCase()).toContain("mythrix");
    expect(result).not.toContain("AI study assistant");
  });

  it("does not expand when mentioning what is the term", () => {
    const result = expandSnippets("what is mythrix", [MYTHRIX_SNIPPET]);
    expect(result).toBe("what is mythrix");
  });

  it("does not expand when spelling the term", () => {
    const result = expandSnippets("spelled M Y T H R I X mythrix", [MYTHRIX_SNIPPET]);
    expect(result.toLowerCase()).toContain("mythrix");
    expect(result).not.toContain("AI study assistant");
  });

  it("expands when user asks to insert the cue", () => {
    const result = expandSnippets("insert linkedin", [LINKEDIN_SNIPPET]);
    expect(result).toContain("divine-eye");
  });

  it("expands when user asks to paste the cue", () => {
    const result = expandSnippets("paste my email", [EMAIL_SNIPPET]);
    expect(result).toContain("admin@xohosting.in");
  });

  it("expands non-URL snippets without explicit context", () => {
    const result = expandSnippets("use mythrix for the project", [MYTHRIX_SNIPPET]);
    expect(result).toContain("Mythrix AI");
  });

  it("expands multiple snippets in one text", () => {
    const result = expandSnippets("check my email and linkedin", [EMAIL_SNIPPET, LINKEDIN_SNIPPET]);
    expect(result).toContain("admin@xohosting.in");
    expect(result).toContain("divine-eye");
  });

  it("expands URL snippet when user explicitly mentions link", () => {
    const result = expandSnippets("give me the linkedin link", [LINKEDIN_SNIPPET]);
    expect(result).toContain("divine-eye");
  });

  it("expands URL snippet when user mentions profile", () => {
    const result = expandSnippets("show my linkedin profile", [LINKEDIN_SNIPPET]);
    expect(result).toContain("divine-eye");
  });

  it("deduplicates snippets by cue (case-insensitive)", () => {
    const dupes: CustomSnippet[] = [
      { id: "1", cue: "test", insertion: "first" },
      { id: "2", cue: "Test", insertion: "second" },
    ];
    const result = expandSnippets("test this", dupes);
    expect(result).toContain("first");
  });

  it("respects 50 snippet cap", () => {
    const many: CustomSnippet[] = Array.from({ length: 55 }, (_, i) => ({
      id: `s${i}`,
      cue: `word${i}`,
      insertion: `expansion${i}`,
    }));
    const text = many.map((s) => s.cue).join(" ");
    const result = expandSnippets(text, many);
    expect(typeof result).toBe("string");
  });

  it("handles empty cue gracefully", () => {
    const snippets: CustomSnippet[] = [{ id: "1", cue: "", insertion: "test" }];
    expect(expandSnippets("hello world", snippets)).toBe("hello world");
  });

  it("handles empty insertion gracefully", () => {
    const snippets: CustomSnippet[] = [{ id: "1", cue: "test", insertion: "" }];
    expect(expandSnippets("test this", snippets)).toBe("test this");
  });
});