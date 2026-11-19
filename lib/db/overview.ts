import "server-only";
import { prisma } from "@/lib/prisma";
import { EMPTY_FILTERS, buildContentWhere } from "@/lib/content-filters";
import { today } from "@/lib/dates";
import { CONTENT_LIST_SELECT, toContentListItem } from "@/lib/db/contents";
import type { StatusCounts } from "@/app/types/client";
import type { OverviewData } from "@/app/types/overview";

const DAY_MS = 24 * 60 * 60 * 1000;
export const OVERVIEW_LIST_LIMIT = 5;

// A fixed number of queries, run in parallel, whatever the data size. The
// 7-day and overdue counts reuse the list filters so the cards and the
// lists they link to always agree.
export async function getOverview(): Promise<OverviewData> {
  const day = today();
  const weekEnd = new Date(day.getTime() + 7 * DAY_MS);

  const [activeClients, groups, dueWeekCount, overdueCount, weekItems, inReview, activities] = await Promise.all([
    prisma.client.count({ where: { isActive: true } }),
    prisma.content.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.content.count({ where: buildContentWhere({ ...EMPTY_FILTERS, dueWeek: true }, day) }),
    prisma.content.count({ where: buildContentWhere({ ...EMPTY_FILTERS, overdue: true }, day) }),
    prisma.content.findMany({
      where: { publishDate: { gte: day, lt: weekEnd } },
      orderBy: [{ publishDate: "asc" }, { status: "asc" }, { title: "asc" }],
      select: CONTENT_LIST_SELECT,
    }),
    prisma.content.findMany({
      where: { status: "IN_REVIEW" },
      orderBy: [{ publishDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
      take: OVERVIEW_LIST_LIMIT,
      select: CONTENT_LIST_SELECT,
    }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: OVERVIEW_LIST_LIMIT,
      select: {
        id: true,
        kind: true,
        createdAt: true,
        toStatus: true,
        clientId: true,
        user: { select: { name: true } },
        client: { select: { name: true } },
        content: { select: { title: true } },
      },
    }),
  ]);

  const statusCounts: StatusCounts = { DRAFT: 0, IN_REVIEW: 0, PUBLISHED: 0 };
  for (const group of groups) statusCounts[group.status] = group._count._all;

  return {
    activeClients,
    statusCounts,
    totalContents: statusCounts.DRAFT + statusCounts.IN_REVIEW + statusCounts.PUBLISHED,
    dueWeekCount,
    overdueCount,
    weekItems: weekItems.map(toContentListItem),
    inReview: inReview.map(toContentListItem),
    recentActivity: activities.map((activity) => ({
      id: activity.id,
      kind: activity.kind,
      createdAt: activity.createdAt,
      userName: activity.user.name,
      clientId: activity.clientId,
      clientName: activity.client.name,
      contentTitle: activity.content?.title ?? null,
      toStatus: activity.toStatus,
    })),
  };
}
