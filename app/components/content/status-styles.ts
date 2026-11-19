import type { ContentStatus } from "@/generated/prisma/enums";

export const STATUS_ORDER: ContentStatus[] = ["DRAFT", "IN_REVIEW", "PUBLISHED"];

// Full class names (not built from strings) so Tailwind can see them.
export const STATUS_STYLES: Record<ContentStatus, { pill: string; dot: string }> = {
  DRAFT: { pill: "bg-status-draft-bg text-status-draft", dot: "bg-status-draft" },
  IN_REVIEW: { pill: "bg-status-review-bg text-status-review", dot: "bg-status-review" },
  PUBLISHED: { pill: "bg-status-published-bg text-status-published", dot: "bg-status-published" },
};
