# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Stack

- **Next.js 16.2.1** with App Router — this is a newer major version; read `node_modules/next/dist/docs/` before writing Next.js-specific code
- **React 19.2.4** with the React Compiler enabled (`babel-plugin-react-compiler`) — do not manually memoize with `useMemo`/`useCallback`
- **Tailwind CSS v4** via `@tailwindcss/postcss` — configuration is done in CSS, not `tailwind.config.js`
- **TypeScript**

## Architecture

App Router layout: `src/app/layout.tsx` is the root layout, wrapping all pages with Geist fonts and global styles. Global styles live in `src/app/globals.css` (currently only the Tailwind import). Pages are colocated under `src/app/`.
