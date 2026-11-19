import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

// Compared against when the email doesn't exist, so a missing account takes
// as long as a wrong password and response timing can't reveal which emails
// are registered.
const DUMMY_HASH = "$2b$12$5lgNKGofYQkFv3k3fQMnAO5jo7FJG38gcsPqZvIE8CikNQ1L4XOfW";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !passwordMatches) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
