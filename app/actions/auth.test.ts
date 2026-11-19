import { beforeEach, describe, expect, it, vi } from "vitest";

const { signIn, signOut } = vi.hoisted(() => ({ signIn: vi.fn(), signOut: vi.fn() }));

vi.mock("@/auth", () => ({ signIn, signOut }));
// The real next-auth entry imports next/server, which only resolves inside a
// Next.js build. The action only needs AuthError for its instanceof check.
vi.mock("next-auth", () => ({
  AuthError: class AuthError extends Error {
    type: string;
    constructor(type: string) {
      super(type);
      this.type = type;
    }
  },
}));

import { AuthError } from "next-auth";
import { login, logout } from "./auth";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const makeAuthError = (type: string) => new (AuthError as unknown as new (type: string) => Error)(type);

describe("login", () => {
  beforeEach(() => {
    signIn.mockReset();
    signOut.mockReset();
  });

  it("rejects missing fields without calling signIn", async () => {
    const result = await login({ success: false }, form({ email: "  ", password: "", locale: "tr" }));
    expect(result).toEqual({ success: false, error: "missing-fields", email: "  " });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("normalizes the email and redirects to a safe callbackUrl", async () => {
    await login({ success: false }, form({ email: " Ayse@Ajans.com ", password: "secret123", locale: "de", callbackUrl: "/de/inhalte" }));
    expect(signIn).toHaveBeenCalledWith("credentials", { email: "ayse@ajans.com", password: "secret123", redirectTo: "/de/inhalte" });
  });

  it("ignores an external callbackUrl and falls back to the locale home", async () => {
    await login({ success: false }, form({ email: "a@b.co", password: "x", locale: "ru", callbackUrl: "https://evil.example" }));
    expect(signIn).toHaveBeenCalledWith("credentials", expect.objectContaining({ redirectTo: "/ru" }));
  });

  it("falls back to the default locale when the locale field is invalid", async () => {
    await login({ success: false }, form({ email: "a@b.co", password: "x", locale: "xx" }));
    expect(signIn).toHaveBeenCalledWith("credentials", expect.objectContaining({ redirectTo: "/tr" }));
  });

  it("maps wrong credentials to invalid-credentials and keeps the email", async () => {
    signIn.mockRejectedValueOnce(makeAuthError("CredentialsSignin"));
    const result = await login({ success: false }, form({ email: "a@b.co", password: "wrong", locale: "tr" }));
    expect(result).toEqual({ success: false, error: "invalid-credentials", email: "a@b.co" });
  });

  it("maps other auth failures to server-error", async () => {
    signIn.mockRejectedValueOnce(makeAuthError("CallbackRouteError"));
    const result = await login({ success: false }, form({ email: "a@b.co", password: "x", locale: "tr" }));
    expect(result.error).toBe("server-error");
  });

  it("rethrows non-auth errors such as the redirect signal", async () => {
    const redirect = new Error("NEXT_REDIRECT");
    signIn.mockRejectedValueOnce(redirect);
    await expect(login({ success: false }, form({ email: "a@b.co", password: "x", locale: "tr" }))).rejects.toBe(redirect);
  });
});

describe("logout", () => {
  it("redirects to the login page of the given locale", async () => {
    await logout("en");
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/en/login" });
  });

  it("falls back to the default locale for an unknown locale", async () => {
    await logout("xx");
    expect(signOut).toHaveBeenLastCalledWith({ redirectTo: "/tr/login" });
  });
});
