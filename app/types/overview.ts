import type { ActivityKind, ContentStatus } from "@/generated/prisma/enums";
import type { StatusCounts } from "@/app/types/client";
import type { ContentListItem } from "@/app/types/content";

export interface OverviewActivity {
  id: string;
  kind: ActivityKind;
  createdAt: Date;
  userName: string;
  clientId: string;
  clientName: string;
  contentTitle: string | null;
  toStatus: ContentStatus | null;
}

export interface OverviewData {
  activeClients: number;
  statusCounts: StatusCounts;
  totalContents: number;
  dueWeekCount: number;
  overdueCount: number;
  // Everything with a publish day in the next 7 days, any status.
  weekItems: ContentListItem[];
  // Soonest first, capped; `statusCounts.IN_REVIEW` has the full count.
  inReview: ContentListItem[];
  recentActivity: OverviewActivity[];
}
