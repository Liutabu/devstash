# Item CRUD Architecture

A unified CRUD system for all 7 item types, consistent with the patterns already established in the codebase.

---

## Design Principles

- **One action file** — all item mutations in `src/actions/items.ts`; type-specific branching stays out of actions
- **lib/db for queries** — server components call `src/lib/db/items.ts` directly; no API routes needed for reads
- **One dynamic route** — `/items/[type]` for every type; drawer opens within the same page
- **Type-specific logic in components** — `ItemForm` and `ItemDetail` branch on `contentType`; actions are type-agnostic

---

## File Structure

```
src/
├── actions/
│   └── items.ts                   # createItem, updateItem, deleteItem, toggleFavorite, togglePin
│
├── lib/db/
│   └── items.ts                   # existing queries + getItemsByType, getItemById
│
├── app/
│   └── items/
│       └── [type]/
│           ├── page.tsx           # async server component; fetches type + items; renders ItemsView
│           └── error.tsx          # error boundary for DB failures
│
└── components/
    └── items/
        ├── ItemsView.tsx          # 'use client'; manages drawer state; wires up row-click / New button
        ├── ItemList.tsx           # renders list of ItemRow + empty state
        ├── ItemDrawer.tsx         # right-side drawer; switches create / edit / view modes
        ├── ItemForm.tsx           # unified form; delegates to field components by contentType
        ├── ItemDetail.tsx         # read-only display; switches on contentType for rendering
        └── fields/
            ├── TextFields.tsx     # content textarea + optional language selector
            ├── FileFields.tsx     # file drop zone; uploads to /api/upload; returns R2 URL
            └── LinkFields.tsx     # URL input
```

---

## `/items/[type]` Routing

`[type]` is the item type slug: `snippet`, `prompt`, `command`, `note`, `file`, `image`, `link`.

```
/items/snippet    → Snippets list
/items/prompt     → Prompts list
/items/command    → Commands list
/items/note       → Notes list
/items/file       → Files list  (Pro)
/items/image      → Images list (Pro)
/items/link       → Links list
```

**`app/items/[type]/page.tsx`** (server component):
1. Reads `params.type`
2. Calls `getItemsByType(slug, userId)` — resolves type metadata and items in one query
3. If slug not found → `notFound()`
4. Passes `{ itemType, items }` to `<ItemsView>` (client component)

No separate detail route is needed. The project spec says items open in a right-side drawer. The drawer is triggered by clicking a row or the "+ New" button, managed entirely in `ItemsView`. Deep-linkable state uses the `?item=<id>` search param (optional).

---

## Queries — `src/lib/db/items.ts`

Add these alongside the existing functions:

```ts
// Full item data for the drawer/detail view
export interface ItemDetail extends ItemRowData {
  content: string | null;
  language: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  contentType: 'text' | 'file' | 'url';
}

// Fetch all items for a type page (scoped to userId)
export async function getItemsByType(
  slug: string,
  userId: string
): Promise<{ itemType: ItemTypeWithCount; items: ItemRowData[] } | null>

// Fetch a single item with full content (scoped to userId)
export async function getItemById(
  id: string,
  userId: string
): Promise<ItemDetail | null>
```

Both functions scope queries with `userId` — never trust a client-supplied owner.

---

## Actions — `src/actions/items.ts`

All actions are `'use server'` functions. All call `auth()` first and redirect to `/sign-in` if unauthenticated. All scope DB writes with `userId` from the session.

### Signatures

```ts
// Returns structured result (client components cannot use redirect())
export async function createItemAction(
  formData: FormData
): Promise<{ success: boolean; data?: { id: string }; error?: string }>

export async function updateItemAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }>

export async function deleteItemAction(
  id: string
): Promise<{ success: boolean; error?: string }>

export async function toggleFavoriteAction(
  id: string,
  isFavorite: boolean
): Promise<{ success: boolean; error?: string }>

export async function togglePinAction(
  id: string,
  isPinned: boolean
): Promise<{ success: boolean; error?: string }>
```

### FormData fields (create / update)

| Field | Required | Notes |
|---|---|---|
| `id` | update only | item id |
| `itemTypeId` | create only | FK to ItemType |
| `contentType` | yes | `text` / `file` / `url` |
| `title` | yes | |
| `description` | no | |
| `content` | if text | null for file/url |
| `language` | no | e.g. `typescript` |
| `url` | if url | null for text/file |
| `fileUrl` | if file | R2 URL, from upload step |
| `fileName` | if file | original filename |
| `fileSize` | if file | bytes |
| `tags` | no | comma-separated tag names |

### Validation

Validate with Zod before any DB write. Key cross-field rules:
- `contentType === 'text'` → `content` required
- `contentType === 'url'` → `url` required, must be a valid URL
- `contentType === 'file'` → `fileUrl`, `fileName`, `fileSize` required

### Why actions return `{ success, data?, error }` instead of redirecting

Server actions called from client components (like `ItemForm`) cannot use `redirect()` directly — the client needs the result to show a toast, close the drawer, or update the list. The calling client component handles navigation/revalidation.

Use `revalidatePath('/items/[type]')` (and `/dashboard`) at the end of successful mutations so the server-rendered lists stay fresh.

---

## Component Responsibilities

### `ItemsView` (client)

- Holds drawer open state (`open: boolean`, `mode: 'create' | 'edit' | 'view'`, `activeItemId: string | null`)
- Provides `onRowClick(id)` → opens drawer in view/edit mode
- Provides `onNew()` → opens drawer in create mode
- Passes state and handlers down to `ItemList` and `ItemDrawer`
- Receives `items` and `itemType` as props from the server page

### `ItemList`

- Renders a list of `<ItemRow>` components
- Shows a type-aware empty state when `items.length === 0`
- Each row gets `onClick` from parent

### `ItemDrawer`

- Wraps shadcn `Sheet` (right-side drawer)
- **view mode**: renders `ItemDetail` + Edit and Delete buttons
- **edit mode**: renders `ItemForm` pre-filled with item data
- **create mode**: renders empty `ItemForm`
- Fetches full item data on demand when switching to edit/view mode (via a server action or a client-side fetch to `getItemById`)

### `ItemForm`

- Controlled form using React state
- Renders shared fields (title, description, tags) for all types
- Renders one of `<TextFields>`, `<FileFields>`, or `<LinkFields>` based on `contentType`
- Calls `createItemAction` or `updateItemAction` on submit
- Shows toast on success/error, closes drawer on success

### `TextFields`

- `content` — `<textarea>` or markdown editor
- `language` — `<select>` with common language options (typescript, javascript, python, bash, dockerfile, etc.)
- Used by: snippet, prompt, command, note

### `FileFields`

- File drop zone input
- On file select: POST to `/api/upload`, receive `{ fileUrl, fileName, fileSize }`
- Stores returned values in hidden form inputs
- Used by: file, image

### `LinkFields`

- Single URL `<input type="url">`
- Inline URL validation feedback
- Used by: link

### `ItemDetail`

- Read-only display, switches on `contentType`:
  - `text` + language set → syntax-highlighted code block
  - `text` + no language → markdown-rendered prose
  - `file` → filename + size + download button
  - `file` (image type) → `<img>` preview + download button
  - `url` → styled link card with URL and description

---

## Type-specific Logic: Components, Not Actions

The actions do **not** branch on type slug. They accept `contentType` and save whatever fields are present. This keeps actions thin and testable.

All type-specific concerns are in components:

| Concern | Location |
|---|---|
| Which fields to show in the form | `ItemForm` → `TextFields` / `FileFields` / `LinkFields` |
| How to render content | `ItemDetail` (switches on `contentType` + slug for image vs file) |
| Syntax highlighting | `ItemDetail` — only applied when `language` is set |
| Image preview vs file download | `ItemDetail` — checks `itemType.slug === 'image'` |
| Pro gate (file, image) | `ItemsView` / `ItemDrawer` — shows upgrade prompt instead of form |

---

## File Upload Flow

File and image items require a two-step process because Server Actions cannot stream large binary uploads:

1. User selects a file in `FileFields`
2. `FileFields` POSTs to `POST /api/upload` (API route, not an action)
3. API route streams to Cloudflare R2, returns `{ fileUrl, fileName, fileSize }`
4. `FileFields` stores the returned values in hidden inputs
5. User submits the main form → `createItemAction` / `updateItemAction` receives the R2 values

The `/api/upload` route is a separate concern, not part of the item action.

---

## Auth Scoping Pattern

Every query and mutation in this system follows the same pattern established in `src/actions/profile.ts`:

```ts
const session = await auth();
if (!session?.user?.id) redirect('/sign-in');
const userId = session.user.id;
// All DB calls use: where: { ..., userId }
```

No item is ever returned, modified, or deleted without a `userId` scope check. This is enforced at the `lib/db` layer for reads and in the action for writes — never trusting a client-supplied owner ID.
