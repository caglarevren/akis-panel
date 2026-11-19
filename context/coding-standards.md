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

- Every page lives under `app/[locale]/`. Route groups: `(auth)` for public pages (login), `(app)` for the authenticated panel. `(app)/layout.tsx` renders the shell (desktop sidebar from `lg`, mobile top bar + sheet below it) and re-checks the session.
- URL slugs are English and identical in every locale (`/tr/clients`, `/de/contents`); no next-intl `pathnames`.
- List filters live in the URL (`?q=`, `?status=`). Filter tabs are plain links (`SegmentedLinks`); search inputs debounce into `router.replace` and adopt external URL changes during render (see `ClientSearch.tsx`).
- The content sheet is mounted once in `(app)/layout.tsx` via `ContentSheetProvider`; open it with `useContentSheet().openNew(clientId?)` / `openEdit(item)`. List rows carry every field the sheet needs (`ContentListItem`, `CONTENT_LIST_SELECT` + `toContentListItem` in `lib/db/contents.ts`), so opening never waits on the server.
- `updateContent` never changes status; status changes go through `changeContentStatus` (`app/actions/content-status.ts`) so every transition writes an `Activity` row. `publishedAt` and the activity's `createdAt` share one timestamp; `publishedAt` is null outside PUBLISHED.
- Undo (`undoStatusChange`) deletes the activity row and reverts the status; only the author, within `UNDO_WINDOW_MS`, and only while it's the latest change. Show status changes through `useStatusChange()` (toast + undo) and `StatusMenu`; lists use `useOptimistic`.
- `"use server"` files may only export async functions; shared constants for actions live in `lib/` (e.g. `lib/content-status.ts`).
- Base UI menu radio/checkbox items keep the menu open by default; pass `closeOnClick` when a pick is final.
- Overview numbers that link to a filtered list must be computed with the same filter (`buildContentWhere`), so a card and its target list always agree (see `lib/db/overview.ts`).
- Content list filters: parse/serialize with `lib/content-filters.ts` (`parseContentFilters`, `filtersToQuery`, `buildContentWhere`); tab counts use `ignoreStatus`.
- Shared content building blocks: `app/components/content/` (`StatusPill`, `StatusDot`, `StatusBar`, `PlatformBadge`, `PublishDay`, `status-styles.ts`). Reuse them instead of restyling statuses.
- "Today", overdue and publish-day math go through `lib/dates.ts` (`today()`, `calendarDay()`, `daysBetween()`); publish days are formatted with `timeZone: "UTC"` because they are stored as UTC midnight.
- Shell building blocks live in `app/components/shell/`: `PageHeader` (title, optional eyebrow/description/actions) opens every panel page.
- The language switcher does a full page load on purpose (see `LocaleSwitcher.tsx`); don't switch it back to `router.replace`.
- `proxy.ts` protects everything except `PUBLIC_PATHS` (currently `/login`, after the locale prefix). Unauthenticated requests are redirected to `/{locale}/login?callbackUrl=...`; signed-in users visiting `/login` go to `/{locale}`.
- Post-login redirect targets always go through `safeRedirect()` (`lib/safe-redirect.ts`).
- Auth uses the split config pattern: `auth.config.ts` is Edge-safe (used by `proxy.ts`), `auth.ts` holds the Prisma + bcrypt `authorize()`.
- No self-registration. Accounts are created with `npm run db:create-user`.

## Internationalization (i18n)

- Library: `next-intl`. Locales: `tr` (default), `en`, `ru`, `de`. Always locale-prefixed URLs.
- Config: `i18n/routing.ts`, `i18n/navigation.ts` (use its `Link`/`useRouter`/`usePathname` instead of `next/link`/`next/navigation`), `i18n/request.ts`.
- Strings live in `messages/{locale}.json`, same key structure in all four files. Add every new key to all four in the same change.
- Only UI strings are translated. User-entered data (client names, content titles, notes) is shown as entered.
- Format dates, numbers and relative times with next-intl's formatters (`useFormatter` / `getFormatter`), never by hand. The time zone is fixed to `Europe/Istanbul` in `i18n/request.ts`.
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

- Enums (`ContentType`, `ContentStatus`, `Platform`, `ActivityKind`) are imported from `@/generated/prisma/enums` (browser-safe) in shared code; `@/generated/prisma/client` only in server code.
- Every status change writes an `Activity` row (`STATUS_CHANGED` with `fromStatus`/`toStatus`) in the same transaction as the update. Creating a client or content writes `CLIENT_CREATED` / `CONTENT_CREATED`.
- `publishDate` is a calendar day (`@db.Date`): store it as UTC midnight of the chosen day and format it without time-zone conversion.

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
- Validate all input in the Server Action before use. Pure form validation lives in `lib/validation/[feature].ts` (testable); checks that need the database (uniqueness, foreign keys) stay in the action.
- Server Actions re-check the session (`auth()`) themselves; `proxy.ts` is not enough on its own.
- Status changes use optimistic UI (`useOptimistic`) with an undo toast

## Error Handling

- Use try/catch in Server Actions
- Return the `{ success, data?, error? }` pattern from actions; `error` is a code, the UI maps it to a translated message
- Show user-facing results via toast (sonner); inline field errors for forms

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
