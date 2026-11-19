import { defineConfig } from "vitest/config";
import path from "node:path";

const rootDir = import.meta.dirname;

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next", "generated"],
  },
  resolve: {
    alias: [
      { find: "server-only", replacement: path.resolve(rootDir, "test/server-only-mock.ts") },
      { find: "@", replacement: rootDir },
    ],
  },
});
