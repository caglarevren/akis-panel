import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findFirst: vi.fn(),
  findUser: vi.fn(),
  createClient: vi.fn(),
  createActivity: vi.fn(),
  deleteClient: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/prisma", () => {
  const tx = { client: { create: mocks.createClient }, activity: { create: mocks.createActivity } };
  return {
    prisma: {
      client: { findFirst: mocks.findFirst, delete: mocks.deleteClient },
      user: { findUnique: mocks.findUser },
      $transaction: (fn: (t: typeof tx) => unknown) => fn(tx),
    },
  };
});

import { createClient, deleteClient } from "./clients";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const VALID = { name: "Lumen Kahve", ownerId: "u2", brandColor: "#C2410C" };

describe("createClient", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.auth.mockResolvedValue({ user: { id: "u1" } });
    mocks.findFirst.mockResolvedValue(null);
    mocks.findUser.mockResolvedValue({ id: "u2" });
    mocks.createClient.mockResolvedValue({ id: "c1" });
  });

  it("refuses without a session", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    await expect(createClient(null, form(VALID))).resolves.toEqual({ success: false, error: "unauthorized" });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it("returns field errors without touching the database", async () => {
    const result = await createClient(null, form({ brandColor: "#C2410C" }));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { name: "required", ownerId: "required" } });
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });

  it("creates the client and logs CLIENT_CREATED as the signed-in user", async () => {
    const result = await createClient(null, form(VALID));
    expect(result).toEqual({ success: true, data: { id: "c1" } });
    expect(mocks.createClient).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: "Lumen Kahve", ownerId: "u2" }) }));
    expect(mocks.createActivity).toHaveBeenCalledWith({ data: { kind: "CLIENT_CREATED", userId: "u1", clientId: "c1" } });
    expect(mocks.revalidatePath).toHaveBeenCalled();
  });

  it("checks names case-insensitively", async () => {
    mocks.findFirst.mockResolvedValueOnce({ id: "existing" });
    const result = await createClient(null, form({ ...VALID, name: "lumen kahve" }));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { name: "duplicate" } });
    expect(mocks.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { name: { equals: "lumen kahve", mode: "insensitive" } } }));
  });

  it("rejects an unknown owner", async () => {
    mocks.findUser.mockResolvedValueOnce(null);
    const result = await createClient(null, form(VALID));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { ownerId: "invalid" } });
  });

  it("maps a unique-index race to a duplicate name error", async () => {
    mocks.createClient.mockRejectedValueOnce(Object.assign(new Error("Unique"), { code: "P2002" }));
    const result = await createClient(null, form(VALID));
    expect(result).toEqual({ success: false, error: "validation", fieldErrors: { name: "duplicate" } });
  });

  it("reports other failures as server-error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.createClient.mockRejectedValueOnce(new Error("boom"));
    await expect(createClient(null, form(VALID))).resolves.toEqual({ success: false, error: "server-error" });
  });
});

describe("deleteClient", () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.auth.mockResolvedValue({ user: { id: "u1" } });
  });

  it("refuses without a session", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    await expect(deleteClient("c1")).resolves.toEqual({ success: false, error: "unauthorized" });
    expect(mocks.deleteClient).not.toHaveBeenCalled();
  });

  it("deletes the client without revalidating its own page", async () => {
    await expect(deleteClient("c1")).resolves.toEqual({ success: true });
    expect(mocks.deleteClient).toHaveBeenCalledWith({ where: { id: "c1" } });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("returns not-found when it is already gone", async () => {
    mocks.deleteClient.mockRejectedValueOnce(Object.assign(new Error("missing"), { code: "P2025" }));
    await expect(deleteClient("c1")).resolves.toEqual({ success: false, error: "not-found" });
  });

  it("reports unexpected failures as server-error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.deleteClient.mockRejectedValueOnce(new Error("boom"));
    await expect(deleteClient("c1")).resolves.toEqual({ success: false, error: "server-error" });
  });
});
