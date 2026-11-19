// Vitest alias target for the `server-only` package (see vitest.config.ts).
// The real package unconditionally throws on import; Next.js swaps it for a
// no-op via a webpack alias in server bundles. This mirrors that so
// lib/db/*.ts and lib/prisma.ts can be imported in tests.
export {};
