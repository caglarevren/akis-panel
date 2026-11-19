"use server";

import { AuthError } from "next-auth";
import { hasLocale } from "next-intl";
import { signIn, signOut } from "@/auth";
import { routing } from "@/i18n/routing";
import { safeRedirect } from "@/lib/safe-redirect";
import type { LoginState } from "@/app/types/auth";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const locale = formData.get("locale");
  const fallback = `/${hasLocale(routing.locales, locale) ? locale : routing.defaultLocale}`;

  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return { success: false, error: "missing-fields", email: typeof email === "string" ? email : "" };
  }

  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirectTo: safeRedirect(formData.get("callbackUrl"), fallback),
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      const code = error.type === "CredentialsSignin" ? "invalid-credentials" : "server-error";
      return { success: false, error: code, email };
    }
    // signIn() signals a successful redirect by throwing; let Next.js handle it.
    throw error;
  }
}

export async function logout(locale: string) {
  const target = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  await signOut({ redirectTo: `/${target}/login` });
}
