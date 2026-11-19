import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { hasLocale } from "next-intl";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

// Paths (after the locale prefix) reachable without a session.
const PUBLIC_PATHS = ["/login"];

// The whole panel is behind auth. Unprefixed URLs go straight to next-intl,
// which redirects them to a locale-prefixed URL; that second request is the
// one checked here.
export const proxy = auth((request) => {
  const { pathname, search } = request.nextUrl;
  const [, locale, ...rest] = pathname.split("/");

  if (!hasLocale(routing.locales, locale)) {
    return handleI18nRouting(request);
  }

  const isPublic = PUBLIC_PATHS.includes(`/${rest.join("/")}`);

  if (!request.auth && !isPublic) {
    const loginUrl = new URL(`/${locale}/login`, request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (request.auth && isPublic) {
    return NextResponse.redirect(new URL(`/${locale}`, request.nextUrl));
  }

  return handleI18nRouting(request);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
