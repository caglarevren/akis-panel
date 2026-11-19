import "server-only";
import { prisma } from "@/lib/prisma";
import { EMPTY_FILTERS, buildContentWhere, type ContentFilters } from "@/lib/content-filters";
import { sortForList } from "@/lib/content-sort";
import { today } from "@/lib/dates";
import type { StatusCounts } from "@/app/types/client";
import type { ContentFormOptions, ContentListItem } from "@/app/types/content";
import type { Prisma } from "@/generated/prisma/client";

export const CONTENT_LIST_SELECT = {
  id: true,
  title: true,
  type: true,
  platform: true,
  status: true,
  publishDate: true,
  notes: true,
  clientId: true,
  assigneeId: true,
  createdAt: true,
  client: { select: { name: true, brandColor: true } },
  assignee: { select: { name: true } },
} satisfies Prisma.ContentSelect;

type ContentRecord = Prisma.ContentGetPayload<{ select: typeof CONTENT_LIST_SELECT }>;

export function toContentListItem({ client, assignee, ...content }: ContentRecord): ContentListItem {
  return { ...content, clientName: client.name, clientColor: client.brandColor, assigneeName: assignee.name };
}

export async function getInReviewCount(): Promise<number> {
  return prisma.content.count({ where: { status: "IN_REVIEW" } });
}

export interface ContentListResult {
  items: ContentListItem[];
  // Per-status counts with every filter except status applied.
  statusCounts: StatusCounts;
}

export async function getContentList(filters: ContentFilters = EMPTY_FILTERS): Promise<ContentListResult> {
  const day = today();
  const [contents, groups] = await Promise.all([
    prisma.content.findMany({ where: buildContentWhere(filters, day), select: CONTENT_LIST_SELECT }),
    prisma.content.groupBy({
      by: ["status"],
      where: buildContentWhere(filters, day, { ignoreStatus: true }),
      _count: { _all: true },
    }),
  ]);
  const statusCounts: StatusCounts = { DRAFT: 0, IN_REVIEW: 0, PUBLISHED: 0 };
  for (const group of groups) statusCounts[group.status] = group._count._all;
  return { items: sortForList(contents.map(toContentListItem)), statusCounts };
}

// Choices for the content sheet's selects. Inactive clients are included so
// an existing item on one can still show its client; the form only offers
// them in that case.
export async function getContentFormOptions(currentUserId: string): Promise<ContentFormOptions> {
  const [clients, managers] = await Promise.all([
    prisma.client.findMany({ select: { id: true, name: true, isActive: true }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  return { clients, managers, currentUserId };
}
