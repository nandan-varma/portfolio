# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`) — use `pnpm`, not `npm`/`yarn`.

```bash
pnpm dev       # astro dev — dev server on :4321 (falls back to :4322 if busy)
pnpm build     # astro build — static build, output to dist/ (+ .vercel/output via the Vercel adapter)
pnpm preview   # astro preview — serve the built output locally
```

There is no lint script and no test suite/framework configured in this repo. `pnpm astro check` works but is not installed by default — the first run prompts to interactively add `@astrojs/check` and `typescript` as dependencies (decline unless you actually intend to add typechecking to the toolchain).

## Architecture

**Stack**: Astro 6 (static output, `@astrojs/vercel` adapter), MDX content collections, Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`). No client-side JS framework — no React/Vue runtime is actually used anywhere despite `tsconfig.json` setting `jsx: "react-jsx"` and a `components.json` shadcn scaffold. All interactivity is Astro components + inline `<script is:inline>` blocks (vanilla DOM APIs, `IntersectionObserver`, etc.), re-initialized on both `DOMContentLoaded` and `astro:page-load` since Astro's View Transitions do client-side navigation without a full page load.

**Known scaffold mismatch**: `components.json` points `utils` at `@/lib/utils` and `ui` at `@/components/ui`, but the actual `cn()` helper lives at `src/lib/core/utils.ts` and `src/components/ui/` is empty. shadcn was configured but never actually used — don't assume either path is wired up.

### Page/layout structure

- `src/layouts/Layout.astro` is the single shared page shell (head via `BaseHead`, `Navigation`, `<slot />`, `ScrollReveal`, `CardTilt`) and is used by every route.
- `src/layouts/ProjectPost.astro` and `BlogPost.astro` are **not** full page layouts — they're hero/header components rendered *inside* `Layout`'s slot from `src/pages/projects/[...slug].astro` / `src/pages/blog/[...slug].astro`, followed by the rendered MDX `<Content />` wrapped in a `.mdx-body` class.
- `Layout` accepts `nav` (show/hide), `navPosition` (`"top" | "bottom"`), and `navShowBack` props. Only the homepage currently uses `navPosition="bottom"` + `navShowBack={false}` — `Navigation.astro` branches its width/spacing on `position === "bottom"`, so that branch is effectively "homepage-only" styling, not a generalized variant.
- `Navigation`'s outer `<header>` carries `transition:name="site-nav"` so Astro's View Transitions morph/animate it between the homepage's bottom-docked bar and other pages' top bar, rather than just cross-fading. Other shared-element names follow the pattern `project-title-<title>`, `blog-title-<title>`, `<Page>-Nav`, etc. — keep names in sync between the list and detail pages when adding new transitioning elements.

### Styling / design tokens

- `src/styles/global.css` is the single source of truth for design tokens: light theme in `:root`, dark theme in `:root.dark`, mapped into Tailwind utilities via `@theme inline`. Dark mode is class-based via `@custom-variant dark (&:where(.dark, .dark *));` — Tailwind v4 does not read a JS config for this, and there is intentionally no `tailwind.config.js` (v4 with the Vite plugin ignores it unless referenced via `@config` in CSS).
- One brand color (`--brand` / `--brand-dark`, indigo) plus neutrals — not a multi-hue palette. Reusable classes live in `@layer components` in `global.css`: `.card`, `.btn-primary`/`.btn-secondary`, `.chip`, `.nav-link`, `.gradient-text`.
- `[data-reveal]` elements start hidden and get `.is-visible` added by `ScrollReveal.astro`'s `IntersectionObserver` script — use this attribute (optionally on `Card` via its `reveal` prop) rather than inventing new scroll-animation logic.
- `[data-tilt]` elements get a mouse-driven 3D tilt from `CardTilt.astro` (opt-in per element, skipped under `prefers-reduced-motion` and on non-`pointer: fine` devices) — it's wired globally in `Layout` but only affects elements that explicitly opt in.
- `src/styles/mdx.css` styles MDX prose and is scoped under `.mdx-body` (the wrapper div in the slug pages) rather than bare element selectors — this matters because Astro applies a `class` passed to `<Content />` to each top-level rendered element individually, not to a wrapping container, so a bare-selector stylesheet can't be reliably scoped that way.
- Theme is purely OS-driven — no manual toggle, no stored override. The init script in `BaseHead.astro` applies `.dark` from `matchMedia("(prefers-color-scheme: dark)")`, live-updates on an OS theme change, and re-applies on `astro:before-swap` (view transitions morph `<html>` against the incoming page's static markup, which never has `class="dark"`, so without this hook the class gets stripped after every soft navigation).

### Content collections

- `src/content.config.ts` defines two collections loaded from `src/content/project/*.mdx` (41 entries) and `src/content/blog/*.mdx` (7 entries) via the `glob` loader, each with a Zod schema (`Project`/`Blog` types exported from that file).
- Project frontmatter: `title`, `description`, `date` (string, not coerced), `repository` (required), `url`/`emoji`/`heroImage` (optional), `published: boolean` — unpublished projects are filtered out of listings and marked `noindex`.
- Blog frontmatter: `title`, `description`, `date`, `draft?: boolean` — draft posts are filtered from listings/RSS and marked `noindex`.
- `src/pages/projects/index.astro` sorts projects by a **hand-maintained `impressivenessRank` map** (mirrors an external resume tier list) — new projects that aren't added to that map just sort to the bottom by insertion order. This is independent of `src/pages/index.astro`'s homepage "Selected work" section, which hardcodes its own featured titles (`["PushStack", "MarsOS", "Nemesis"]`) — the two curation lists don't derive from each other and must be updated separately.
- `src/pages/og/[...route].ts` uses `astro-og-canvas` to generate an OG image for every static page, blog post, and project at build time (reads `public/favicon.png` as the logo).

### Analytics

`src/components/posthog.astro` is completely disabled in dev (`import.meta.env.DEV` guard) because the dev server shares the same PostHog project key as production — unguarded, local testing would pollute real analytics. Needs `PUBLIC_POSTHOG_KEY` / `PUBLIC_POSTHOG_HOST` env vars in production; features like session recording, autocapture, and feature flags are explicitly disabled to keep it lightweight, and it respects Do Not Track.

### Deploy

Adapter is `@astrojs/vercel`. `/cv` and `/resume` are configured as redirects in `astro.config.mjs` pointing at externally-hosted files, not real routes.
