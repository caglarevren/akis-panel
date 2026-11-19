import { ContentType, Platform } from "@/generated/prisma/enums";
import { isPlatformAllowed } from "@/lib/content-options";
import type { ContentField, ContentFieldError, ContentInput } from "@/app/types/content";

export const CONTENT_LIMITS = { title: 160, notes: 5000 } as const;

type FieldErrors = Partial<Record<ContentField, ContentFieldError>>;

export type ContentValidation = { ok: true; data: ContentInput } | { ok: false; fieldErrors: FieldErrors };

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isOneOf<T extends string>(values: Record<string, T>, value: string): value is T {
  return (Object.values(values) as string[]).includes(value);
}

// "YYYY-MM-DD" from <input type="date"> → UTC midnight of that day, the
// representation used for @db.Date. Rejects impossible days like 2026-02-30.
export function parseCalendarDate(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

// Shape and format checks. Whether the client and assignee exist (and the
// client is active) needs the database and is checked in the server action.
export function validateContentForm(form: FormData): ContentValidation {
  const errors: FieldErrors = {};
  const title = text(form, "title");
  const clientId = text(form, "clientId");
  const type = text(form, "type");
  const platform = text(form, "platform");
  const publishDateRaw = text(form, "publishDate");
  const assigneeId = text(form, "assigneeId");
  const notes = text(form, "notes");

  if (!title) errors.title = "required";
  else if (title.length > CONTENT_LIMITS.title) errors.title = "too-long";
  if (!clientId) errors.clientId = "required";
  if (!assigneeId) errors.assigneeId = "required";
  if (notes.length > CONTENT_LIMITS.notes) errors.notes = "too-long";

  const validType = isOneOf(ContentType, type);
  if (!validType) errors.type = "invalid";
  if (!isOneOf(Platform, platform) || (validType && !isPlatformAllowed(type, platform))) errors.platform = "invalid";

  const publishDate = publishDateRaw ? parseCalendarDate(publishDateRaw) : null;
  if (publishDateRaw && !publishDate) errors.publishDate = "invalid";

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };

  return {
    ok: true,
    data: {
      title,
      clientId,
      type: type as ContentType,
      platform: platform as Platform,
      publishDate,
      assigneeId,
      notes: notes || null,
    },
  };
}
