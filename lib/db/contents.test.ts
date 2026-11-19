import { describe, expect, it, vi } from "vitest";

const { count, findMany, findClients, findUsers } = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
  findClients: vi.fn(),
  findUsers: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: { content: { count, findMany }, client: { findMany: findClients }, user: { findMany: findUsers } },
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
    const list = await getContentList();
    expect(list.map((item) => [item.id, item.clientName, item.assigneeName])).toEqual([
      ["draft", "Atlas", "Mert"],
      ["pub", "Lumen", "Ayşe"],
    ]);
    expect(list[0]).not.toHaveProperty("client");
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
