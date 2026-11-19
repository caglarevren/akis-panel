import { describe, expect, it } from "vitest";
import { sortForList } from "./content-sort";

const d = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("sortForList", () => {
  it("puts open work first by date, undated last, then published newest first", () => {
    const items = [
      { id: "pub-old", status: "PUBLISHED" as const, publishDate: d("2026-10-01") },
      { id: "draft-undated", status: "DRAFT" as const, publishDate: null },
      { id: "review-later", status: "IN_REVIEW" as const, publishDate: d("2026-11-25") },
      { id: "pub-new", status: "PUBLISHED" as const, publishDate: d("2026-11-15") },
      { id: "draft-soon", status: "DRAFT" as const, publishDate: d("2026-11-20") },
    ];
    expect(sortForList(items).map((item) => item.id)).toEqual([
      "draft-soon",
      "review-later",
      "draft-undated",
      "pub-new",
      "pub-old",
    ]);
  });

  it("does not mutate the input", () => {
    const items = [
      { status: "DRAFT" as const, publishDate: d("2026-11-25") },
      { status: "DRAFT" as const, publishDate: d("2026-11-20") },
    ];
    const copy = [...items];
    sortForList(items);
    expect(items).toEqual(copy);
  });
});
