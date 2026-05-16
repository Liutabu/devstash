# Homepage

## Overview

Implement the marketing homepage at `/` based on the `prototypes/homepage/` mockup. Convert from standalone HTML/CSS/JS into a proper Next.js page using Tailwind CSS v4 and shadcn/ui, with server and client components split appropriately.

The existing prototype at `prototypes/homepage/` is the visual reference — match it closely.

---

## Route & File Structure

```
src/app/(marketing)/
  layout.tsx          ← server: minimal layout (no DashboardShell)
  page.tsx            ← server: assembles all sections
  _components/
    Navbar.tsx        ← client: scroll opacity + mobile menu toggle
    HeroSection.tsx   ← server: layout shell
    ChaosArena.tsx    ← client: rAF animation + mouse repulsion
    DashboardMockup.tsx ← server: static SVG/div mockup
    FeaturesSection.tsx ← server
    AiSection.tsx     ← server
    PricingSection.tsx ← client: monthly/yearly toggle state
    CtaSection.tsx    ← server
    Footer.tsx        ← server
```

---

## Sections

### Navbar (client)
- Fixed top, full width; `backdrop-blur` + increases opacity on scroll (use `useEffect` + scroll listener)
- Logo (Box icon from Lucide or inline SVG matching prototype) + "DevStash" text, links to `/`
- Desktop: "Features" / "Pricing" anchor links, "Sign In" ghost button → `/sign-in`, "Get Started" primary button → `/register`
- Mobile: hamburger toggles a dropdown menu with the same links
- Use shadcn `Button` for CTA buttons

### Hero Section
Split into two sub-components:

**HeroSection (server)** — renders the text side and positions `<ChaosArena>` and `<DashboardMockup>`:
- Badge: "Developer Knowledge Hub"
- H1: "Stop Losing Your **Developer Knowledge**" — the second line uses a CSS gradient (blue → purple)
- Subheadline matching prototype copy
- CTA: "Get Started Free" → `/register`, "See Features" → `#features`

**ChaosArena (client)** — port the `initChaos()` logic from `prototypes/homepage/script.js` directly:
- `useEffect` runs `requestAnimationFrame` loop on mount, cancels on unmount
- Mouse repulsion via `mousemove` listener on the arena element
- Pause on `visibilitychange` (tab hidden)
- 8 icons: Notion, GitHub, Slack, VS Code, Browser, Terminal, Text file, Bookmark — each a 44px rounded square with inline SVG (copy from prototype)
- Box label "Your knowledge today..."

**DashboardMockup (server)** — static div mockup, no JS needed:
- Box label "...with DevStash"
- Mini sidebar with 6 colored dots + bars
- 2×3 grid of colored-border item cards
- Colors: `#3b82f6`, `#f59e0b`, `#06b6d4`, `#22c55e`, `#6366f1`, `#ec4899`

Transform arrow between the two boxes: CSS pulse animation, rotates 90° on mobile (`md:rotate-0 rotate-90`).

### Features Section (server)
- Section id `features` for anchor linking
- 6-card grid (1 col mobile → 2 col md → 3 col lg)
- Cards: Code Snippets (#3b82f6), AI Prompts (#f59e0b), Instant Search (#6366f1), Commands (#06b6d4), Files & Docs (#64748b), Collections (#10b981)
- Each card: accent-colored icon, title, description (copy from prototype)
- Fade-in on scroll: use `IntersectionObserver` in a `useEffect` client wrapper, or Tailwind `animate-` class — simplest approach is a small `FadeIn` client wrapper component

### AI Section (server)
- Left column: "PRO FEATURE" badge, h2, paragraph, checklist of 4 AI features with check icons (copy from prototype)
- Right column: static code editor mockup — macOS dots, filename `useDebounce.ts`, syntax-highlighted code block using `<pre><code>` with Tailwind classes, "AI Generated Tags" footer with 5 tag chips
- No real syntax highlighting library needed; use `<span>` with color classes like the prototype does

### Pricing Section (client — toggle state)
- Section id `pricing`
- Monthly/Yearly toggle (shadcn or custom checkbox) — swaps displayed price
- Free card: $0, feature list with check/x icons, "Get Started Free" outline button → `/register`
- Pro card: "Most Popular" badge, $8/mo or $6/mo (billed $72/yr), full feature list, "Start Pro Free Trial" primary button → `/register`
- Prices, features, and descriptions match the prototype exactly

### CTA Section (server)
- H2: "Ready to Organize Your Knowledge?"
- Subtext + "Get Started Free" button → `/register`
- Centered, distinct background to stand out

### Footer (server)
- Logo + tagline
- 3 link columns: Product (Features anchor, Pricing anchor, Dashboard `/dashboard`), Company (About/Blog/Changelog — `href="#"` placeholders), Legal (Privacy/Terms — `href="#"` placeholders)
- Copyright line with current year — use `new Date().getFullYear()` in a tiny `'use client'` `<CurrentYear>` component or just hardcode via server-side `new Date().getFullYear()`

---

## Scroll Fade-in

Create a small `src/components/ui/FadeIn.tsx` client wrapper:
- Wraps children, starts `opacity-0 translate-y-4`, transitions to `opacity-100 translate-y-0` when `IntersectionObserver` fires
- Used on section headers and feature cards throughout

---

## Routing

| Element | Destination |
|---|---|
| "Sign In" button/link | `/sign-in` |
| "Get Started" / "Get Started Free" | `/register` |
| "Start Pro Free Trial" | `/register` |
| "Dashboard" footer link | `/dashboard` |
| Features nav link | `#features` (same-page anchor) |
| Pricing nav link | `#pricing` (same-page anchor) |
| Logo | `/` |

---

## Auth Redirect

In `src/app/(marketing)/page.tsx`, check session with `auth()`. If the user is already signed in, `redirect('/dashboard')` so authenticated users don't see the marketing page.

---

## Styling Notes

- Dark background (`bg-[#0a0a0a]` or CSS variable) matching the prototype's `#0d0d0d`
- Use Tailwind utility classes; no custom CSS files — replicate the prototype's visual style with Tailwind equivalents
- Gradient text on the hero h1: `bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`
- The marketing layout has no sidebar — just `<Navbar>` + `{children}` + `<Footer>`
- Do not use `DashboardShell` anywhere on this page

## Responsive

- Mobile-first; key breakpoints: `md` (768px) for 2-col grids, `lg` (1024px) for 3-col grids
- Hero visual stacks vertically on mobile; arrow rotates 90° (`rotate-90 md:rotate-0`)
- Navbar collapses to hamburger on mobile
