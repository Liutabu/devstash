# Current Feature

## Status
Complete

## Goals
Replace dummy collection data on the dashboard with real data from the Neon database via Prisma.

- Create `src/lib/db/collections.ts` with data fetching functions
- Fetch collections directly in a server component
- Collection card border color derived from most-used content type in that collection
- Show small icons of all types present in that collection
- Keep the current design (no layout changes)
- Update collection stats display

## Notes
- Do not add items underneath collections yet — that is a separate feature
- Reference `context/screenshots/dashboard-ui-main.png` for design reference
- Fetch data in server component, not client component

## History

### 2026-04-09 — Dashboard collections from database
- Created `src/lib/db/collections.ts` with `getRecentCollections()` — fetches 6 most recent collections via Prisma, joins through `ItemCollection → Item → ItemType` to compute dominant color and icon list per collection
- Converted `DashboardMain` to an async server component, replaced `mockCollections` with real DB fetch
- Fixed `src/lib/prisma.ts` to explicitly set `sslmode=verify-full` on the connection string, eliminating a pg SSL warning in the dev overlay

### 2026-04-09 — Seed demo data
- Created `prisma/seed.ts` to populate database with sample data for development and demos
- Creates demo user (`demo@devstash.io`) with bcryptjs-hashed password (12 rounds)
- Seeds all 7 system item types
- Creates 5 collections with realistic items (snippets, prompts, commands, links)
- Wires up tags and collection memberships
- Seed is idempotent (safe to re-run)
- Uses `PrismaPg` adapter directly (same pattern as `src/lib/prisma.ts`)
- Run with: `npx prisma db seed`

### 2026-04-09 — Prisma + Neon PostgreSQL setup
- Installed Prisma 7, `@prisma/adapter-pg`, `pg`, `dotenv`
- Created `prisma/schema.prisma` with all models (`User`, `ItemType`, `Item`, `Collection`, `ItemCollection`, `Tag`, `TagsOnItems`) plus NextAuth models, with indexes and cascade deletes
- Created `prisma.config.ts` at project root — datasource URL lives here in Prisma 7, not in the schema
- Created `src/lib/prisma.ts` singleton using `PrismaPg` driver adapter (required by Prisma 7)
- Generated client to `src/generated/prisma/` (gitignored)
- Ran initial migration `20260409143823_init` against Neon dev branch
- Created `scripts/test-db.ts` to verify connection and table row counts
- Import path for generated client: `@/generated/prisma/client`

### 2026-04-07 — Dashboard UI Phase 3
- Created `StatsCards` component with 4 stat cards: total items, collections, favorite items, favorite collections
- Created `CollectionCard` component with colored top border, icon chips, item count, and star indicator
- Created `ItemRow` component with colored left border, type badge, tags, and pin/favorite indicators
- Created `DashboardMain` assembling all sections: heading, stats, collections grid, pinned items, 10 recent items
- Updated dashboard page to render `DashboardMain` inside `DashboardShell`

### 2026-04-07 — Dashboard UI Phase 2
- Created `Sidebar` component with Types nav (colored icons + counts), Favorites and All Collections sections, user avatar area at the bottom
- Created `DashboardShell` client wrapper managing collapse state (desktop) and open/close state (mobile drawer)
- Updated `TopBar` with `PanelLeft` desktop toggle and `Menu` mobile hamburger button
- Desktop sidebar collapses to 52px icon-only strip, expands to 240px with smooth CSS transition
- Mobile sidebar is a fixed slide-in drawer with a backdrop overlay
- Type links route to `/items/[slug]`, collection links route to `/collections/[id]`

### 2026-04-05 — Dashboard UI Phase 1
- Initialized shadcn/ui (v4.1.2) with Tailwind CSS v4 support
- Installed `Button` and `Input` shadcn components
- Created `/dashboard` route with full-height layout
- Built `TopBar` component with search input and "New Collection" / "+ New Item" buttons (display only)
- Added sidebar and main area placeholders
- Set dark mode by default via `dark` class on `<html>`
- Fixed Geist font not loading — shadcn init generated a self-referencing `--font-sans` CSS variable
- Added `suppressHydrationWarning` to `<html>` and `<body>` to suppress browser extension attribute injection

### 2026-04-04 — Initial Next.js Setup
- Bootstrapped Next.js 16 with App Router, React 19, TypeScript, and Tailwind CSS v4
- Configured Geist fonts and global styles in `src/app/globals.css`
- Added remote origin and pushed initial codebase to `git@github.com:Liutabu/devstash.git`