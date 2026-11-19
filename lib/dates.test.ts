import { describe, expect, it } from "vitest";
import { calendarDay, daysBetween } from "./dates";

describe("calendarDay", () => {
  it("returns the Istanbul calendar day as UTC midnight", () => {
    // 22:30 UTC on 18 Nov is already 01:30 on 19 Nov in Istanbul (UTC+3).
    expect(calendarDay(new Date("2026-11-18T22:30:00Z")).toISOString()).toBe("2026-11-19T00:00:00.000Z");
  });

  it("keeps the same day before midnight in Istanbul", () => {
    expect(calendarDay(new Date("2026-11-18T20:59:00Z")).toISOString()).toBe("2026-11-18T00:00:00.000Z");
  });

  it("honours another time zone", () => {
    expect(calendarDay(new Date("2026-11-19T02:00:00Z"), "America/New_York").toISOString()).toBe(
      "2026-11-18T00:00:00.000Z",
    );
  });
});

describe("daysBetween", () => {
  it("counts whole days in both directions", () => {
    const a = new Date("2026-11-19T00:00:00Z");
    expect(daysBetween(a, new Date("2026-11-21T00:00:00Z"))).toBe(2);
    expect(daysBetween(a, new Date("2026-11-18T00:00:00Z"))).toBe(-1);
    expect(daysBetween(a, a)).toBe(0);
  });
});
