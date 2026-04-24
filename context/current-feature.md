# Current Feature: Email Verification on Register

## Status
In Progress

## Goals

- After a user registers, send a verification email via Resend containing a unique, time-limited link
- New accounts are marked unverified until the user clicks the link
- Clicking the link marks the account as verified and redirects to the dashboard (or sign-in)
- Unverified users see an appropriate message if they try to sign in before verifying
- Resend integration uses `onboarding@resend.dev` as the from address and the `RESEND_API_KEY` env variable

## Notes

- Email service: Resend (`RESEND_API_KEY` already in `.env`)
- From address: `onboarding@resend.dev`
- Verification tokens need to be stored (use `VerificationToken` model already in schema)
- Token should expire (e.g. 24 hours)
- Flow: register → send email → user clicks link → verify token → mark verified → redirect
- Need to add `emailVerified` handling — field already exists on the `User` model

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
