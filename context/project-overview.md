# DevStash — Project Overview

> A fast, searchable, AI-enhanced hub for developer knowledge & resources.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Target Users](#target-users)
3. [Feature Set](#feature-set)
4. [Item Types](#item-types)
5. [Data Models](#data-models)
6. [Tech Stack](#tech-stack)
7. [Monetization](#monetization)
8. [UI/UX Guidelines](#uiux-guidelines)
9. [Architecture Overview](#architecture-overview)
10. [Useful Links](#useful-links)

---

## Problem Statement

Developers scatter their essential knowledge across too many places:

| What | Where it lives today |
|---|---|
| Code snippets | VS Code, Notion, GitHub Gists |
| AI prompts | Chat histories, random docs |
| Context files | Buried inside projects |
| Useful links | Browser bookmarks |
| Documentation | Random folders |
| Commands | `.txt` files, bash history |
| Templates | GitHub Gists |

This creates constant context switching, lost knowledge, and inconsistent workflows. **DevStash consolidates everything into one fast, searchable, AI-enhanced hub.**

---

## Target Users

| User Type | Core Need |
|---|---|
| **Everyday Developer** | Quickly grab snippets, prompts, commands, links |
| **AI-first Developer** | Save and organize prompts, system messages, workflows |
| **Content Creator / Educator** | Store code blocks, explanations, and course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, and API examples |

---

## Feature Set

### A. Items & Item Types

Items are the core unit of DevStash. Each item has a **type** that determines how it is stored, displayed, and routed.

- System types are built-in and cannot be modified by users.
- Custom types (Pro only, coming later) will let users define their own.
- URL pattern for type-filtered views: `/items/{type-slug}` (e.g., `/items/snippets`)
- Items are created and accessed via a **quick-access drawer** for minimal friction.

**Content categories:**

| Category | Types |
|---|---|
| Text | `snippet`, `prompt`, `note`, `command` |
| URL | `link` |
| File | `file` *(Pro)*, `image` *(Pro)* |

### B. Collections

Collections group items of any type into named sets.

- An item can belong to **multiple collections** (many-to-many relationship).
- Example collections: *React Patterns*, *Context Files*, *Python Snippets*, *Interview Prep*
- Collections show a dominant **background color** based on the item type they hold the most of.

### C. Search

Full-text and metadata search across:

- Item **content**
- Item **titles**
- **Tags**
- Item **types**

### D. Authentication

- Email/password sign-in
- GitHub OAuth (via NextAuth v5)

### E. General Features

- ⭐ Favorite collections and items
- 📌 Pin items to the top
- 🕐 Recently used items
- 📁 Import code directly from a file
- ✍️ Markdown editor for text-type items
- 📤 Upload files for `file` and `image` types
- 📦 Export data (JSON / ZIP — Pro)
- 🌙 Dark mode (default) with light mode option
- ➕ Add/remove items to/from multiple collections
- 🔍 View which collections any item belongs to

### F. AI Features *(Pro only)*

| Feature | Description |
|---|---|
| **Auto-tag suggestions** | AI suggests relevant tags when creating/editing items |
| **AI Summaries** | Auto-generate a summary for any item |
| **Explain This Code** | AI explains a code snippet in plain language |
| **Prompt Optimizer** | Rewrite and improve AI prompts |

> **Note:** During development, all users will have access to Pro features for testing purposes.

---

## Item Types

| Type | Slug | Color | Hex | Icon (Lucide) |
|---|---|---|---|---|
| Snippet | `snippet` | Blue | `#3b82f6` | `Code` |
| Prompt | `prompt` | Purple | `#8b5cf6` | `Sparkles` |
| Command | `command` | Orange | `#f97316` | `Terminal` |
| Note | `note` | Yellow | `#fde047` | `StickyNote` |
| File | `file` | Gray | `#6b7280` | `File` |
| Image | `image` | Pink | `#ec4899` | `Image` |
| Link | `link` | Emerald | `#10b981` | `Link` |

---

## Data Models

> ⚠️ **Rough draft** — these Prisma models are a starting point and subject to change during development. Do not run `db push`; always use migrations.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Extends NextAuth's default User model
model User {
  id                   String       @id @default(cuid())
  name                 String?
  email                String?      @unique
  emailVerified        DateTime?
  image                String?
  isPro                Boolean      @default(false)
  stripeCustomerId     String?      @unique
  stripeSubscriptionId String?      @unique
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]

  @@map("users")
}

model ItemType {
  id       String  @id @default(cuid())
  name     String
  icon     String
  color    String  // hex color
  isSystem Boolean @default(false)

  userId String?
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)
  items  Item[]

  @@map("item_types")
}

model Item {
  id          String      @id @default(cuid())
  title       String
  contentType ContentType // "text" | "file" | "url"
  content     String?     // text content (null if file/url)
  fileUrl     String?     // Cloudflare R2 URL (null if text/url)
  fileName    String?     // original filename
  fileSize    Int?        // bytes
  url         String?     // for link type
  description String?
  language    String?     // e.g. "typescript", "python"
  isFavorite  Boolean     @default(false)
  isPinned    Boolean     @default(false)
  lastUsedAt  DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  tags        TagsOnItems[]
  collections ItemCollection[]

  @@map("items")
}

model Collection {
  id            String   @id @default(cuid())
  name          String
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?  // default ItemType for newly added items
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items ItemCollection[]

  @@map("collections")
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
  @@map("item_collections")
}

model Tag {
  id    String        @id @default(cuid())
  name  String        @unique
  items TagsOnItems[]

  @@map("tags")
}

model TagsOnItems {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
  @@map("tags_on_items")
}

enum ContentType {
  text
  file
  url
}

// --- NextAuth required models ---

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## Tech Stack

### Core

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/docs) + [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/docs/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/docs) + [shadcn/ui](https://ui.shadcn.com/) |
| **Auth** | [NextAuth v5](https://authjs.dev/) — Email/password + GitHub OAuth |

### Backend & Data

| Layer | Technology |
|---|---|
| **Database** | [Neon](https://neon.tech/docs) — serverless PostgreSQL |
| **ORM** | [Prisma 7](https://www.prisma.io/docs) |
| **Caching** | [Redis](https://redis.io/docs/) *(TBD)* |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) |

### AI & Integrations

| Layer | Technology |
|---|---|
| **AI Model** | [OpenAI `gpt-4o-mini`](https://platform.openai.com/docs/) *(confirm model name)* |
| **Payments** | [Stripe](https://stripe.com/docs) — subscriptions + customer portal |

> ⚠️ **Migration policy:** Never use `prisma db push` in any environment. Always generate and apply migrations with `prisma migrate dev` (development) and `prisma migrate deploy` (production).

---

## Monetization

Freemium model with a Pro tier.

| Feature | Free | Pro |
|---|---|---|
| Items | 50 total | Unlimited |
| Collections | 3 | Unlimited |
| Item types | All except `file` / `image` | All types |
| File & image uploads | ❌ | ✅ |
| AI features | ❌ | ✅ |
| Export (JSON / ZIP) | ❌ | ✅ |
| Custom types | ❌ | ✅ *(coming later)* |
| Priority support | ❌ | ✅ |

**Pricing:** $8/month or $72/year (~25% discount)

> During development, all users will bypass Pro restrictions for easier testing.

---

## UI/UX Guidelines

### General Principles

- Modern, minimal, and developer-focused
- **Dark mode by default** with light mode toggle
- Clean typography, generous whitespace
- Subtle borders and muted shadows
- Inspiration: [Notion](https://notion.so), [Linear](https://linear.app), [Raycast](https://raycast.com)
- Syntax highlighting on all code blocks

### Layout

```
┌────────────────────────────────────────────────────┐
│  [Logo]  DevStash                    [Search] [+]  │
├────────────┬───────────────────────────────────────┤
│            │                                       │
│  TYPES     │   Collections (color-coded cards)     │
│  Snippets  │   ┌──────────┐  ┌──────────┐         │
│  Prompts   │   │ React    │  │ Prompts  │         │
│  Commands  │   │ Patterns │  │ Library  │         │
│  Notes     │   └──────────┘  └──────────┘         │
│  Links     │                                       │
│            │   Items (color-coded border cards)    │
│  RECENT    │   ┌──────────┐  ┌──────────┐         │
│  COLLECTIONS│  │ snippet  │  │ command  │         │
│  ...       │   └──────────┘  └──────────┘         │
│            │                                       │
│  [+ New]   │                                       │
└────────────┴───────────────────────────────────────┘
```

- **Sidebar:** Collapsible. Shows item type links, recent collections, and a quick-create button.
- **Main area:** Grid of collection cards (background = dominant item type color). Items shown below as cards (border = item type color).
- **Item drawer:** Opens from the right. Supports creation, editing, and viewing without leaving context.
- **Mobile:** Sidebar becomes a slide-in drawer.

### Micro-interactions

- Smooth transitions on drawer open/close
- Hover states on collection and item cards
- Toast notifications for create / update / delete / copy actions
- Loading skeletons during data fetches

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Next.js App                    │
│                                                 │
│  ┌─────────────┐      ┌──────────────────────┐  │
│  │  SSR Pages  │      │    API Routes        │  │
│  │  /app/...   │      │  /api/items          │  │
│  │             │      │  /api/collections    │  │
│  └─────────────┘      │  /api/upload         │  │
│                       │  /api/ai/*           │  │
│                       │  /api/auth/[...auth] │  │
│                       └──────────────────────┘  │
└────────────────────────┬────────────────────────┘
                         │
          ┌──────────────┼───────────────┐
          │              │               │
    ┌─────▼─────┐  ┌─────▼──────┐  ┌───▼──────────┐
    │  Neon DB  │  │ Cloudflare │  │  OpenAI API  │
    │ (Postgres)│  │     R2     │  │  (AI feats)  │
    └───────────┘  └────────────┘  └──────────────┘
          │
    ┌─────▼──────┐
    │  Prisma 7  │
    │    ORM     │
    └────────────┘
```

---

## Useful Links

### Docs

- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev/)
- [Prisma 7 Docs](https://www.prisma.io/docs)
- [NextAuth v5 (Auth.js)](https://authjs.dev/)
- [Neon Postgres](https://neon.tech/docs)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Stripe Docs](https://stripe.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs/)

### Reference Projects / Inspiration

- [Raycast](https://raycast.com) — speed-first UX
- [Linear](https://linear.app) — developer-friendly design system
- [Notion](https://notion.so) — flexible knowledge management

### Lucide Icons (used in item types)

- [`Code`](https://lucide.dev/icons/code) — Snippet
- [`Sparkles`](https://lucide.dev/icons/sparkles) — Prompt
- [`Terminal`](https://lucide.dev/icons/terminal) — Command
- [`StickyNote`](https://lucide.dev/icons/sticky-note) — Note
- [`File`](https://lucide.dev/icons/file) — File
- [`Image`](https://lucide.dev/icons/image) — Image
- [`Link`](https://lucide.dev/icons/link) — Link

---

*Last updated: April 2026*
