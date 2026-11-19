import type { ContentStatus, ContentType, Platform } from "@/generated/prisma/enums";

// One row of a content list. Carries everything the edit sheet needs, so
// opening an item doesn't wait for a round trip.
export interface ContentListItem {
  id: string;
  title: string;
  type: ContentType;
  platform: Platform;
  status: ContentStatus;
  publishDate: Date | null;
  notes: string | null;
  clientId: string;
  clientName: string;
  clientColor: string;
  assigneeId: string;
  assigneeName: string;
  createdAt: Date;
}

export interface ContentFormClientOption {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ContentFormOptions {
  clients: ContentFormClientOption[];
  managers: { id: string; name: string }[];
  // Default assignee for new content.
  currentUserId: string;
}

export type ContentField = "title" | "clientId" | "type" | "platform" | "publishDate" | "assigneeId" | "notes";

export type ContentFieldError = "required" | "too-long" | "invalid" | "inactive-client";

export interface ContentInput {
  title: string;
  clientId: string;
  type: ContentType;
  platform: Platform;
  publishDate: Date | null;
  assigneeId: string;
  notes: string | null;
}

export type SaveContentResult =
  | { success: true; data: { id: string } }
  | {
      success: false;
      error: "validation" | "unauthorized" | "not-found" | "server-error";
      fieldErrors?: Partial<Record<ContentField, ContentFieldError>>;
    };
