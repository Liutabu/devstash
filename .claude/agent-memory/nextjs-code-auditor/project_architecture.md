---
name: DevStash Architecture Patterns
description: Established architectural patterns and decisions in DevStash — server components, data fetching, auth state
type: project
---

Server components fetch via Prisma directly. Client components use Server Actions for mutations (`src/actions/`). Auth is fully wired: NextAuth v5 with GitHub OAuth + email/password, email verification toggle, forgot/reset password, rate limiting via Upstash. All DB queries in `src/lib/db/` are scoped by userId. Middleware (`src/proxy.ts`) protects `/dashboard`, `/items`, `/profile`. Server Actions verify session and ownership before mutations.

**Data flow:** Server component pages fetch data and pass as props → `DashboardShell` (client, manages sidebar collapse + create dialog state) → child components. Item creation/edit/delete uses Server Actions returning `{ success, data?, error? }`. `ItemDrawerProvider` manages drawer open state client-side, fetches item detail via `GET /api/items/[id]`.

**Component conventions:** `CodeEditor` (Monaco, snippet/command), `MarkdownEditor` (react-markdown + remark-gfm, note/prompt), `ItemDrawer` (Sheet), `CreateItemDialog` (Dialog), `AlertDialog` for destructive confirms, Sonner toasts for feedback.

**Why updated 2026-05-01:** Auth, rate limiting, profile page, item CRUD with drawer all implemented since initial audit.
