---
name: DevStash Audit Findings — Recurring Patterns
description: Recurring issues and clean areas found across all DevStash code audits
type: project
---

**Status as of 2026-05-03 (Full file-upload, image gallery, file list, quick-copy audit):**

## Issues found in May 2026 audit

### High — `fileUrl` not validated as owned R2 path on create (items.ts:279)
`createItem()` writes `data.fileUrl` directly to the DB without verifying the key belongs to the authenticated user's upload prefix (`uploads/{userId}/...`). A client could submit an arbitrary `fileUrl` string and link any R2 key to their item. The upload route scopes keys by userId but the create action doesn't verify that scope. Fix: validate `fileUrl` starts with `uploads/${userId}/` before insert.

### Medium — `createItem` does not verify `itemTypeId` ownership/existence (items.ts:279)
The `createItemAction` accepts any `itemTypeId` string and passes it directly to `prisma.item.create`. There is no check that the type belongs to the user or is a system type. A valid Prisma FK error would be the only guard. Fix: add a lookup `prisma.itemType.findFirst({ where: { id, OR: [{ isSystem: true }, { userId }] } })`.

### Medium — `getPinnedItems` is unbounded (items.ts:78)
`getPinnedItems(userId)` has no `take` limit. A user who pins hundreds of items will cause the dashboard query to return all of them. Fix: add `take: 50` (or configurable constant).

### Medium — `formatBytes` duplicated in 3 files
Identical `formatBytes` function exists in `src/components/ui/FileUpload.tsx:24`, `src/components/items/FileListRow.tsx:45`, and `src/components/items/ItemDrawer.tsx:468`. Should be extracted to `src/lib/format.ts`.

### Medium — Copy-paste block: `ItemCard` and `ItemRow` are near-identical
`ItemCard` (`src/components/items/ItemCard.tsx`) and `ItemRow` (`src/components/dashboard/ItemRow.tsx`) share identical `Item` interface, `copyValue`/`canCopy` logic, `handleCopy` function, and `useItemDrawer()` open call. Only the JSX layout differs. A shared hook or utility could de-duplicate the logic.

### Low — `ActionButton` in ItemDrawer has `onClick: undefined` for Favorite and Pin
`src/components/items/ItemDrawer.tsx:254-265`: Favorite and Pin `ActionButton` components pass `onClick={undefined}`, making them visually present but functionally inert. Not a bug but a misleading UI state — users can click them with no effect.

### Low — `Content-Disposition` filename uses `encodeURIComponent` but not RFC 5987 encoding
`src/app/api/download/[id]/route.ts:25`: `attachment; filename="${encodeURIComponent(...)}"` breaks on non-ASCII filenames in some browsers. RFC 5987 format (`filename*=UTF-8''...`) is more correct. Low risk since filenames come from original upload only.

## Previously resolved issues (all fixed)
- userId isolation in DB queries — fixed April 2026
- ITEM_TYPE_ICON_MAP duplication — extracted to `src/lib/item-type-icons.ts`
- mockUser in sidebar — replaced with real session data
- Composite index on (userId, createdAt DESC) on Item — added to schema

## Persistent clean areas (confirmed across all audits)
- No raw SQL / no SQL injection risk
- No XSS — react-markdown safe, no dangerouslySetInnerHTML
- No secrets in client components
- No `any` types in application code
- TypeScript strict mode respected throughout
- All DB queries (except getPinnedItems unbounded limit) properly scoped with userId
- Auth enforced via middleware + per-action session checks
- Rate limiting on all auth endpoints (login, register, forgot-password, reset-password, resend-verification)
- React Compiler pattern respected (no useMemo/useCallback)
- No N+1 patterns — all relations eagerly loaded via Prisma include
