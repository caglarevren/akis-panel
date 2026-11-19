import type { ContentType, Platform } from "@/generated/prisma/enums";

// Single source of truth for which platforms each content type can target.
// The first entry is the default when the type changes in a form.
export const PLATFORMS_BY_TYPE = {
  SOCIAL_POST: ["INSTAGRAM", "LINKEDIN", "X", "TIKTOK", "FACEBOOK"],
  BLOG_POST: ["BLOG", "MEDIUM"],
  WEB_PAGE: ["WEBSITE"],
  OTHER: ["NEWSLETTER"],
} as const satisfies Record<ContentType, readonly Platform[]>;

export function isPlatformAllowed(type: ContentType, platform: Platform): boolean {
  return (PLATFORMS_BY_TYPE[type] as readonly Platform[]).includes(platform);
}

export function defaultPlatformFor(type: ContentType): Platform {
  return PLATFORMS_BY_TYPE[type][0];
}

// Short monospace label shown in the platform badge.
export const PLATFORM_ABBR: Record<Platform, string> = {
  INSTAGRAM: "IG",
  LINKEDIN: "in",
  X: "X",
  TIKTOK: "TT",
  FACEBOOK: "FB",
  BLOG: "BL",
  MEDIUM: "M",
  WEBSITE: "WEB",
  NEWSLETTER: "NL",
};
