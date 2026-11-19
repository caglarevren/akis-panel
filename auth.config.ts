import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Edge-compatible half of the config, used by proxy.ts. Prisma and bcrypt are
// not Edge-safe, so the real authorize() lives in auth.ts and overrides this
// placeholder provider.
export default {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: { identifier: {}, password: {} },
      authorize: async () => null,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
