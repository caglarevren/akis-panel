import { describe, expect, it } from "vitest";
import { ContentType, Platform } from "@/generated/prisma/enums";
import { PLATFORMS_BY_TYPE, defaultPlatformFor, isPlatformAllowed } from "./content-options";

describe("content options", () => {
  it("assigns every platform to exactly one content type", () => {
    const assigned = Object.values(PLATFORMS_BY_TYPE).flat();
    expect([...assigned].sort()).toEqual(Object.values(Platform).sort());
  });

  it("covers every content type", () => {
    expect(Object.keys(PLATFORMS_BY_TYPE).sort()).toEqual(Object.values(ContentType).sort());
  });

  it("accepts a platform that belongs to the type", () => {
    expect(isPlatformAllowed("SOCIAL_POST", "LINKEDIN")).toBe(true);
    expect(isPlatformAllowed("WEB_PAGE", "WEBSITE")).toBe(true);
  });

  it("rejects a platform from another type", () => {
    expect(isPlatformAllowed("BLOG_POST", "INSTAGRAM")).toBe(false);
    expect(isPlatformAllowed("OTHER", "WEBSITE")).toBe(false);
  });

  it("uses the first listed platform as the default", () => {
    expect(defaultPlatformFor("SOCIAL_POST")).toBe("INSTAGRAM");
    expect(defaultPlatformFor("OTHER")).toBe("NEWSLETTER");
  });
});
