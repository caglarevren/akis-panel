import { describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  clientCount: vi.fn(),
  groupBy: vi.fn(),
  contentCount: vi.fn(),
  contentFindMany: vi.fn(),
  activityFindMany: vi.fn(),
}));
vi.mock("@/lib/dates", () => ({ today: () => new Date("2026-11-19T00:00:00Z") }));
vi.mock("@/lib/db/contents", () => ({
  CONTENT_LIST_SELECT: {},
  toContentListItem: (item: { id: string }) => ({ ...item, mapped: true }),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    client: { count: m.clientCount },
    content: { groupBy: m.groupBy, count: m.contentCount, findMany: m.contentFindMany },
    activity: { findMany: m.activityFindMany },
  },
}));

import { getOverview } from "./overview";

describe("getOverview", () => {
  it("assembles counts, lists and activity", async () => {
    m.clientCount.mockResolvedValueOnce(3);
    m.groupBy.mockResolvedValueOnce([
      { status: "DRAFT", _count: { _all: 3 } },
      { status: "IN_REVIEW", _count: { _all: 4 } },
      { status: "PUBLISHED", _count: { _all: 5 } },
    ]);
    m.contentCount.mockResolvedValueOnce(4).mockResolvedValueOnce(1);
    m.contentFindMany.mockResolvedValueOnce([{ id: "w1" }]).mockResolvedValueOnce([{ id: "r1" }]);
    m.activityFindMany.mockResolvedValueOnce([
      {
        id: "a1",
        kind: "STATUS_CHANGED",
        createdAt: new Date(),
        toStatus: "IN_REVIEW",
        clientId: "c1",
        user: { name: "Ayşe Kaya" },
        client: { name: "Lumen Kahve" },
        content: { title: "Kış menüsü" },
      },
      { id: "a2", kind: "CLIENT_CREATED", createdAt: new Date(), toStatus: null, clientId: "c2", user: { name: "Mert" }, client: { name: "Atlas" }, content: null },
    ]);

    const overview = await getOverview();

    expect(overview).toMatchObject({
      activeClients: 3,
      statusCounts: { DRAFT: 3, IN_REVIEW: 4, PUBLISHED: 5 },
      totalContents: 12,
      dueWeekCount: 4,
      overdueCount: 1,
      weekItems: [{ id: "w1", mapped: true }],
      inReview: [{ id: "r1", mapped: true }],
    });
    expect(overview.recentActivity).toEqual([
      expect.objectContaining({ id: "a1", userName: "Ayşe Kaya", clientName: "Lumen Kahve", contentTitle: "Kış menüsü", toStatus: "IN_REVIEW" }),
      expect.objectContaining({ id: "a2", contentTitle: null }),
    ]);
  });

  it("limits the week list to the next 7 calendar days", async () => {
    m.clientCount.mockResolvedValueOnce(0);
    m.groupBy.mockResolvedValueOnce([]);
    m.contentCount.mockResolvedValue(0);
    m.contentFindMany.mockResolvedValue([]);
    m.activityFindMany.mockResolvedValueOnce([]);
    await getOverview();
    const weekQuery = m.contentFindMany.mock.calls.find((call) => call[0].where.publishDate)?.[0];
    expect(weekQuery.where.publishDate).toEqual({
      gte: new Date("2026-11-19T00:00:00Z"),
      lt: new Date("2026-11-26T00:00:00Z"),
    });
  });
});
