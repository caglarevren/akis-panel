import type { ContentStatus } from "@/generated/prisma/enums";
import type { ContentListItem } from "@/app/types/content";

export type StatusCounts = Record<ContentStatus, number>;

export type ClientStatusFilter = "all" | "active" | "inactive";

export interface ClientListItem {
  id: string;
  name: string;
  sector: string | null;
  brandColor: string;
  isActive: boolean;
  ownerName: string;
  statusCounts: StatusCounts;
  totalContents: number;
  // Earliest upcoming publish day among not-yet-published contents.
  nextPublishDate: Date | null;
}

export interface ClientList {
  clients: ClientListItem[];
  // Counts per filter tab, with the search query applied.
  filterCounts: Record<ClientStatusFilter, number>;
}

export interface ClientDetail {
  id: string;
  name: string;
  sector: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  brandColor: string;
  isActive: boolean;
  ownerName: string;
  contents: ContentListItem[];
}

export interface AccountManagerOption {
  id: string;
  name: string;
}

export type ClientField = "name" | "sector" | "ownerId" | "contactName" | "contactEmail" | "contactPhone" | "brandColor";

export type ClientFieldError = "required" | "too-long" | "duplicate" | "invalid";

export interface ClientInput {
  name: string;
  sector: string | null;
  ownerId: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  brandColor: string;
}

export type CreateClientResult =
  | { success: true; data: { id: string } }
  | {
      success: false;
      error: "validation" | "unauthorized" | "server-error";
      fieldErrors?: Partial<Record<ClientField, ClientFieldError>>;
    };
