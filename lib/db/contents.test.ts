import { describe, expect, it, vi } from "vitest";

const { count, findMany, groupBy, findClients, findUsers } = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
  groupBy: vi.fn(),
  findClients: vi.fn(),
  findUsers: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { content: { count, findMany, groupBy }, client: { findMany: findClients }, user: { findMany: findUsers } },
}));

import { getContentFormOptions, getContentList, getInReviewCount } from "./contents";

describe("getInReviewCount", () => {
  it("counts only contents in review", async () => {
    count.mockResolvedValueOnce(4);
    await expect(getInReviewCount()).resolves.toBe(4);
    expect(count).toHaveBeenCalledWith({ where: { status: "IN_REVIEW" } });
  });
});

describe("getContentList", () => {
  it("flattens client and assignee and sorts open work first", async () => {
    const base = { type: "BLOG_POST", platform: "BLOG", notes: null, clientId: "c1", assigneeId: "u1", createdAt: new Date() };
    findMany.mockResolvedValueOnce([
      { ...base, id: "pub", title: "P", status: "PUBLISHED", publishDate: null, client: { name: "Lumen", brandColor: "#C2410C" }, assignee: { name: "Ayşe" } },
      { ...base, id: "draft", title: "D", status: "DRAFT", publishDate: null, client: { name: "Atlas", brandColor: "#1D4ED8" }, assignee: { name: "Mert" } },
    ]);
    groupBy.mockResolvedValueOnce([{ status: "DRAFT", _count: { _all: 1 } }, { status: "PUBLISHED", _count: { _all: 1 } }]);
    const { items: list, statusCounts } = await getContentList();
    expect(statusCounts).toEqual({ DRAFT: 1, IN_REVIEW: 0, PUBLISHED: 1 });
    expect(list.map((item) => [item.id, item.clientName, item.assigneeName])).toEqual([
      ["draft", "Atlas", "Mert"],
      ["pub", "Lumen", "Ayşe"],
    ]);
    expect(list[0]).not.toHaveProperty("client");
  });

  it("applies the filters to the list but not the status to the tab counts", async () => {
    findMany.mockResolvedValueOnce([]);
    groupBy.mockResolvedValueOnce([]);
    await getContentList({ q: "", status: "DRAFT", type: "BLOG_POST", clientId: null, dueWeek: false, overdue: false });
    expect(findMany.mock.calls.at(-1)?.[0].where).toEqual({ AND: [{ status: "DRAFT" }, { type: "BLOG_POST" }] });
    expect(groupBy.mock.calls.at(-1)?.[0].where).toEqual({ AND: [{ type: "BLOG_POST" }] });
  });
});

describe("getContentFormOptions", () => {
  it("returns clients with their active flag and managers", async () => {
    findClients.mockResolvedValueOnce([{ id: "c1", name: "Lumen", isActive: true }]);
    findUsers.mockResolvedValueOnce([{ id: "u1", name: "Ayşe" }]);
    await expect(getContentFormOptions("u1")).resolves.toEqual({
      clients: [{ id: "c1", name: "Lumen", isActive: true }],
      managers: [{ id: "u1", name: "Ayşe" }],
      currentUserId: "u1",
    });
  });
});
