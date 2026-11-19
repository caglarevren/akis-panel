import { ContentStatus, ContentType } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";

export interface ContentFilters {
  q: string;
  status: ContentStatus | null;
  type: ContentType | null;
  clientId: string | null;
  // Not yet published, publish day within the next 7 days (today included).
  dueWeek: boolean;
  // Not yet published, publish day already passed.
  overdue: boolean;
}

export const EMPTY_FILTERS: ContentFilters = {
  q: "",
  status: null,
  type: null,
  clientId: null,
  dueWeek: false,
  overdue: false,
};

type SearchParams = Record<string, string | string[] | undefined>;

const single = (value: string | string[] | undefined) => (typeof value === "string" ? value.trim() : "");

function oneOf<T extends string>(values: Record<string, T>, value: string): T | null {
  return (Object.values(values) as string[]).includes(value) ? (value as T) : null;
}

export function parseContentFilters(params: SearchParams): ContentFilters {
  return {
    q: single(params.q),
    status: oneOf(ContentStatus, single(params.status)),
    type: oneOf(ContentType, single(params.type)),
    clientId: single(params.client) || null,
    dueWeek: single(params.due) === "week",
    overdue: single(params.overdue) === "1",
  };
}

export function hasActiveFilters(filters: ContentFilters): boolean {
  return Boolean(filters.q || filters.status || filters.type || filters.clientId || filters.dueWeek || filters.overdue);
}

// Inverse of parseContentFilters, for links that change one filter and keep
// the rest. Pass `null`/`false` in `changes` to drop a filter.
export function filtersToQuery(filters: ContentFilters, changes: Partial<ContentFilters> = {}): string {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.status) params.set("status", next.status);
  if (next.type) params.set("type", next.type);
  if (next.clientId) params.set("client", next.clientId);
  if (next.dueWeek) params.set("due", "week");
  if (next.overdue) params.set("overdue", "1");
  const query = params.toString();
  return query ? `?${query}` : "";
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Prisma filter for the list. `ignoreStatus` builds the base used for the
// per-status tab counts, so each tab shows what selecting it would return.
export function buildContentWhere(
  filters: ContentFilters,
  today: Date,
  { ignoreStatus = false }: { ignoreStatus?: boolean } = {},
): Prisma.ContentWhereInput {
  const and: Prisma.ContentWhereInput[] = [];
  if (filters.q) and.push({ title: { contains: filters.q, mode: "insensitive" } });
  if (filters.status && !ignoreStatus) and.push({ status: filters.status });
  if (filters.type) and.push({ type: filters.type });
  if (filters.clientId) and.push({ clientId: filters.clientId });
  if (filters.dueWeek) {
    and.push({ status: { not: "PUBLISHED" }, publishDate: { gte: today, lt: new Date(today.getTime() + 7 * DAY_MS) } });
  }
  if (filters.overdue) and.push({ status: { not: "PUBLISHED" }, publishDate: { lt: today } });
  return and.length > 0 ? { AND: and } : {};
}
