import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeRedirect("/tr/musteriler?durum=onayda", "/tr")).toBe("/tr/musteriler?durum=onayda");
  });

  it.each([
    ["absolute URL", "https://evil.example/tr"],
    ["protocol-relative URL", "//evil.example"],
    ["backslash trick", "/\\evil.example"],
    ["relative path without slash", "tr/icerikler"],
    ["empty string", ""],
    ["non-string", null],
  ])("falls back for %s", (_label, value) => {
    expect(safeRedirect(value, "/tr")).toBe("/tr");
  });
});
