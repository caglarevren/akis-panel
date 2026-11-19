import { beforeEach, describe, expect, it, vi } from "vitest";

const { findMany, findUnique, groupBy } = vi.hoisted(() => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  groupBy: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { client: { findMany, findUnique }, content: { groupBy } },
}));

import { getClientDetail, getClientList } from "./clients";

const client = (id: string, isActive: boolean) => ({
  id,
  name: id,
  sector: null,
  brandColor: "#C2410C",
  isActive,
  owner: { name: "Ayşe Kaya" },
});

describe("getClientList", () => {
  beforeEach(() => {
    findMany.mockReset();
    groupBy.mockReset();
  });

  it("merges status counts and next publish day, and counts every filter tab", async () => {
    findMany.mockResolvedValueOnce([client("a", true), client("b", false)]);
    const next = new Date("2026-11-21T00:00:00Z");
    groupBy
      .mockResolvedValueOnce([
        { clientId: "a", status: "DRAFT", _count: { _all: 2 } },
        { clientId: "a", status: "PUBLISHED", _count: { _all: 1 } },
      ])
      .mockResolvedValueOnce([{ clientId: "a", _min: { publishDate: next } }]);

    const result = await getClientList();

    expect(result.filterCounts).toEqual({ all: 2, active: 1, inactive: 1 });
    expect(result.clients[0]).toMatchObject({
      id: "a",
      ownerName: "Ayşe Kaya",
      statusCounts: { DRAFT: 2, IN_REVIEW: 0, PUBLISHED: 1 },
      totalContents: 3,
      nextPublishDate: next,
    });
    expect(result.clients[1]).toMatchObject({ id: "b", totalContents: 0, nextPublishDate: null });
  });

  it("applies the status filter but keeps counts for all tabs", async () => {
    findMany.mockResolvedValueOnce([client("a", true), client("b", false)]);
    groupBy.mockResolvedValue([]);
    const result = await getClientList({ status: "inactive" });
    expect(result.clients.map((item) => item.id)).toEqual(["b"]);
    expect(result.filterCounts.all).toBe(2);
  });

  it("searches name, sector and contact case-insensitively", async () => {
    findMany.mockResolvedValueOnce([]);
    groupBy.mockResolvedValue([]);
    await getClientList({ q: "  kahve " });
    const where = findMany.mock.calls[0][0].where;
    expect(where.OR).toHaveLength(3);
    expect(where.OR[0]).toEqual({ name: { contains: "kahve", mode: "insensitive" } });
  });
});

describe("getClientDetail", () => {
  it("returns null for an unknown id", async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(getClientDetail("missing")).resolves.toBeNull();
  });

  it("flattens assignee names and sorts open work first", async () => {
    findUnique.mockResolvedValueOnce({
      ...client("a", true),
      contactName: null,
      contactEmail: null,
      contactPhone: null,
      contents: [
        { id: "p", title: "P", type: "BLOG_POST", platform: "BLOG", status: "PUBLISHED", publishDate: null, assignee: { name: "Mert" } },
        { id: "d", title: "D", type: "WEB_PAGE", platform: "WEBSITE", status: "DRAFT", publishDate: null, assignee: { name: "Elif" } },
      ],
    });
    const detail = await getClientDetail("a");
    expect(detail?.contents.map((content) => [content.id, content.assigneeName])).toEqual([
      ["d", "Elif"],
      ["p", "Mert"],
    ]);
  });
});
