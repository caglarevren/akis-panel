import { describe, expect, it } from "vitest";
import { parseCalendarDate, validateContentForm } from "./content";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = { title: " Kış menüsü ", clientId: "c1", type: "SOCIAL_POST", platform: "INSTAGRAM", assigneeId: "u1" };

describe("parseCalendarDate", () => {
  it("turns YYYY-MM-DD into UTC midnight", () => {
    expect(parseCalendarDate("2026-11-21")?.toISOString()).toBe("2026-11-21T00:00:00.000Z");
  });

  it.each(["2026-02-30", "21.11.2026", "2026-1-5", "", "tomorrow"])("rejects %j", (value) => {
    expect(parseCalendarDate(value)).toBeNull();
  });
});

describe("validateContentForm", () => {
  it("accepts a minimal valid form and trims values", () => {
    const result = validateContentForm(form({ ...VALID, notes: "  " }));
    expect(result).toEqual({
      ok: true,
      data: {
        title: "Kış menüsü",
        clientId: "c1",
        type: "SOCIAL_POST",
        platform: "INSTAGRAM",
        publishDate: null,
        assigneeId: "u1",
        notes: null,
      },
    });
  });

  it("parses the publish date", () => {
    const result = validateContentForm(form({ ...VALID, publishDate: "2026-11-21" }));
    expect(result.ok && result.data.publishDate?.toISOString()).toBe("2026-11-21T00:00:00.000Z");
  });

  it("requires title, client and assignee", () => {
    const result = validateContentForm(form({ type: "BLOG_POST", platform: "BLOG" }));
    expect(result).toEqual({ ok: false, fieldErrors: { title: "required", clientId: "required", assigneeId: "required" } });
  });

  it("rejects a platform that doesn't belong to the type", () => {
    const result = validateContentForm(form({ ...VALID, type: "BLOG_POST", platform: "INSTAGRAM" }));
    expect(!result.ok && result.fieldErrors).toEqual({ platform: "invalid" });
  });

  it("rejects unknown enum values and bad dates", () => {
    const result = validateContentForm(form({ ...VALID, type: "PODCAST", platform: "SPOTIFY", publishDate: "2026-13-01" }));
    expect(!result.ok && result.fieldErrors).toEqual({ type: "invalid", platform: "invalid", publishDate: "invalid" });
  });

  it("enforces length limits", () => {
    const result = validateContentForm(form({ ...VALID, title: "t".repeat(161), notes: "n".repeat(5001) }));
    expect(!result.ok && result.fieldErrors).toEqual({ title: "too-long", notes: "too-long" });
  });
});
