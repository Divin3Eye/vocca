import { describe, it, expect } from "vitest";
import { localPolish } from "../lib/polish";

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
