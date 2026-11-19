import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Migrations/introspection run through the schema engine, which needs the
// direct (unpooled) Neon connection. The pooled DATABASE_URL is only used by
// the runtime client (see lib/prisma.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
