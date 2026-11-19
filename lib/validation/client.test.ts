import { describe, expect, it } from "vitest";
import { validateClientForm } from "./client";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = { name: "  Lumen Kahve ", ownerId: "u1", brandColor: "#C2410C" };

describe("validateClientForm", () => {
  it("accepts the minimum fields, trims and nulls empty optionals", () => {
    const result = validateClientForm(form({ ...VALID, sector: " ", contactEmail: "" }));
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Lumen Kahve",
        sector: null,
        ownerId: "u1",
        contactName: null,
        contactEmail: null,
        contactPhone: null,
        brandColor: "#C2410C",
      },
    });
  });

  it("lowercases the email and keeps a valid phone", () => {
    const result = validateClientForm(form({ ...VALID, contactEmail: "Zeynep@Lumen.com", contactPhone: "+90 (532) 410-22-18" }));
    expect(result.ok && result.data.contactEmail).toBe("zeynep@lumen.com");
    expect(result.ok && result.data.contactPhone).toBe("+90 (532) 410-22-18");
  });

  it("requires name and owner", () => {
    const result = validateClientForm(form({ brandColor: "#C2410C" }));
    expect(result).toEqual({ ok: false, fieldErrors: { name: "required", ownerId: "required" } });
  });

  it("rejects values over the length limits", () => {
    const result = validateClientForm(form({ ...VALID, name: "a".repeat(81), sector: "s".repeat(61) }));
    expect(result.ok).toBe(false);
    expect(!result.ok && result.fieldErrors).toMatchObject({ name: "too-long", sector: "too-long" });
  });

  it("rejects a malformed email or phone", () => {
    const result = validateClientForm(form({ ...VALID, contactEmail: "zeynep@", contactPhone: "call me" }));
    expect(!result.ok && result.fieldErrors).toEqual({ contactEmail: "invalid", contactPhone: "invalid" });
  });

  it("only accepts colors from the palette", () => {
    const result = validateClientForm(form({ ...VALID, brandColor: "#000000" }));
    expect(!result.ok && result.fieldErrors).toEqual({ brandColor: "invalid" });
  });
});
