import type { ContentStatus } from "@/generated/prisma/enums";

// How long after a status change its author can still undo it. Longer than
// the toast is visible, to absorb slow connections.
export const UNDO_WINDOW_MS = 2 * 60 * 1000;

// The natural next step offered as the primary action. Moving backwards is
// always possible from the status menu.
export const NEXT_STATUS: Record<ContentStatus, ContentStatus | null> = {
  DRAFT: "IN_REVIEW",
  IN_REVIEW: "PUBLISHED",
  PUBLISHED: null,
};
