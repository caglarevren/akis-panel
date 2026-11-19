import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findContent: vi.fn(),
  updateContent: vi.fn(),
  findActivity: vi.fn(),
  countActivities: vi.fn(),
  createActivity: vi.fn(),
  deleteActivity: vi.fn(),
  findFirstActivity: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/prisma", () => {
  const tx = {
    content: { update: mocks.updateContent },
    activity: { create: mocks.createActivity, delete: mocks.deleteActivity, findFirst: mocks.findFirstActivity },
  };
  return {
    prisma: {
      content: { findUnique: mocks.findContent },
      activity: { findUnique: mocks.findActivity, count: mocks.countActivities },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});

import { UNDO_WINDOW_MS } from "@/lib/content-status";
import { changeContentStatus, undoStatusChange } from "./content-status";

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.auth.mockResolvedValue({ user: { id: "u1" } });
  mocks.findContent.mockResolvedValue({ status: "DRAFT", clientId: "c1" });
  mocks.createActivity.mockResolvedValue({ id: "a1" });
  mocks.countActivities.mockResolvedValue(0);
});

describe("changeContentStatus", () => {
  it("refuses without a session or with an unknown status", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    await expect(changeContentStatus("k1", "PUBLISHED")).resolves.toEqual({ success: false, error: "unauthorized" });
    await expect(changeContentStatus("k1", "ARCHIVED")).resolves.toEqual({ success: false, error: "invalid" });
  });

  it("returns not-found for a missing content", async () => {
    mocks.findContent.mockResolvedValueOnce(null);
    await expect(changeContentStatus("k1", "IN_REVIEW")).resolves.toEqual({ success: false, error: "not-found" });
  });

  it("is a no-op when the status is unchanged", async () => {
    await expect(changeContentStatus("k1", "DRAFT")).resolves.toEqual({ success: true, data: { activityId: null } });
    expect(mocks.updateContent).not.toHaveBeenCalled();
    expect(mocks.createActivity).not.toHaveBeenCalled();
  });

  it("updates the status and logs the transition", async () => {
    const result = await changeContentStatus("k1", "IN_REVIEW");
    expect(result).toEqual({ success: true, data: { activityId: "a1" } });
    expect(mocks.updateContent).toHaveBeenCalledWith({ where: { id: "k1" }, data: { status: "IN_REVIEW", publishedAt: null } });
    expect(mocks.createActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          kind: "STATUS_CHANGED",
          userId: "u1",
          clientId: "c1",
          contentId: "k1",
          fromStatus: "DRAFT",
          toStatus: "IN_REVIEW",
          createdAt: expect.any(Date),
        },
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalled();
  });

  it("stamps publishedAt with the same instant as the activity", async () => {
    mocks.findContent.mockResolvedValueOnce({ status: "IN_REVIEW", clientId: "c1" });
    await changeContentStatus("k1", "PUBLISHED");
    const publishedAt = mocks.updateContent.mock.calls[0][0].data.publishedAt;
    expect(publishedAt).toBeInstanceOf(Date);
    expect(mocks.createActivity.mock.calls[0][0].data.createdAt).toBe(publishedAt);
  });

  it("reports unexpected failures as server-error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.updateContent.mockRejectedValueOnce(new Error("boom"));
    await expect(changeContentStatus("k1", "PUBLISHED")).resolves.toEqual({ success: false, error: "server-error" });
  });
});

describe("undoStatusChange", () => {
  const recent = (overrides: Record<string, unknown> = {}) => ({
    kind: "STATUS_CHANGED",
    userId: "u1",
    contentId: "k1",
    fromStatus: "IN_REVIEW",
    toStatus: "PUBLISHED",
    createdAt: new Date(Date.now() - 5_000),
    content: { status: "PUBLISHED" },
    ...overrides,
  });

  it("reverts the status, clears publishedAt and deletes the activity", async () => {
    mocks.findActivity.mockResolvedValueOnce(recent());
    await expect(undoStatusChange("a1")).resolves.toEqual({ success: true });
    expect(mocks.deleteActivity).toHaveBeenCalledWith({ where: { id: "a1" } });
    expect(mocks.updateContent).toHaveBeenCalledWith({ where: { id: "k1" }, data: { status: "IN_REVIEW", publishedAt: null } });
  });

  it("restores publishedAt from history when going back to PUBLISHED", async () => {
    const publishedAt = new Date("2026-11-10T09:00:00Z");
    mocks.findActivity.mockResolvedValueOnce(recent({ fromStatus: "PUBLISHED", toStatus: "DRAFT", content: { status: "DRAFT" } }));
    mocks.findFirstActivity.mockResolvedValueOnce({ createdAt: publishedAt });
    await undoStatusChange("a1");
    expect(mocks.updateContent).toHaveBeenCalledWith({ where: { id: "k1" }, data: { status: "PUBLISHED", publishedAt } });
  });

  it.each([
    ["someone else's change", { userId: "u2" }],
    ["an old change", { createdAt: new Date(Date.now() - UNDO_WINDOW_MS - 1_000) }],
    ["a content that has moved on", { content: { status: "DRAFT" } }],
    ["a non-status activity", { kind: "CONTENT_CREATED" }],
  ])("refuses to undo %s", async (_label, overrides) => {
    mocks.findActivity.mockResolvedValueOnce(recent(overrides));
    await expect(undoStatusChange("a1")).resolves.toEqual({ success: false, error: "expired" });
    expect(mocks.updateContent).not.toHaveBeenCalled();
  });

  it("refuses when a newer status change exists", async () => {
    mocks.findActivity.mockResolvedValueOnce(recent());
    mocks.countActivities.mockResolvedValueOnce(1);
    await expect(undoStatusChange("a1")).resolves.toEqual({ success: false, error: "expired" });
  });

  it("refuses an unknown activity", async () => {
    mocks.findActivity.mockResolvedValueOnce(null);
    await expect(undoStatusChange("missing")).resolves.toEqual({ success: false, error: "expired" });
  });
});
