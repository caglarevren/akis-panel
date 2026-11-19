import "server-only";
import { prisma } from "@/lib/prisma";
import { sortForList } from "@/lib/content-sort";
import { CONTENT_LIST_SELECT, toContentListItem } from "@/lib/db/contents";
import { today } from "@/lib/dates";
import type {
  ClientDetail,
  ClientList,
  ClientListItem,
  ClientStatusFilter,
  StatusCounts,
} from "@/app/types/client";

const emptyCounts = (): StatusCounts => ({ DRAFT: 0, IN_REVIEW: 0, PUBLISHED: 0 });

interface ClientListQuery {
  q?: string;
  status?: ClientStatusFilter;
}

// Three queries regardless of client count: the clients, their content
// counts per status, and each client's next publish day.
export async function getClientList({ q = "", status = "all" }: ClientListQuery = {}): Promise<ClientList> {
  const search = q.trim();
  const clients = await prisma.client.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sector: { contains: search, mode: "insensitive" } },
            { contactName: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, sector: true, brandColor: true, isActive: true, owner: { select: { name: true } } },
  });

  const ids = clients.map((client) => client.id);
  const [statusGroups, nextGroups] = await Promise.all([
    prisma.content.groupBy({ by: ["clientId", "status"], where: { clientId: { in: ids } }, _count: { _all: true } }),
    prisma.content.groupBy({
      by: ["clientId"],
      where: { clientId: { in: ids }, status: { not: "PUBLISHED" }, publishDate: { gte: today() } },
      _min: { publishDate: true },
    }),
  ]);

  const countsByClient = new Map<string, StatusCounts>();
  for (const group of statusGroups) {
    const counts = countsByClient.get(group.clientId) ?? emptyCounts();
    counts[group.status] = group._count._all;
    countsByClient.set(group.clientId, counts);
  }
  const nextByClient = new Map(nextGroups.map((group) => [group.clientId, group._min.publishDate]));

  const items: ClientListItem[] = clients.map((client) => {
    const statusCounts = countsByClient.get(client.id) ?? emptyCounts();
    return {
      id: client.id,
      name: client.name,
      sector: client.sector,
      brandColor: client.brandColor,
      isActive: client.isActive,
      ownerName: client.owner.name,
      statusCounts,
      totalContents: statusCounts.DRAFT + statusCounts.IN_REVIEW + statusCounts.PUBLISHED,
      nextPublishDate: nextByClient.get(client.id) ?? null,
    };
  });

  const active = items.filter((item) => item.isActive);
  const inactive = items.filter((item) => !item.isActive);
  const byFilter = { all: items, active, inactive } satisfies Record<ClientStatusFilter, ClientListItem[]>;

  return {
    clients: byFilter[status],
    filterCounts: { all: items.length, active: active.length, inactive: inactive.length },
  };
}

export async function getClientDetail(id: string): Promise<ClientDetail | null> {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      contents: { select: CONTENT_LIST_SELECT },
    },
  });
  if (!client) return null;

  return {
    id: client.id,
    name: client.name,
    sector: client.sector,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    brandColor: client.brandColor,
    isActive: client.isActive,
    ownerName: client.owner.name,
    contents: sortForList(client.contents.map(toContentListItem)),
  };
}
