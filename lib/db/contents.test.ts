import { describe, expect, it, vi } from "vitest";

const { count } = vi.hoisted(() => ({ count: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { content: { count } } }));

import { getInReviewCount } from "./contents";

describe("getInReviewCount", () => {
  it("counts only contents in review", async () => {
    count.mockResolvedValueOnce(4);
    await expect(getInReviewCount()).resolves.toBe(4);
    expect(count).toHaveBeenCalledWith({ where: { status: "IN_REVIEW" } });
  });
});
