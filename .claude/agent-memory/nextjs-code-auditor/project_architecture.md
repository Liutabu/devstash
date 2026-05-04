---
name: DevStash Architecture Patterns
description: Established architectural patterns and decisions in DevStash — server components, data fetching, auth state
type: project
---

Server components fetch via Prisma directly. Client components use Server Actions for mutations (`src/actions/`). Auth is fully wired: NextAuth v5 with GitHub OAuth + email/password, email verification toggle, forgot/reset password, rate limiting via Upstash. All DB queries in `src/lib/db/` are scoped by userId. Middleware (`src/proxy.ts`) protects `/dashboard`, `/items`, `/profile`. Server Actions verify session and ownership before mutations.

**Data flow:** Server component pages fetch data and pass as props → `DashboardShell` (client, manages sidebar collapse + create dialog state) → child components. Item creation/edit/delete uses Server Actions returning `{ success, data?, error? }`. `ItemDrawerProvider` manages drawer open state client-side, fetches item detail via `GET /api/items/[id]`.

**File uploads:** `POST /api/upload` validates MIME type + size server-side, keys files as `uploads/{userId}/{uuid}{ext}` in Cloudflare R2. `GET /api/download/[id]` proxies R2 streams through ownership check. R2 key stored as `fileUrl` on `Item`. On item delete, R2 key is cleaned up via `deleteFromR2`.

**Component conventions:** `CodeEditor` (Monaco, snippet/command), `MarkdownEditor` (react-markdown + remark-gfm, note/prompt), `ItemDrawer` (Sheet), `CreateItemDialog` (Dialog), `AlertDialog` for destructive confirms, Sonner toasts for feedback.

**Type views:** `/items/[type]` uses slug-based routing. Image type renders `ImageThumbnailCard` grid; file type renders `FileListRow` list; all others render `ItemCard` grid.

**Why updated 2026-05-03:** File upload, image gallery, file list view, quick-copy feature all added since last architecture note.
