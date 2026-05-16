# Current Feature: Marketing Homepage

## Status
In Progress

## Goals
- Convert `prototypes/homepage/` mockup into a proper Next.js page under `src/app/(marketing)/`
- Implement all 8 sections: Navbar, Hero, Features, AI, Pricing, CTA, Footer
- Port `ChaosArena` animation (rAF loop + mouse repulsion) from prototype JS into a React client component
- Add `DashboardMockup` as a static server component
- Implement monthly/yearly pricing toggle in `PricingSection`
- Add scroll fade-in via a `FadeIn` client wrapper using `IntersectionObserver`
- Navbar: scroll opacity, mobile hamburger menu, Sign In / Get Started links
- Auth redirect: if signed in, `redirect('/dashboard')` from the marketing page
- All routing correct: `/sign-in`, `/register`, `/dashboard`, `#features`, `#pricing`
- No `DashboardShell` — marketing layout is standalone with its own `layout.tsx`

## Notes
- Visual reference: `prototypes/homepage/` (pure HTML/CSS/JS — do not import it, port it)
- Dark background: `bg-[#0a0a0a]` matching prototype's `#0d0d0d`
- Hero h1 gradient: `bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`
- Feature card colors: #3b82f6, #f59e0b, #6366f1, #06b6d4, #64748b, #10b981
- Dashboard mockup colors: #3b82f6, #f59e0b, #06b6d4, #22c55e, #6366f1, #ec4899
- Arrow between hero boxes: CSS pulse animation, `rotate-90 md:rotate-0`
- AI section code block: static `<pre><code>` with `<span>` color classes — no syntax highlighting library
- Copyright year: server-side `new Date().getFullYear()` (no client component needed)
- Tailwind only — no custom CSS files

## History

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

### 2026-04-30 — Vitest Unit Testing Setup
- Installed `vitest` and configured `vitest.config.ts` with Node environment and native tsconfig path resolution
- Created `src/__tests__/setup.ts` — global mocks for `next/headers`, `next/navigation`, `next/cache`
- Added `src/lib/rate-limit.test.ts` — 4 smoke tests for `getIP` utility
- Added `npm run test` (watch) and `npm run test:run` (CI) scripts
- Updated `CLAUDE.md` and `context/ai-interaction.md` to document test scope and workflow step

### 2026-04-30 — Items List 3-Column Layout
- Updated grid in `src/app/items/[type]/page.tsx` from `md:grid-cols-2` to `md:grid-cols-2 lg:grid-cols-3`
- Items now show 1 column on mobile, 2 on `md` (768px+), 3 on `lg` (1024px+)

### 2026-04-30 — Items List View
- Added `getItemsByType(slug)` to `src/lib/db/items.ts` — looks up system ItemType by slug (strips trailing 's', case-insensitive), returns null for unknown slugs, fetches items with type+tags joined via existing `itemWithTypeAndTags` pattern
- Created `src/components/items/ItemCard.tsx` — card with colored left border, icon, title, description excerpt (2-line clamp), type badge, tags (up to 3), and date
- Created `src/app/items/[type]/page.tsx` — async server component; reuses `DashboardShell` for layout; parallel data fetching; 404 on unknown type; 1-column mobile / 2-column md+ grid; empty state message
- Updated `src/proxy.ts` — added `/items` to `PROTECTED_PREFIXES` and `/items/:path*` to middleware matcher

### 2026-04-30 — Item Drawer
- Installed shadcn `Sheet` component (`src/components/ui/sheet.tsx`)
- Added `getItemById(id, userId)` to `src/lib/db/items.ts` — fetches full item detail (content, url, language, collections, tags) scoped to the requesting user
- Created `GET /api/items/[id]/route.ts` — auth-checked API route that calls `getItemById`
- Created `src/components/items/ItemDrawer.tsx` — Sheet-based drawer with header (title, type badge, language badge), action bar (Favorite, Pin, Copy, Edit, Delete), scrollable body (description, content/code block, tags, collections, created/updated dates), and skeleton loading state
- Created `src/components/items/ItemDrawerProvider.tsx` — client context managing `open(itemId)`, fetches detail on click, renders the `ItemDrawer`
- Updated `ItemCard` and `ItemRow` to be `'use client'` components using `useItemDrawer()` to open the drawer on click
- Updated `DashboardShell` to wrap `<main>` with `ItemDrawerProvider` — drawer available on all pages (dashboard + items list)
- Added 6 unit tests for `getItemById` in `src/lib/db/items.test.ts` covering null-return, userId scoping, tag/collection mapping, and scalar field mapping

### 2026-04-30 — Item Drawer Edit Mode
- Installed `zod` and `sonner`; added `<Toaster richColors position="bottom-right" />` to root layout
- Added `updateItem(id, userId, data)` to `src/lib/db/items.ts` — checks ownership, disconnects all tag links, connect-or-creates new ones, returns updated `ItemDetail`
- Created `src/actions/items.ts` with `updateItemAction` — Zod-validated server action, auth + ownership check, `{ success, data, error }` return pattern
- Updated `src/components/items/ItemDrawer.tsx` — Edit button toggles inline edit mode; action bar replaced with Save/Cancel; `EditForm` component with title input, description textarea, type-specific fields (content, language, url), comma-separated tags input; non-editable fields (type, collections, dates) shown as display-only; accessibility fix: `SheetTitle` rendered `sr-only` in edit mode
- Updated `src/components/items/ItemDrawerProvider.tsx` — passes `onUpdate={setDetail}` so saved data refreshes the drawer in-place without a second fetch
- Added 8 unit tests in `src/actions/items.test.ts` covering auth, Zod validation, not-found, success path, and empty-string-to-null coercion for url and language
- Fixed pre-existing bug: all list queries (`getPinnedItems`, `getRecentItems`, `getDashboardStats`, `getItemTypesWithCounts`, `getItemsByType`, `getSidebarCollections`, `getRecentCollections`) were unscoped — added `userId` parameter to all and updated callers in `DashboardPage`, `ItemsPage`, `DashboardMain`, and `StatsCards`

### 2026-04-30 — Item Create
- Installed shadcn `Dialog` component (`src/components/ui/dialog.tsx`)
- Added `createItem(userId, data)` to `src/lib/db/items.ts` — creates item with tag connect-or-create, returns `ItemDetail`
- Added `createItemAction` to `src/actions/items.ts` — Zod-validated server action with URL-required refinement for link type, `{ success, data, error }` return pattern
- Created `src/components/items/CreateItemDialog.tsx` — Dialog with type selector (snippet, prompt, command, note, link; file/image excluded), conditional fields per type (content+language for snippet/command, content for prompt/note, URL for link), comma-separated tags, form reset on close
- Updated `src/components/dashboard/TopBar.tsx` — added `onNewItem` prop, wired to "New Item" button
- Updated `src/components/dashboard/DashboardShell.tsx` — added `createOpen` state, renders `<CreateItemDialog>` with `itemTypes` prop, passes `onNewItem` to `TopBar`
- Added 6 unit tests in `src/actions/items.test.ts` for `createItemAction` covering unauthorized, empty title, link-without-url, empty typeId, success, and url-type-with-valid-url paths

### 2026-04-30 — Delete Item
- Installed shadcn `AlertDialog` component (`src/components/ui/alert-dialog.tsx`)
- Added `deleteItem(id, userId)` to `src/lib/db/items.ts` — ownership check before delete, returns boolean
- Added `deleteItemAction` to `src/actions/items.ts` — auth + ownership check, `{ success, error }` return pattern
- Updated `src/components/items/ItemDrawer.tsx` — replaced bare Trash2 button with `AlertDialog` trigger; shows item title in confirmation; destructive-styled confirm button; calls `deleteItemAction` on confirm, shows Sonner toast on success, calls `onDelete()` and `router.refresh()`
- Updated `src/components/items/ItemDrawerProvider.tsx` — passes `onDelete={close}` to `ItemDrawer` so drawer closes on deletion
- Added 3 unit tests in `src/actions/items.test.ts` for `deleteItemAction` covering unauthorized, not-found, and success paths

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

### 2026-05-01 — Markdown Editor
- Installed `react-markdown` and `remark-gfm`
- Created `src/components/ui/MarkdownEditor.tsx` — Write/Preview tabs, copy button, auto-growing textarea (min 192px, max 400px via `scrollHeight` on input), readonly mode shows Preview tab only with "Markdown" label; dark theme (`bg-[#1e1e1e]`/`bg-[#2d2d2d]`) matches `CodeEditor`
- Added `.markdown-preview` CSS class to `src/app/globals.css` — dark-mode styles for h1-h6, code blocks, inline code, lists, blockquotes, links, tables, HR, and GFM task checkboxes
- Updated `src/components/items/CreateItemDialog.tsx` — note/prompt content field uses `<MarkdownEditor>`; snippet/command still uses `<CodeEditor>`
- Updated `src/components/items/ItemDrawer.tsx` — edit mode uses `<MarkdownEditor>` for note/prompt content; view mode uses `<MarkdownEditor readOnly>` for note/prompt, routing now explicit by type name (not implicit fallthrough)
- Fixed pre-existing issues in `ItemDrawer`: `handleCopy` was missing `toast.success`, Save/Cancel/ActionButton buttons were missing `type="button"`

### 2026-05-01 — File Upload with Cloudflare R2
- Installed `@aws-sdk/client-s3` for S3-compatible R2 access
- Created `src/lib/r2.ts` — `S3Client` configured for R2, `uploadToR2`, `deleteFromR2`, `getFromR2` helpers
- Created `POST /api/upload` — auth check, server-side MIME type and file size validation, buffers and uploads to R2; returns `{ key, fileName, fileSize, mimeType }`
- Created `GET /api/download/[id]` — ownership-checked proxy that streams files from R2; `?download=1` sets `Content-Disposition: attachment`
- Created `src/components/ui/FileUpload.tsx` — drag-and-drop zone with XHR-based upload progress bar, file/image info display after upload, clear button
- Updated `ItemDetail` interface + `getItemById`, `createItem`, `deleteItem` in `src/lib/db/items.ts` — `ItemDetail` now includes `fileUrl/fileName/fileSize`; `createItem` accepts file fields; `deleteItem` calls `deleteFromR2` on items with a `fileUrl`
- Updated `CreateItemSchema` in `src/actions/items.ts` — supports `contentType: 'file'` with `fileUrl`-required refinement
- Updated `CreateItemDialog` — file/image types now selectable (no longer excluded); shows `<FileUpload>` for those types; passes file fields to `createItemAction`
- Updated `ItemDrawer` — image preview via `/api/download/[id]` for image items; file info row + download button for file/image items
- Fixed pre-existing test infrastructure: added explicit `@` alias to `vitest.config.ts` (mocks were silently broken in Vitest 4 on Windows); fixed Upstash class mocks in `rate-limit.test.ts` to use `mockImplementation` (Vitest 4 requirement)
- Added 8 new unit tests: `createItemAction` file-without-fileUrl validation, file-with-fileUrl success; `deleteItem` R2 cleanup when fileUrl present, no-op when null, false when not found

### 2026-05-03 — Image Gallery View
- Created `src/components/items/ImageThumbnailCard.tsx` — `aspect-video` thumbnail card with `object-cover`, hover zoom (scale 105%, 300ms), title + pin/favorite footer; image served via `/api/download/[id]` (ownership-checked R2 proxy)
- Updated `src/app/items/[type]/page.tsx` — branches on `type === 'images'` to render `ImageThumbnailCard` grid instead of `ItemCard`; all other types unchanged

### 2026-05-03 — File List View
- Extended `ItemRowData` in `src/lib/db/items.ts` with `fileName` and `fileSize` fields; updated `mapItem` to populate them
- Created `src/components/items/FileListRow.tsx` — single-column list row with file-type icon (by extension), title, original filename, file size, upload date, pin/favorite indicators, and a hover-reveal download button that stops propagation to prevent drawer opening
- Updated `src/app/items/[type]/page.tsx` — added `type === 'files'` branch rendering `<FileListRow>` in a `flex-col` list; responsive (size/date stack vertically on mobile via `sm:` breakpoint)

### 2026-05-03 — Quick Copy Button on Item Cards
- Extended `ItemRowData` in `src/lib/db/items.ts` with `content`, `url`, and `contentType` fields; updated `mapItem` to populate them
- Added hover-reveal copy button to `ItemCard` (`src/components/items/ItemCard.tsx`) and `ItemRow` (`src/components/dashboard/ItemRow.tsx`)
- Button copies `content` for text types, `url` for link type; hidden for file/image types (nothing useful to copy)
- Uses `Copy` → `Check` icon swap (2s) + Sonner toast on success; `stopPropagation` prevents opening the drawer

### 2026-05-03 — Code Audit Quick Wins
- Added `fileUrl` prefix validation in `createItemAction` (`src/actions/items.ts`) — rejects any `fileUrl` that doesn't start with `uploads/{userId}/` to prevent linking another user's R2 objects
- Added `itemTypeId` ownership check in `createItemAction` — Prisma pre-flight verifies the type is a system type or owned by the current user before creating the item
- Added `take: 50` cap to `getPinnedItems` in `src/lib/db/items.ts` — was the only unbounded list query on the dashboard
- Extracted `formatBytes` to `src/lib/format.ts` — was duplicated verbatim in `FileUpload`, `ItemDrawer`, and `FileListRow`
- Fixed `Content-Disposition` header in `GET /api/download/[id]` to use RFC 5987 `filename*=UTF-8''...` encoding for correct non-ASCII filename handling
- Added `loading="lazy"` to `ImageThumbnailCard` img tag to defer off-screen image loads
- Added `disabled` prop to `ActionButton` in `ItemDrawer`; Favorite and Pin buttons now render as visually dimmed with `title="Coming soon"` while unimplemented

### 2026-05-04 — Code Decomposition Refactor
- Extracted `createVerificationToken(identifier, ttlMs)` to `src/lib/auth-tokens.ts` — token creation block was repeated verbatim in `registerAction`, `forgotPasswordAction`, `resendVerificationAction`, and the register API route
- Extracted `mapItemDetail` helper in `src/lib/db/items.ts` — 20-line Prisma→`ItemDetail` mapping duplicated in `createItem` and `updateItem`
- Added `ItemsByTypeResult` named interface to `src/lib/db/items.ts` — `getItemsByType` was the only query function without a named return type
- Extracted `computeTypeStats(items)` helper in `src/lib/db/collections.ts` — dominant-color computation duplicated in `getSidebarCollections` and `getRecentCollections`; added `icon` to sidebar query select so both share the helper
- Extracted `CollectionChips` sub-component in `ItemDrawer.tsx` — collection chip JSX was duplicated in `EditForm` and `ViewBody`
- Consolidated 6 separate `useState` calls in `DrawerBody` into a single `editState` object with a `patchEdit` helper; updated `EditFormProps` to accept `editState`/`onEditStateChange` instead of individual value/setter pairs
- Created `src/components/ui/banners.tsx` with `SuccessBanner` and `ErrorBanner` — replaced 4 repeated green-banner divs in `sign-in/page.tsx` and error/success banners in `profile/page.tsx`
- Extracted `ChangePasswordSection` to `src/components/profile/ChangePasswordSection.tsx` — removed 50-line inline form from `profile/page.tsx`

### 2026-05-04 — Collection Create
- Added `createCollection(userId, data)` to `src/lib/db/collections.ts` — returns `CollectionDetail` with id, name, description, isFavorite, and timestamps
- Created `src/actions/collections.ts` with `createCollectionAction` — Zod-validated, `{ success, data, error }` return pattern; coerces empty/null description to null
- Created `src/components/collections/CreateCollectionDialog.tsx` — Dialog with name (required) and description (optional) fields; toast on success/failure; `router.refresh()` updates sidebar + dashboard grid on success
- Updated `TopBar` — added `onNewCollection` prop, wired "New Collection" button (was display-only)
- Updated `DashboardShell` — added `collectionCreateOpen` state, renders `<CreateCollectionDialog>`, passes `onNewCollection` to `TopBar`
- Added 5 unit tests in `src/actions/collections.test.ts` covering unauthorized, empty name, success, empty-string-to-null coercion, and DB error paths
- Fixed Zod v4 schema bug: `z.preprocess` skips absent keys in Zod v4 objects — description must use `.optional()` at the outer level

### 2026-05-04 — Add Item to Collections
- Added `getUserCollections(userId)` to `src/lib/db/collections.ts` — returns `{ id, name }[]` sorted alphabetically for the picker UI
- Updated `createItem` in `src/lib/db/items.ts` — accepts `collectionIds?: string[]`; validates ownership against `userId` before writing `ItemCollection` rows
- Updated `updateItem` in `src/lib/db/items.ts` — same ownership validation; syncs memberships via `deleteMany: {}` + `create:` array (same pattern as tags)
- Added `collectionIds: z.array(z.string()).optional().default([])` to both `CreateItemSchema` and `UpdateItemSchema` in `src/actions/items.ts`; forwarded to DB calls
- Created `src/components/ui/CollectionPicker.tsx` — toggle-chip UI; selected chips highlighted with `bg-primary/20` border, unselected in `bg-muted`; no external library
- Updated `CreateItemDialog` — added `userCollections` prop, `selectedCollectionIds` state (reset on close), `CollectionPicker` below Tags field
- Updated `ItemDrawer` / `ItemDrawerProvider` / `DashboardShell` — threaded `userCollections` prop down; edit mode initializes `collectionIds` from current detail and shows `CollectionPicker`; view mode retains static `CollectionChips`
- Updated `dashboard/page.tsx` and `items/[type]/page.tsx` — added `getUserCollections(userId)` to parallel data fetches, passed to `DashboardShell`
- Added 4 unit tests to `src/actions/items.test.ts` covering `collectionIds` defaulting to `[]` and being forwarded correctly in both create and update actions

### 2026-05-05 — Collections Pages
- Added `getAllCollections(userId)` to `src/lib/db/collections.ts` — returns all user collections as `CollectionCardData[]`, sorted favorites-first then alphabetically
- Added `getCollectionById(id, userId)` to `src/lib/db/collections.ts` — returns collection metadata with computed `dominantColor`/`icons`; returns null for wrong userId (ownership scoping)
- Added `getItemsByCollectionId(collectionId, userId)` to `src/lib/db/items.ts` — queries items scoped to user+collection via `collections: { some: { collectionId } }`
- Created `src/app/collections/page.tsx` — lists all user collections in a `CollectionCard` grid; reuses `DashboardShell` layout
- Created `src/app/collections/[id]/page.tsx` — shows collection header (name, description, favorite star, item count) and items grouped by content type: images in thumbnail grid, files in list, everything else in card grid; section headers shown only when multiple groups present; 404 on unknown/other-user collection
- Updated `src/components/dashboard/CollectionCard.tsx` — wrapped in `<Link href="/collections/[id]">`; changed inert `<button>` wrapping MoreHorizontal to `<div>` to keep valid HTML
- Updated `src/proxy.ts` — added `/collections` and `/collections/:path*` to both `PROTECTED_PREFIXES` and middleware matcher
- Added 11 unit tests: `getCollectionById` (null on missing, ownership scoping, dominantColor, icons order, gray default, scalar fields), `getAllCollections` (userId scoping, mapping), `getItemsByCollectionId` (where clause, mapping, empty result)

### 2026-05-06 — Collection Management Actions
- Installed shadcn `DropdownMenu` component (`src/components/ui/dropdown-menu.tsx`)
- Added `updateCollection(id, userId, data)` and `deleteCollection(id, userId)` to `src/lib/db/collections.ts` — both ownership-scoped; delete relies on cascade to remove `ItemCollection` rows (items preserved)
- Added `updateCollectionAction` and `deleteCollectionAction` to `src/actions/collections.ts` — Zod-validated, `{ success, data/error }` return pattern; empty description coerced to null
- Created `src/components/collections/EditCollectionDialog.tsx` — pre-filled Dialog modal for editing collection name and description; calls `updateCollectionAction`, toasts on success/error, `router.refresh()` to sync server data
- Created `src/components/collections/CollectionDetailActions.tsx` — client component rendering Edit (pencil), Delete (trash), and Favorite (star, disabled placeholder) icon buttons in the collection detail page header; delete redirects to `/collections` after success
- Updated `src/app/collections/[id]/page.tsx` — removed static Star icon from header, added `<CollectionDetailActions>` alongside collection name
- Updated `src/components/dashboard/CollectionCard.tsx` — converted from `<Link>` wrapper to `'use client'` component with `onClick={router.push(...)}` on the card body; DropdownMenu on hover-reveal 3-dots with Edit, Delete, Favorite (disabled) items; Edit and Delete self-contained with inline dialog/alert state; `e.stopPropagation()` prevents card navigation when menu is opened
- Added 8 unit tests to `src/actions/collections.test.ts`: `updateCollectionAction` (unauthorized, empty name, not found, success, empty description → null) and `deleteCollectionAction` (unauthorized, not found, success)

### 2026-05-07 — Global Search / Command Palette
- Installed shadcn `Command` component (`src/components/ui/command.tsx`) — wraps `cmdk` library
- Created `src/lib/db/search.ts` with `getSearchData(userId)` — fetches items (id, title, description, itemType) and collections (id, name, itemCount) in parallel via Prisma
- Created `src/components/search/CommandPalette.tsx` — `CommandDialog` + explicit `<Command>` wrapper (required for cmdk store context); custom substring filter replacing cmdk's default subsequence filter; Items group with type icon + name badge; Collections group with item count; item selection opens `ItemDrawer`, collection selection navigates to `/collections/[id]`; Cmd/Ctrl+K closes palette
- Updated `DashboardShell` — added `searchData` prop, `searchOpen` state, Cmd/Ctrl+K listener, `onSearchClick` forwarded to `TopBar`, `<CommandPalette>` rendered inside `ItemDrawerProvider` so it can call `useItemDrawer()`
- Updated `TopBar` — replaced `<Input>` with a styled `<button>` element showing ⌘K shortcut hint; added `onSearchClick` prop
- Added `getSearchData` to parallel data fetches in `dashboard/page.tsx`, `items/[type]/page.tsx`, `collections/page.tsx`, `collections/[id]/page.tsx`
- Added 5 unit tests in `src/lib/db/search.test.ts`: userId scoping for items, userId scoping for collections, `_count.items → itemCount` mapping, full shape, empty arrays

### 2026-05-07 — Pagination
- Created `src/lib/constants.ts` with `ITEMS_PER_PAGE = 21`, `COLLECTIONS_PER_PAGE = 21`, `DASHBOARD_COLLECTIONS_LIMIT = 6`, `DASHBOARD_RECENT_ITEMS_LIMIT = 10`
- Created `src/components/ui/Pagination.tsx` — server component with numbered page links, prev/next arrows (greyed out at boundaries), and ellipsis for large page counts
- Updated `getItemsByType` in `src/lib/db/items.ts` — accepts `page` param, uses `skip`/`take` with `ITEMS_PER_PAGE`, returns `total` alongside items; runs `findMany` + `count` in parallel
- `getItemsByCollectionId` already supported pagination; updated callers to pass `page` from URL
- Updated `src/app/items/[type]/page.tsx` — reads `?page=` from `searchParams`, passes to `getItemsByType`, shows total item count, renders `<Pagination>` below each grid/list
- Updated `src/app/collections/[id]/page.tsx` — same pattern with `COLLECTIONS_PER_PAGE`; item count in header shows total across all pages
- Updated tests: added `count` mock to Prisma item mock, updated `getItemsByType` tests to assert `total`, updated `getItemsByCollectionId` tests for new `{ items, total }` return shape

### 2026-05-07 — Settings Page
- Created `src/app/settings/page.tsx` — protected page using `DashboardShell`; hosts Change Password (email users only) and Danger Zone (delete account) sections; reads `?error=` / `?success=` params for form feedback
- Updated `src/actions/profile.ts` — all `changePasswordAction` redirects changed from `/profile?…` to `/settings?…` so feedback banners work correctly on the settings page
- Updated `src/components/dashboard/Sidebar.tsx` — added "Settings" link (with `Settings` icon) to the user dropdown between Profile and Sign out
- Updated `src/proxy.ts` — added `/settings` to `PROTECTED_PREFIXES` and `/settings`/`/settings/:path*` to the middleware matcher
- Updated `src/app/profile/page.tsx` — removed Change Password and Danger Zone sections; converted to use `DashboardShell` (was standalone layout, so sidebar was missing); added a link to `/settings` for account actions

### 2026-05-07 — Editor Preferences Settings
- Added `editorPreferences Json?` to `User` model; ran migration `20260507200555_add_editor_preferences`
- Created `src/lib/editor-preferences.ts` — `EditorPreferences` type, defaults, and option constants (font sizes 12–16, tab sizes 2/4, themes vs-dark/monokai/github-dark)
- Created `src/lib/monaco-themes.ts` — inline `monokai` and `github-dark` theme definitions for `monaco.editor.defineTheme`
- Added `getEditorPreferences(userId)` to `src/lib/db/profile.ts` — reads JSON column, merges with defaults
- Added `updateEditorPreferencesAction` to `src/actions/profile.ts` — Zod-validated, `{ success, error }` return pattern
- Created `src/components/ui/EditorPreferencesContext.tsx` — `EditorPreferencesProvider` + `useEditorPreferences` hook
- Created `src/components/settings/EditorPreferencesSection.tsx` — client component with Theme/Font Size/Tab Size selects and Word Wrap/Minimap toggles; auto-saves on every change via `useTransition` + server action; shows success toast
- Updated `src/components/ui/CodeEditor.tsx` — reads `fontSize`, `tabSize`, `wordWrap`, `minimap`, `theme` from context; defines custom themes in `beforeMount`
- Updated `DashboardShell` — accepts `editorPreferences?` prop, wraps tree in `EditorPreferencesProvider`
- Updated all 6 `DashboardShell` pages (dashboard, items/[type], collections, collections/[id], profile, settings) — added `getEditorPreferences(userId)` to parallel fetches and passed to shell
- Added `EditorPreferencesSection` to `/settings` page above Change Password
- Added 6 unit tests in `src/actions/profile.test.ts` covering unauthorized, invalid fontSize, invalid theme, success, monokai, and github-dark paths

### 2026-05-08 — Favorites Page
- Added `getFavoriteItems(userId)` to `src/lib/db/items.ts` — fetches items where `isFavorite: true`, ordered by `updatedAt desc`
- Added `FavoriteCollectionData` interface + `getFavoriteCollections(userId)` to `src/lib/db/collections.ts` — fetches favorite collections with dominant color computation, ordered by `updatedAt desc`
- Updated `src/proxy.ts` — added `/favorites` to `PROTECTED_PREFIXES` and middleware matcher
- Updated `src/components/dashboard/TopBar.tsx` — added `Star` icon link to `/favorites` in the actions bar
- Created `src/components/favorites/FavoriteItemRow.tsx` — `'use client'` component using `drawer?.open(itemId)`; shows colored type icon, title, type badge, and date in monospace compact style
- Created `src/app/favorites/page.tsx` — async server component with two sections (Items + Collections with counts), empty state with star icon, monospace/high-density list rows; collection rows are plain `<Link>` with colored dot, name, item count badge, and date

### 2026-05-13 — Favorite Toggle
- Added `toggleItemFavorite(id, userId)` to `src/lib/db/items.ts` — ownership-checked, flips `isFavorite` and returns new value
- Added `toggleCollectionFavorite(id, userId)` to `src/lib/db/collections.ts` — same pattern for collections
- Added `toggleItemFavoriteAction` to `src/actions/items.ts` — auth-gated, `{ success, data: { isFavorite } }` return pattern
- Added `toggleCollectionFavoriteAction` to `src/actions/collections.ts` — same pattern
- Updated `src/components/items/ItemDrawer.tsx` — Favorite button now live; calls action, updates drawer via `onUpdate`, refreshes router
- Updated `src/components/dashboard/CollectionCard.tsx` — Favorite dropdown item now live; uses `localIsFavorite` state for immediate star update
- Updated `src/components/collections/CollectionDetailActions.tsx` — Favorite button now live; filled yellow when active, disabled while in-flight
- Added 6 unit tests: `toggleItemFavoriteAction` (unauthorized, not found, success) and `toggleCollectionFavoriteAction` (unauthorized, not found, success)

### 2026-05-15 — Pinned Items
- Added `toggleItemPin(id, userId)` to `src/lib/db/items.ts` — ownership-checked, flips `isPinned` and returns new value
- Added `toggleItemPinAction` to `src/actions/items.ts` — auth-gated, `{ success, data: { isPinned } }` return pattern
- Updated `src/components/items/ItemDrawer.tsx` — Pin button now live; calls action, updates drawer via `onUpdate`, refreshes router; `pinning` state disables button during in-flight request
- Updated `getItemsByType` in `src/lib/db/items.ts` — now orders by `[isPinned desc, createdAt desc]` so pinned items float to the top of listings
- Added 3 unit tests for `toggleItemPinAction` (unauthorized, not found, success)

### 2026-05-13 — Client-Side Sorting on Favorites Page
- Created `src/components/favorites/FavoriteItemsList.tsx` — client component wrapping item rows with sort controls (Date / Name / Type); clicking the active sort toggles direction (↑/↓); Date defaults desc, Name/Type default asc
- Created `src/components/favorites/FavoriteCollectionsList.tsx` — same pattern for collections with sort controls (Date / Name / Items); Date and Items default desc, Name defaults asc
- Updated `src/app/favorites/page.tsx` — replaced inline item and collection rendering with `<FavoriteItemsList>` and `<FavoriteCollectionsList>`; no DB changes needed (`FavoriteCollectionData` already included `itemCount`)

### 2026-05-15 — Homepage Mockup Prototype
- Created `prototypes/homepage/` — standalone marketing homepage (pure HTML/CSS/JS, no build step)
- `index.html` — 7 sections: fixed nav, hero (chaos/arrow/dashboard visual), 6-card features grid, AI section, pricing, CTA, footer with dynamic year
- `styles.css` — dark theme with CSS custom properties, all section styles, `fade-in` scroll animation class, responsive breakpoints (768px mobile, 560px small); arrow rotates 90° on mobile
- `script.js` — `requestAnimationFrame` chaos animation (wall bounce + mouse repulsion + minimum speed nudge + tab-pause optimization), `IntersectionObserver` scroll fade-ins, navbar opacity on scroll, monthly/yearly pricing toggle
- Hero chaos icons: Notion, GitHub, Slack, VS Code, Browser, Terminal, Text file, Bookmark — each 44px rounded square with inline SVG
- Dashboard mockup: mini sidebar with 6 colored type dots + 2×3 grid of colored-border item cards
- AI section: code editor mockup with syntax-highlighted TypeScript snippet + AI-generated tag chips
- Pricing: Free ($0) vs Pro ($8/mo or $6/mo billed $72/yr) with "Most Popular" badge and toggle
