---
name: DevStash Audit Findings — Recurring Patterns
description: Recurring issues and clean areas found in the April 2026 audit
type: project
---

**Recurring issues found in first audit (2026-04-10):**

1. **Missing user isolation in all DB queries** — `getPinnedItems`, `getRecentItems`, `getRecentCollections`, `getSidebarCollections`, `getDashboardStats`, `getItemTypesWithCounts` all query without `where: { userId }`. This is the single most important thing to fix when auth is wired up.

2. **`iconMap` duplication** — The same `Record<string, LucideIcon>` constant is defined identically in three files: `Sidebar.tsx`, `CollectionCard.tsx`, `ItemRow.tsx`. Should live in `src/lib/item-types.ts` or similar.

3. **`isFavorite` sort without index** — `getSidebarCollections` orders by `[{ isFavorite: 'desc' }, { updatedAt: 'desc' }]` but there is no composite index on `(userId, isFavorite, updatedAt)` in `collections`.

4. **`mockUser` still used in production render path** — `Sidebar.tsx` imports and renders `mockUser.name` and `mockUser.email` in the user area. This hardcodes "John Doe / demo@devstash.io" for all users.

**Clean areas confirmed:**
- No raw SQL / no SQL injection risk
- No XSS vectors (no `dangerouslySetInnerHTML`)
- No secrets exposed in client components
- No `any` types in application code
- TypeScript strict mode respected throughout
- DB query parallelization with `Promise.all` used correctly
- Prisma singleton pattern correct for Next.js
- `.env` properly gitignored
