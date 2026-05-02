---
name: DevStash Audit Findings — Recurring Patterns
description: Recurring issues and clean areas found in the April 2026 audit
type: project
---

**Status as of 2026-05-01:** All four issues from the April 2026 audit have been resolved in subsequent features. userId isolation was added to all DB queries, iconMap was extracted to `src/lib/item-type-icons.ts`, mockUser was replaced with real session data, and the composite index concern remains noted but no new index was added.

**Markdown Editor feature audit (2026-05-01):**

1. **`ViewBody` content routing is implicit** — `ItemDrawer.tsx:485` routes to `MarkdownEditor` for note/prompt via `detail.url` being null rather than explicitly checking `typeName`. Works correctly now because link types always have a URL, but if a custom type ever has both content and url set, the branch would render the URL path and skip the markdown content. Low-severity design fragility.

2. **`MarkdownEditor` textarea has no fluid auto-grow** — The textarea uses a fixed `minHeight` via CSS rows (8 * 1.5rem = 12rem). It scrolls within that fixed height rather than growing like `CodeEditor` does via `onDidContentSizeChange`. The spec says "fluid height with max 400px matching CodeEditor behavior" — the textarea does not match this; it only enforces max height on the preview div. The write tab textarea is static height.

**Clean areas confirmed (May 2026 full feature set):**
- No raw SQL / no SQL injection risk
- No XSS vectors — `react-markdown` renders safely by default (no `dangerouslySetInnerHTML`)
- No secrets exposed in client components
- No `any` types in application code
- TypeScript strict mode respected throughout
- All DB queries properly scoped with userId
- Auth enforced via middleware on all protected routes
- React Compiler pattern respected (no useMemo/useCallback)
