# Current Feature

## Status
Complete

## Goals

## Notes

## History

### 2026-05-01 — Code Editor + Type-Specific New Item Button
- Installed `@monaco-editor/react`
- Created `src/components/ui/CodeEditor.tsx` — Monaco Editor with `vs-dark` theme, macOS window dots (red/yellow/green), language label and copy button in header, fluid height (min 120px, max 400px) via `onDidContentSizeChange`, 6px styled scrollbar
- Updated `src/components/items/ItemDrawer.tsx` — `ViewBody` renders `<CodeEditor readOnly />` for snippet/command content instead of `<pre><code>`; `EditForm` renders `<CodeEditor>` for editable content when `showLanguage` is true (snippet/command), plain textarea for other text types
- Updated `src/components/items/CreateItemDialog.tsx` — content field uses `<CodeEditor>` for snippet/command types, plain textarea for prompt/note
- Created `src/components/dashboard/DashboardContext.tsx` — React context exposing `openCreate(typeId?)`, provided by `DashboardShell`
- Updated `src/components/dashboard/DashboardShell.tsx` — added `createTypeId` state, `openCreate()` function, wraps layout in `DashboardContext`, passes `initialTypeId` to `CreateItemDialog`
- Updated `src/components/items/CreateItemDialog.tsx` — accepts `initialTypeId` prop; `useEffect` syncs selected type when dialog opens
- Created `src/components/items/NewItemButton.tsx` — client component using `useDashboard()` context to call `openCreate(typeId)`, styled with type color
- Updated `src/app/items/[type]/page.tsx` — renders `<NewItemButton>` in the page heading; destructures new `typeId` from `getItemsByType` result
- Updated `getItemsByType` in `src/lib/db/items.ts` — return type now includes `typeId` alongside `typeName` and `typeColor`
- Added 5 unit tests in `src/lib/db/items.test.ts` for `getItemsByType` covering null return, slug stripping, typeId/typeName/typeColor in result, userId scoping, and item mapping

### 2026-04-30 — Item Create
- Installed shadcn `Dialog` component (`src/components/ui/dialog.tsx`)
- Added `createItem(userId, data)` to `src/lib/db/items.ts` — creates item with tag connect-or-create, returns `ItemDetail`
- Added `createItemAction` to `src/actions/items.ts` — Zod-validated server action with URL-required refinement for link type, `{ success, data, error }` return pattern
- Created `src/components/items/CreateItemDialog.tsx` — Dialog with type selector (snippet, prompt, command, note, link; file/image excluded), conditional fields per type (content+language for snippet/command, content for prompt/note, URL for link), comma-separated tags, form reset on close
- Updated `src/components/dashboard/TopBar.tsx` — added `onNewItem` prop, wired to "New Item" button
- Updated `src/components/dashboard/DashboardShell.tsx` — added `createOpen` state, renders `<CreateItemDialog>` with `itemTypes` prop, passes `onNewItem` to `TopBar`
- Added 6 unit tests in `src/actions/items.test.ts` for `createItemAction` covering unauthorized, empty title, link-without-url, empty typeId, success, and url-type-with-valid-url paths

### 2026-04-30 — Item Drawer Edit Mode
- Installed `zod` and `sonner`; added `<Toaster richColors position="bottom-right" />` to root layout
- Added `updateItem(id, userId, data)` to `src/lib/db/items.ts` — checks ownership, disconnects all tag links, connect-or-creates new ones, returns updated `ItemDetail`
- Created `src/actions/items.ts` with `updateItemAction` — Zod-validated server action, auth + ownership check, `{ success, data, error }` return pattern
- Updated `src/components/items/ItemDrawer.tsx` — Edit button toggles inline edit mode; action bar replaced with Save/Cancel; `EditForm` component with title input, description textarea, type-specific fields (content, language, url), comma-separated tags input; non-editable fields (type, collections, dates) shown as display-only; accessibility fix: `SheetTitle` rendered `sr-only` in edit mode
- Updated `src/components/items/ItemDrawerProvider.tsx` — passes `onUpdate={setDetail}` so saved data refreshes the drawer in-place without a second fetch
- Added 8 unit tests in `src/actions/items.test.ts` covering auth, Zod validation, not-found, success path, and empty-string-to-null coercion for url and language
- Fixed pre-existing bug: all list queries (`getPinnedItems`, `getRecentItems`, `getDashboardStats`, `getItemTypesWithCounts`, `getItemsByType`, `getSidebarCollections`, `getRecentCollections`) were unscoped — added `userId` parameter to all and updated callers in `DashboardPage`, `ItemsPage`, `DashboardMain`, and `StatsCards`

### 2026-04-30 — Item Drawer
- Installed shadcn `Sheet` component (`src/components/ui/sheet.tsx`)
- Added `getItemById(id, userId)` to `src/lib/db/items.ts` — fetches full item detail (content, url, language, collections, tags) scoped to the requesting user
- Created `GET /api/items/[id]/route.ts` — auth-checked API route that calls `getItemById`
- Created `src/components/items/ItemDrawer.tsx` — Sheet-based drawer with header (title, type badge, language badge), action bar (Favorite, Pin, Copy, Edit, Delete), scrollable body (description, content/code block, tags, collections, created/updated dates), and skeleton loading state
- Created `src/components/items/ItemDrawerProvider.tsx` — client context managing `open(itemId)`, fetches detail on click, renders the `ItemDrawer`
- Updated `ItemCard` and `ItemRow` to be `'use client'` components using `useItemDrawer()` to open the drawer on click
- Updated `DashboardShell` to wrap `<main>` with `ItemDrawerProvider` — drawer available on all pages (dashboard + items list)
- Added 6 unit tests for `getItemById` in `src/lib/db/items.test.ts` covering null-return, userId scoping, tag/collection mapping, and scalar field mapping

### 2026-04-30 — Vitest Unit Testing Setup
- Installed `vitest` and configured `vitest.config.ts` with Node environment and native tsconfig path resolution
- Created `src/__tests__/setup.ts` — global mocks for `next/headers`, `next/navigation`, `next/cache`
- Added `src/lib/rate-limit.test.ts` — 4 smoke tests for `getIP` utility
- Added `npm run test` (watch) and `npm run test:run` (CI) scripts
- Updated `CLAUDE.md` and `context/ai-interaction.md` to document test scope and workflow step

### 2026-04-30 — Items List 3-Column Layout
- Updated grid in `src/app/items/[type]/page.tsx` from `md:grid-cols-2` to `md:grid-cols-2 lg:grid-cols-3`
- Items now show 1 column on mobile, 2 on `md` (768px+), 3 on `lg` (1024px+)

### 2026-04-04 — Initial Next.js Setup
- Bootstrapped Next.js 16 with App Router, React 19, TypeScript, and Tailwind CSS v4
- Configured Geist fonts and global styles in `src/app/globals.css`
- Added remote origin and pushed initial codebase to `git@github.com:Liutabu/devstash.git`

### 2026-04-05 — Dashboard UI Phase 1
- Initialized shadcn/ui (v4.1.2) with Tailwind CSS v4 support
- Installed `Button` and `Input` shadcn components
- Created `/dashboard` route with full-height layout
- Built `TopBar` component with search input and "New Collection" / "+ New Item" buttons (display only)
- Added sidebar and main area placeholders
- Set dark mode by default via `dark` class on `<html>`
- Fixed Geist font not loading — shadcn init generated a self-referencing `--font-sans` CSS variable
- Added `suppressHydrationWarning` to `<html>` and `<body>` to suppress browser extension attribute injection

### 2026-04-07 — Dashboard UI Phase 2
- Created `Sidebar` component with Types nav (colored icons + counts), Favorites and All Collections sections, user avatar area at the bottom
- Created `DashboardShell` client wrapper managing collapse state (desktop) and open/close state (mobile drawer)
- Updated `TopBar` with `PanelLeft` desktop toggle and `Menu` mobile hamburger button
- Desktop sidebar collapses to 52px icon-only strip, expands to 240px with smooth CSS transition
- Mobile sidebar is a fixed slide-in drawer with a backdrop overlay
- Type links route to `/items/[slug]`, collection links route to `/collections/[id]`

### 2026-04-07 — Dashboard UI Phase 3
- Created `StatsCards` component with 4 stat cards: total items, collections, favorite items, favorite collections
- Created `CollectionCard` component with colored top border, icon chips, item count, and star indicator
- Created `ItemRow` component with colored left border, type badge, tags, and pin/favorite indicators
- Created `DashboardMain` assembling all sections: heading, stats, collections grid, pinned items, 10 recent items
- Updated dashboard page to render `DashboardMain` inside `DashboardShell`

### 2026-04-09 — Prisma + Neon PostgreSQL setup
- Installed Prisma 7, `@prisma/adapter-pg`, `pg`, `dotenv`
- Created `prisma/schema.prisma` with all models (`User`, `ItemType`, `Item`, `Collection`, `ItemCollection`, `Tag`, `TagsOnItems`) plus NextAuth models, with indexes and cascade deletes
- Created `prisma.config.ts` at project root — datasource URL lives here in Prisma 7, not in the schema
- Created `src/lib/prisma.ts` singleton using `PrismaPg` driver adapter (required by Prisma 7)
- Generated client to `src/generated/prisma/` (gitignored)
- Ran initial migration `20260409143823_init` against Neon dev branch
- Created `scripts/test-db.ts` to verify connection and table row counts
- Import path for generated client: `@/generated/prisma/client`

### 2026-04-09 — Seed demo data
- Created `prisma/seed.ts` to populate database with sample data for development and demos
- Creates demo user (`demo@devstash.io`) with bcryptjs-hashed password (12 rounds)
- Seeds all 7 system item types
- Creates 5 collections with realistic items (snippets, prompts, commands, links)
- Wires up tags and collection memberships
- Seed is idempotent (safe to re-run)
- Uses `PrismaPg` adapter directly (same pattern as `src/lib/prisma.ts`)
- Run with: `npx prisma db seed`

### 2026-04-09 — Dashboard collections from database
- Created `src/lib/db/collections.ts` with `getRecentCollections()` — fetches 6 most recent collections via Prisma, joins through `ItemCollection → Item → ItemType` to compute dominant color and icon list per collection
- Converted `DashboardMain` to an async server component, replaced `mockCollections` with real DB fetch
- Fixed `src/lib/prisma.ts` to explicitly set `sslmode=verify-full` on the connection string, eliminating a pg SSL warning in the dev overlay

### 2026-04-09 — Dashboard items from database
- Created `src/lib/db/items.ts` with `getPinnedItems()`, `getRecentItems(limit)`, and `getDashboardStats()` — each item query joins `itemType` and `tags` via Prisma relations
- Converted `StatsCards` to an async server component, replaced mock counts with real DB aggregates via `prisma.item.count` / `prisma.collection.count`
- Updated `DashboardMain` to fetch pinned and recent items from DB in parallel; pinned section conditionally hidden when no pinned items exist
- Removed all `mockItems` / `mockCollections` usage from dashboard components

### 2026-04-09 — Stats & sidebar from database
- Added `getItemTypesWithCounts()` to `src/lib/db/items.ts` — fetches system item types with per-type item counts and derived slug
- Added `getSidebarCollections()` to `src/lib/db/collections.ts` — fetches favorites first then recents, computes dominant color per collection
- Updated `Sidebar` to accept `itemTypes` and `collections` props; recents now show a colored circle; added "View all collections" link to `/collections`
- Updated `DashboardShell` to accept and forward sidebar data props to both desktop and mobile `<Sidebar>` instances
- Converted `DashboardPage` to async server component; fetches sidebar data in parallel and passes to `DashboardShell`

### 2026-04-10 — Add Pro Badge to Sidebar
- Installed shadcn/ui `Badge` component (`src/components/ui/badge.tsx`)
- Added a "PRO" badge next to the File and Image types in the sidebar type list
- Badge uses `badgeVariants({ variant: 'secondary' })` applied to a `<span>` (the `<Badge>` component itself rendered incorrectly due to a base-ui rendering issue in this context)
- Badge is only shown when the sidebar is expanded; identified by slug (`'files'` / `'images'`)

### 2026-04-10 — Code Quality Quick Wins
- Extracted `ITEM_TYPE_ICON_MAP` to `src/lib/item-type-icons.ts` — was duplicated verbatim in `Sidebar`, `CollectionCard`, and `ItemRow`
- Removed `'use client'` from `TopBar` — it has no hooks or state; rendered inside an existing client component so `onClick` props still work
- Added `src/app/dashboard/error.tsx` — Next.js App Router error boundary for dashboard DB failures
- Deleted dead exports from `src/lib/mock-data.ts` (`mockCollections`, `mockItems`, `mockItemTypeCounts`)
- Fixed React key in `CollectionCard` icon list from array index to `iconName`
- Added `take: 100` cap to nested items include in both `getSidebarCollections` and `getRecentCollections` to prevent unbounded memory load

### 2026-04-13 — Auth Setup - NextAuth v5 + GitHub OAuth
- Installed `next-auth@beta` and `@auth/prisma-adapter`
- Created `src/auth.config.ts` — edge-compatible config with GitHub provider only
- Created `src/auth.ts` — full config with `PrismaAdapter`, JWT session strategy, and `session.user.id` callback
- Created `src/app/api/auth/[...nextauth]/route.ts` — exports GET/POST handlers
- Created `src/proxy.ts` — named `proxy` export; protects `/dashboard/*` routes, redirects unauthenticated users to sign-in with `callbackUrl`
- Created `src/types/next-auth.d.ts` — extends `Session` type with `user.id`
- Uses split config pattern for edge compatibility (adapter only in `auth.ts`, not in `auth.config.ts`)

### 2026-04-14 — Auth Credentials - Email/Password Provider
- `password` field was already present in `User` model — no migration needed
- Added Credentials provider placeholder with `credentials` fields to `src/auth.config.ts` (edge-safe, `authorize: () => null`)
- Overrode Credentials provider in `src/auth.ts` with bcrypt validation — looks up user by email, compares hash, returns user or null
- Created `src/app/api/auth/register/route.ts` (`POST /api/auth/register`) — validates name/email/password/confirmPassword, checks for existing user (409), hashes with bcryptjs (12 rounds), excludes password from response via `select`
- `credentials` fields defined on both config and auth providers so the built-in sign-in page renders email/password inputs

### 2026-04-23 — Auth UI - Sign In, Register & Sign Out
- Created `src/app/(auth)/sign-in/page.tsx` — server-rendered sign-in page with email/password form, GitHub OAuth button, error display via `?error=` params, and register link
- Created `src/app/(auth)/register/page.tsx` — server-rendered register page with full validation and error display via `?error=` params
- Created `src/actions/auth.ts` — `signInWithCredentials`, `signInWithGitHub`, `registerAction`, `signOutAction` server actions
- Created `src/app/(auth)/layout.tsx` — centered auth layout
- Updated `src/auth.ts` — added `pages: { signIn: '/sign-in' }` config
- Updated `src/proxy.ts` — middleware now redirects unauthenticated users to `/sign-in`
- Created `src/components/ui/UserAvatar.tsx` — renders GitHub image or initials (first+last name uppercase) with consistent sizing
- Updated `Sidebar` — replaced `mockUser` with real session user prop; added avatar dropdown with Profile link and Sign out form action
- Updated `DashboardShell` — accepts and forwards `user` prop to both Sidebar instances
- Updated `DashboardPage` — fetches session via `auth()` in parallel with other data and passes user to shell

### 2026-04-24 — Email Verification on Register
- Installed `resend` package
- Created `src/lib/email.ts` — Resend client + `sendVerificationEmail` (from: `onboarding@resend.dev`, link expires 24h)
- Created `src/app/(auth)/verify-email/page.tsx` — validates token, sets `emailVerified`, deletes token, redirects to `/sign-in?verified=1`; handles expired/invalid token with error redirects
- Created `src/app/(auth)/check-email/page.tsx` — "check your inbox" page shown after registration
- Updated `registerAction` in `src/actions/auth.ts` — generates 32-byte hex token, stores in `VerificationToken`, sends email, redirects to `/check-email`
- Updated `src/app/api/auth/register/route.ts` — same token + email logic for API route
- Updated `src/auth.ts` — added `UnverifiedEmailError extends CredentialsSignin` (code: `'unverified'`); `authorize` throws it when `emailVerified` is null
- Updated `src/actions/auth.ts` — `signInWithCredentials` catches `unverified` code and redirects to `/sign-in?error=unverified`
- Updated sign-in page — added `unverified`, `invalid_token`, `token_expired` error messages and `verified=1` success banner
- Added `scripts/reset-users.ts` + `db:reset-users` npm script — deletes all users except `demo@devstash.io` and all their content

### 2026-04-24 — Email Verification Toggle Flag
- Added `REQUIRE_EMAIL_VERIFICATION` env variable — set to `"false"` to disable verification, any other value (or unset) keeps it enabled
- Updated `registerAction` in `src/actions/auth.ts` — skips token generation + Resend call and redirects to `/sign-in` when disabled
- Updated `src/app/api/auth/register/route.ts` — same skip for the API route path
- Updated `src/auth.ts` — `authorize` skips `emailVerified` null check when disabled, allowing immediate sign-in
- Documented the variable in `.env.example` with an explanatory comment

### 2026-04-24 — Forgot Password
- Added `sendPasswordResetEmail` to `src/lib/email.ts` — reset link with 1-hour expiry, same style as verification email
- Added `forgotPasswordAction` to `src/actions/auth.ts` — deletes any existing reset token for the email, generates a new 32-byte hex token stored as `reset:{email}` identifier in `VerificationToken`, sends email; always redirects to `?sent=1` regardless of whether email exists (no enumeration)
- Added `resetPasswordAction` to `src/actions/auth.ts` — validates token exists and has `reset:` prefix, checks expiry, hashes new password with bcryptjs (12 rounds), updates user, deletes token, redirects to `/sign-in?reset=1`
- Created `src/app/(auth)/forgot-password/page.tsx` — email form; shows generic success message after submit; routes expired/invalid token errors here
- Created `src/app/(auth)/reset-password/page.tsx` — validates token server-side on load (redirects to `/forgot-password` if invalid/expired); renders password form with hidden token field
- Updated sign-in page — added "Forgot password?" link next to password label and `reset=1` success banner

### 2026-04-25 — Profile Page
- Created `src/lib/db/profile.ts` with `getProfileData(userId)` — fetches user info, hasPassword flag, total items/collections, and per-item-type counts (using `groupBy` for efficiency)
- Created `src/actions/profile.ts` with `changePasswordAction` (validates current password, hashes new one, redirects with success/error params) and `deleteAccountAction` (deletes user, signs out)
- Created `src/components/profile/DeleteAccountButton.tsx` — client component with two-step confirmation (click to reveal warning + confirm/cancel buttons)
- Created `src/app/profile/page.tsx` — async server component; shows avatar, name, email, join date; usage stats with item type breakdown; change password form (email users only, hidden for OAuth); danger zone with delete account
- Updated `src/proxy.ts` — added `/profile` to protected route matcher alongside `/dashboard`

### 2026-04-27 — Rate Limiting for Auth
- Installed `@upstash/ratelimit` and `@upstash/redis`
- Created `src/lib/rate-limit.ts` — Redis client, 5 pre-configured sliding window limiters, `checkRateLimit` (fails open on Upstash errors), `getIP` helper (reads `x-forwarded-for` / `x-real-ip`)
- Rate limited login (5/15 min, IP + email) in `signInWithCredentials` server action via `headers()`
- Rate limited register (3/1 hr, IP) in both `registerAction` and `POST /api/auth/register`
- Rate limited forgot-password (3/1 hr, IP) in `forgotPasswordAction`
- Rate limited reset-password (5/15 min, IP) in `resetPasswordAction`
- Created `POST /api/auth/resend-verification` (3/15 min, IP + email) — sends new verification email; always returns 200 to avoid enumeration
- Added `resendVerificationAction` to `src/actions/auth.ts` — same logic as API route for server-action path
- API routes return 429 with `Retry-After` header; server actions redirect with `?error=rate_limited`
- Updated sign-in page — `rate_limited` error, `resent=1` success banner, inline resend form when `?error=unverified`
- Updated register, forgot-password, reset-password pages — added `rate_limited` error messages
- Added `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.example`

### 2026-04-30 — Items List View
- Added `getItemsByType(slug)` to `src/lib/db/items.ts` — looks up system ItemType by slug (strips trailing 's', case-insensitive), returns null for unknown slugs, fetches items with type+tags joined via existing `itemWithTypeAndTags` pattern
- Created `src/components/items/ItemCard.tsx` — card with colored left border, icon, title, description excerpt (2-line clamp), type badge, tags (up to 3), and date
- Created `src/app/items/[type]/page.tsx` — async server component; reuses `DashboardShell` for layout; parallel data fetching; 404 on unknown type; 1-column mobile / 2-column md+ grid; empty state message
- Updated `src/proxy.ts` — added `/items` to `PROTECTED_PREFIXES` and `/items/:path*` to middleware matcher

### 2026-04-30 — Delete Item
- Installed shadcn `AlertDialog` component (`src/components/ui/alert-dialog.tsx`)
- Added `deleteItem(id, userId)` to `src/lib/db/items.ts` — ownership check before delete, returns boolean
- Added `deleteItemAction` to `src/actions/items.ts` — auth + ownership check, `{ success, error }` return pattern
- Updated `src/components/items/ItemDrawer.tsx` — replaced bare Trash2 button with `AlertDialog` trigger; shows item title in confirmation; destructive-styled confirm button; calls `deleteItemAction` on confirm, shows Sonner toast on success, calls `onDelete()` and `router.refresh()`
- Updated `src/components/items/ItemDrawerProvider.tsx` — passes `onDelete={close}` to `ItemDrawer` so drawer closes on deletion
- Added 3 unit tests in `src/actions/items.test.ts` for `deleteItemAction` covering unauthorized, not-found, and success paths
