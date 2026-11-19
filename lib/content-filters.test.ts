import { describe, expect, it } from "vitest";
import { EMPTY_FILTERS, buildContentWhere, filtersToQuery, hasActiveFilters, parseContentFilters } from "./content-filters";

const TODAY = new Date("2026-11-19T00:00:00Z");

describe("parseContentFilters", () => {
  it("reads known values and ignores unknown ones", () => {
    expect(
      parseContentFilters({ q: "  kış ", status: "IN_REVIEW", type: "PODCAST", client: "c1", due: "week", overdue: "1" }),
    ).toEqual({ q: "kış", status: "IN_REVIEW", type: null, clientId: "c1", dueWeek: true, overdue: true });
  });

  it("returns empty filters for an empty query", () => {
    expect(parseContentFilters({})).toEqual(EMPTY_FILTERS);
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it("ignores repeated params", () => {
    expect(parseContentFilters({ status: ["DRAFT", "PUBLISHED"] }).status).toBeNull();
  });
});

describe("filtersToQuery", () => {
  const filters = { ...EMPTY_FILTERS, q: "kış", status: "DRAFT" as const, clientId: "c1" };

  it("round-trips through parseContentFilters", () => {
    const query = filtersToQuery({ ...filters, dueWeek: true });
    expect(parseContentFilters(Object.fromEntries(new URLSearchParams(query)))).toEqual({ ...filters, dueWeek: true });
  });

  it("applies changes and drops cleared filters", () => {
    expect(filtersToQuery(filters, { status: null })).toBe("?q=k%C4%B1%C5%9F&client=c1");
    expect(filtersToQuery(EMPTY_FILTERS)).toBe("");
  });
});

describe("buildContentWhere", () => {
  it("returns an empty filter when nothing is set", () => {
    expect(buildContentWhere(EMPTY_FILTERS, TODAY)).toEqual({});
  });

  it("combines search, status, type and client", () => {
    const where = buildContentWhere({ ...EMPTY_FILTERS, q: "kış", status: "DRAFT", type: "BLOG_POST", clientId: "c1" }, TODAY);
    expect(where).toEqual({
      AND: [
        { title: { contains: "kış", mode: "insensitive" } },
        { status: "DRAFT" },
        { type: "BLOG_POST" },
        { clientId: "c1" },
      ],
    });
  });

  it("drops only the status condition for tab counts", () => {
    const where = buildContentWhere({ ...EMPTY_FILTERS, status: "DRAFT", type: "WEB_PAGE" }, TODAY, { ignoreStatus: true });
    expect(where).toEqual({ AND: [{ type: "WEB_PAGE" }] });
  });

  it("limits the next-7-days filter to unpublished items from today to today + 6", () => {
    const where = buildContentWhere({ ...EMPTY_FILTERS, dueWeek: true }, TODAY);
    expect(where).toEqual({
      AND: [{ status: { not: "PUBLISHED" }, publishDate: { gte: TODAY, lt: new Date("2026-11-26T00:00:00Z") } }],
    });
  });

  it("treats overdue as unpublished with a past publish day", () => {
    expect(buildContentWhere({ ...EMPTY_FILTERS, overdue: true }, TODAY)).toEqual({
      AND: [{ status: { not: "PUBLISHED" }, publishDate: { lt: TODAY } }],
    });
  });
});
