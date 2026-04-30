# Item Types

DevStash supports 7 built-in (system) item types. Each type maps to one of three `ContentType` values that determines which database fields are used and how the item is displayed.

---

## Individual Types

### Snippet
| Field | Value |
|---|---|
| Slug | `snippet` |
| Icon | `Code` (Lucide) |
| Color | `#3b82f6` (Blue) |
| ContentType | `text` |
| Key fields | `content`, `language` |
| Pro only | No |

Reusable code blocks. Supports syntax highlighting via the `language` field (e.g. `typescript`, `python`, `dockerfile`). Most common type for saving boilerplate, utilities, and patterns.

---

### Prompt
| Field | Value |
|---|---|
| Slug | `prompt` |
| Icon | `Sparkles` (Lucide) |
| Color | `#8b5cf6` (Purple) |
| ContentType | `text` |
| Key fields | `content`, `description` |
| Pro only | No |

AI prompt templates. Plain text with optional `description` summarizing the prompt's purpose. No `language` field needed.

---

### Command
| Field | Value |
|---|---|
| Slug | `command` |
| Icon | `Terminal` (Lucide) |
| Color | `#f97316` (Orange) |
| ContentType | `text` |
| Key fields | `content`, `description` |
| Pro only | No |

Shell/CLI commands. Similar to snippet but semantically distinct — single-line or multi-line terminal commands, often with inline comments. Syntax highlighting applies.

---

### Note
| Field | Value |
|---|---|
| Slug | `note` |
| Icon | `StickyNote` (Lucide) |
| Color | `#fde047` (Yellow) |
| ContentType | `text` |
| Key fields | `content`, `description` |
| Pro only | No |

Free-form text or markdown. For documentation, explanations, and anything that doesn't fit a structured type. Rendered with the markdown editor.

---

### File
| Field | Value |
|---|---|
| Slug | `file` |
| Icon | `File` (Lucide) |
| Color | `#6b7280` (Gray) |
| ContentType | `file` |
| Key fields | `fileUrl`, `fileName`, `fileSize` |
| Pro only | Yes |

Uploaded files stored on Cloudflare R2. `fileUrl` is the R2 object URL. `fileName` preserves the original filename. `fileSize` is in bytes. The `content` and `url` fields are null.

---

### Image
| Field | Value |
|---|---|
| Slug | `image` |
| Icon | `Image` (Lucide) |
| Color | `#ec4899` (Pink) |
| ContentType | `file` |
| Key fields | `fileUrl`, `fileName`, `fileSize` |
| Pro only | Yes |

Uploaded images stored on Cloudflare R2. Same storage pattern as `file`. Distinguished by type so the UI can render a preview rather than a download link.

---

### Link
| Field | Value |
|---|---|
| Slug | `link` |
| Icon | `Link` (Lucide) |
| Color | `#10b981` (Emerald) |
| ContentType | `url` |
| Key fields | `url`, `description` |
| Pro only | No |

Saved URLs. The `url` field holds the full URL. `description` is used as a human-readable summary. `content` and file fields are null.

---

## ContentType Classification

| ContentType | Types | Active fields |
|---|---|---|
| `text` | snippet, prompt, command, note | `content`, `language` (optional) |
| `file` | file, image | `fileUrl`, `fileName`, `fileSize` |
| `url` | link | `url` |

---

## Shared Properties

All item types share the same `Item` model fields:

| Field | Type | Notes |
|---|---|---|
| `id` | `String` | cuid |
| `title` | `String` | required |
| `contentType` | `ContentType` | enum: text / file / url |
| `description` | `String?` | optional summary |
| `isFavorite` | `Boolean` | default false |
| `isPinned` | `Boolean` | default false |
| `lastUsedAt` | `DateTime?` | updated on copy/use |
| `createdAt` | `DateTime` | auto |
| `updatedAt` | `DateTime` | auto |
| `userId` | `String` | owner |
| `itemTypeId` | `String` | FK to `ItemType` |
| `tags` | relation | many-to-many via `TagsOnItems` |
| `collections` | relation | many-to-many via `ItemCollection` |

---

## Display Differences

- **Sidebar:** Each type appears as a nav link with its colored icon and a live item count.
- **Item cards:** Left border uses the item type's hex color.
- **Collection cards:** Top border/background tint reflects the dominant item type (the type with the most items in that collection).
- **Code rendering:** `snippet` and `command` items use syntax highlighting when `language` is set.
- **Pro badge:** `file` and `image` types show a "PRO" badge in the sidebar when the sidebar is expanded.
- **File items:** Display a download/preview UI instead of a text editor.
- **Link items:** Display the URL with optional description; no editor.

---

## Icon Map

Defined in [src/lib/item-type-icons.ts](../src/lib/item-type-icons.ts):

```ts
export const ITEM_TYPE_ICON_MAP: Record<string, LucideIcon> = {
  Code,        // snippet
  Sparkles,    // prompt
  Terminal,    // command
  StickyNote,  // note
  File,        // file
  Image,       // image
  Link,        // link
};
```

The map key matches the `icon` field stored in the `ItemType` database record.
