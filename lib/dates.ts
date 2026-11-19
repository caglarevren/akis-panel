// The agency works in Turkey. "Today", overdue checks and publish days are
// computed in this zone so they don't depend on where the server runs.
export const APP_TIME_ZONE = "Europe/Istanbul";

const DAY_MS = 24 * 60 * 60 * 1000;

// Calendar day of `date` in `timeZone`, as UTC midnight. This is the same
// representation Prisma uses for `@db.Date` columns (e.g. Content.publishDate),
// so the two can be compared directly.
export function calendarDay(date: Date, timeZone: string = APP_TIME_ZONE): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
}

export function today(): Date {
  return calendarDay(new Date());
}

// Whole days from `from` to `to`; both must be calendar days (UTC midnight).
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}
