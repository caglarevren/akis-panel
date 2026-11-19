# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks
- Form fields that must survive a failed Server Action are controlled (`useState` + `value`/`onChange`): React 19 resets uncontrolled fields of a `<form action>` after every action, success or not.

## Next.js

- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs)
- Use Server Actions for form submissions and simple mutations
- Use API routes only when needed (webhooks, specific HTTP status codes/headers, third-party integrations); otherwise fetch data directly in server components
- Before using a Next.js API, read the matching guide in `node_modules/next/dist/docs/` (see AGENTS.md)
- After adding a route, run `npx next typegen` if `PageProps<"/...">` types are not yet generated

## Routing & Auth

- Every page lives under `app/[locale]/`. Route groups: `(auth)` for public pages (login), `(app)` for the authenticated panel.
- `proxy.ts` protects everything except `PUBLIC_PATHS` (currently `/login`, after the locale prefix). Unauthenticated requests are redirected to `/{locale}/login?callbackUrl=...`; signed-in users visiting `/login` go to `/{locale}`.
- Post-login redirect targets always go through `safeRedirect()` (`lib/safe-redirect.ts`).
- Auth uses the split config pattern: `auth.config.ts` is Edge-safe (used by `proxy.ts`), `auth.ts` holds the Prisma + bcrypt `authorize()`.
- No self-registration. Accounts are created with `npm run db:create-user`.

## Internationalization (i18n)

- Library: `next-intl`. Locales: `tr` (default), `en`, `ru`, `de`. Always locale-prefixed URLs.
- Config: `i18n/routing.ts`, `i18n/navigation.ts` (use its `Link`/`useRouter`/`usePathname` instead of `next/link`/`next/navigation`), `i18n/request.ts`.
- Strings live in `messages/{locale}.json`, same key structure in all four files. Add every new key to all four in the same change.
- Only UI strings are translated. User-entered data (client names, content titles, notes) is shown as entered.
- Format dates, numbers and relative times with next-intl's formatters (`useFormatter` / `getFormatter`), never by hand.
- German copy is roughly 30-40% longer: check buttons, table headers and the sidebar in `de` before calling a screen done.

## Tailwind CSS v4

**CRITICAL**: Tailwind CSS v4 uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js`
- All theme configuration lives in `app/globals.css` (`@theme inline` + CSS custom properties)
- Design tokens come from the approved prototype (`context/prototype/akis-prototip.html`). Use the semantic tokens, never raw hex values in components:
  - surfaces/text: `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-subtle`, `border-border`
  - accent: `bg-primary`, `text-primary`, `bg-primary-soft`
  - status: `text-status-draft` / `bg-status-draft-bg`, `text-status-review` / `bg-status-review-bg`, `text-status-published` / `bg-status-published-bg`
- Dark mode: `next-themes` toggles the `.dark` class; every token is redefined under `.dark`.

## File Organization

No `src/` directory — `app/` lives at the repo root.

- Components: `app/components/[feature]/ComponentName.tsx`
- Pages: `app/[locale]/(group)/[route]/page.tsx`
- Server Actions: `app/actions/[feature].ts`
- Types: `app/types/[feature].ts`
- DB reads: `lib/db/[feature].ts` — server-only modules that query Prisma and shape results for components. Never query Prisma directly in `page.tsx`.
- Utilities: `lib/[utility].ts`
- shadcn/ui components: `components/ui/` (repo root, shadcn CLI default). `lib/utils.ts` (`cn()`) follows the same exception.

## Naming

- Components: PascalCase (`ClientCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling, no inline styles (exception: a CSS custom property carrying user data, e.g. a client's brand color `style={{ "--c": color }}`)
- shadcn/ui: style `base-nova`, base color `neutral`, icons `lucide-react`. Add components with `npx shadcn@latest add <component>`.
- After every `shadcn add`, check the new files for `import { cn } from "cn"` and change it to `@/lib/utils` (upstream template bug, also seen in bastur-frontend). Don't otherwise hand-edit `components/ui/`.

## Database

Prisma 7 + Neon Postgres. Schema at `prisma/schema.prisma`, client generated to `generated/prisma` (on `npm install` via `postinstall`). Runtime client singleton at `lib/prisma.ts` (pooled `DATABASE_URL`, `@prisma/adapter-neon`, cached on `globalThis`). Migrations use the unpooled `DIRECT_URL` (`prisma.config.ts`). Use the Neon `development` branch day-to-day; never touch `production` unless explicitly asked.

## Testing

Vitest. Scope: **server actions (`app/actions/**`) and utilities (`lib/**`) only, not components.**

- Tests are colocated as `name.test.ts`.
- `npm run test` / `npm run test:watch`. Config: `vitest.config.mts`; `@/*` resolves like the app; `server-only` is aliased to a no-op (`test/server-only-mock.ts`).
- Mock `@/lib/prisma` in any test that touches the database. Tests never hit a real database.
- The `next-auth` root entry imports `next/server`, which only resolves inside Next.js. Mock `@/auth` and `next-auth` (see `app/actions/auth.test.ts`).
- A `vi.fn()` standing in for a constructor needs a `function`/`class` implementation, not an arrow function.

## Data Fetching & Mutations

- Fetch data directly in server components (through `lib/db/*`)
- Client components use Server Actions for mutations
- Validate all input in the Server Action before use
- Status changes use optimistic UI (`useOptimistic`) with an undo toast

## Error Handling

- Use try/catch in Server Actions
- Return the `{ success, data?, error? }` pattern from actions; `error` is a code, the UI maps it to a translated message
- Show user-facing results via toast (sonner); inline field errors for forms

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
