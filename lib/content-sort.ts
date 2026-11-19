import type { ContentStatus } from "@/generated/prisma/enums";

interface Sortable {
  status: ContentStatus;
  publishDate: Date | null;
}

// Work still to do comes first, soonest publish day first (undated last);
// published items follow, most recent first.
export function sortForList<T extends Sortable>(items: readonly T[]): T[] {
  const time = (item: T) => item.publishDate?.getTime();
  const open = items
    .filter((item) => item.status !== "PUBLISHED")
    .sort((a, b) => (time(a) ?? Infinity) - (time(b) ?? Infinity));
  const published = items
    .filter((item) => item.status === "PUBLISHED")
    .sort((a, b) => (time(b) ?? -Infinity) - (time(a) ?? -Infinity));
  return [...open, ...published];
}
