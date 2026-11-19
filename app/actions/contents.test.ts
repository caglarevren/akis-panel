import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findClient: vi.fn(),
  findUser: vi.fn(),
  findContent: vi.fn(),
  updateContent: vi.fn(),
  createContent: vi.fn(),
  createActivity: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/prisma", () => {
  const tx = { content: { create: mocks.createContent }, activity: { create: mocks.createActivity } };
  return {
    prisma: {
      client: { findUnique: mocks.findClient },
      user: { findUnique: mocks.findUser },
      content: { findUnique: mocks.findContent, update: mocks.updateContent },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});

import { createContent, updateContent } from "./contents";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = { title: "Kış menüsü", clientId: "c1", type: "SOCIAL_POST", platform: "INSTAGRAM", assigneeId: "u2" };

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.auth.mockResolvedValue({ user: { id: "u1" } });
  mocks.findClient.mockResolvedValue({ isActive: true });
  mocks.findUser.mockResolvedValue({ id: "u2" });
  mocks.createContent.mockResolvedValue({ id: "k1" });
  mocks.findContent.mockResolvedValue({ clientId: "c1" });
});

describe("createContent", () => {
  it("refuses without a session", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    await expect(createContent(null, form(VALID))).resolves.toEqual({ success: false, error: "unauthorized" });
  });

  it("creates a draft and logs CONTENT_CREATED only", async () => {
    const result = await createContent(null, form({ ...VALID, intent: "draft" }));
    expect(result).toEqual({ success: true, data: { id: "k1" } });
    expect(mocks.createContent).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "DRAFT" }) }));
    expect(mocks.createActivity).toHaveBeenCalledTimes(1);
    expect(mocks.createActivity).toHaveBeenCalledWith({ data: { userId: "u1", clientId: "c1", contentId: "k1", kind: "CONTENT_CREATED" } });
  });

  it("sends for review and logs the DRAFT → IN_REVIEW transition", async () => {
    await createContent(null, form({ ...VALID, intent: "review" }));
    expect(mocks.createContent).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "IN_REVIEW" }) }));
    expect(mocks.createActivity).toHaveBeenLastCalledWith({
      data: { userId: "u1", clientId: "c1", contentId: "k1", kind: "STATUS_CHANGED", fromStatus: "DRAFT", toStatus: "IN_REVIEW" },
    });
  });

  it("returns field errors before touching the database", async () => {
    const result = await createContent(null, form({ ...VALID, title: "" }));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { title: "required" } });
    expect(mocks.findClient).not.toHaveBeenCalled();
  });

  it("does not create content for an inactive client", async () => {
    mocks.findClient.mockResolvedValueOnce({ isActive: false });
    const result = await createContent(null, form(VALID));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { clientId: "inactive-client" } });
    expect(mocks.createContent).not.toHaveBeenCalled();
  });

  it("rejects unknown client and assignee", async () => {
    mocks.findClient.mockResolvedValueOnce(null);
    mocks.findUser.mockResolvedValueOnce(null);
    const result = await createContent(null, form(VALID));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { clientId: "invalid", assigneeId: "invalid" } });
  });

  it("reports unexpected failures as server-error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.createContent.mockRejectedValueOnce(new Error("boom"));
    await expect(createContent(null, form(VALID))).resolves.toEqual({ success: false, error: "server-error" });
  });
});

describe("updateContent", () => {
  it("updates fields without changing status or logging activity", async () => {
    const result = await updateContent("k1", null, form({ ...VALID, title: "Yeni başlık", publishDate: "2026-11-25" }));
    expect(result).toEqual({ success: true, data: { id: "k1" } });
    const call = mocks.updateContent.mock.calls[0][0];
    expect(call.where).toEqual({ id: "k1" });
    expect(call.data.title).toBe("Yeni başlık");
    expect(call.data).not.toHaveProperty("status");
    expect(mocks.createActivity).not.toHaveBeenCalled();
  });

  it("returns not-found for a missing content", async () => {
    mocks.findContent.mockResolvedValueOnce(null);
    await expect(updateContent("missing", null, form(VALID))).resolves.toEqual({ success: false, error: "not-found" });
  });

  it("lets an item stay on its inactive client", async () => {
    mocks.findClient.mockResolvedValueOnce({ isActive: false });
    const result = await updateContent("k1", null, form(VALID));
    expect(result.success).toBe(true);
  });

  it("refuses moving an item to another inactive client", async () => {
    mocks.findClient.mockResolvedValueOnce({ isActive: false });
    const result = await updateContent("k1", null, form({ ...VALID, clientId: "c9" }));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { clientId: "inactive-client" } });
  });
});
