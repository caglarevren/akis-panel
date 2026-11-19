import "server-only";
import { prisma } from "@/lib/prisma";
import { sortForList } from "@/lib/content-sort";
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

export async function getContentList(): Promise<ContentListItem[]> {
  const contents = await prisma.content.findMany({ select: CONTENT_LIST_SELECT });
  return sortForList(contents.map(toContentListItem));
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
