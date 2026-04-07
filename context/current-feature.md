# Current Feature

## Status

## Goals

## Notes

## History

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