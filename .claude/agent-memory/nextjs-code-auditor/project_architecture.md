---
name: DevStash Architecture Patterns
description: Established architectural patterns and decisions in DevStash — server components, data fetching, auth state
type: project
---

Server components fetch via Prisma directly (no API routes yet). Client components receive data as props from server component parents. No Server Actions exist yet. No API routes exist yet. Auth (NextAuth v5) is configured but not yet enforced — all DB queries are unauthenticated (no userId filter) and the dashboard is publicly accessible. The Sidebar uses `mockUser` for display; real session data is not wired in yet.

**Why:** Project is in early UI/data wiring phase. Auth scaffolding (schema, bcrypt in seed) exists but the NextAuth session layer has not been connected to route guards or DB query filters.

**How to apply:** When reviewing data fetch functions, note the absence of `userId` filters as a known pre-auth state, not a missed bug. When auth is implemented, ALL db queries in `src/lib/db/` will need `where: { userId: session.user.id }` guards added.
