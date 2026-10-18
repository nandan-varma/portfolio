# Portfolio

```sh
pnpm install
pnpm dev
```

Create a production build with `pnpm build`, then serve it with `pnpm preview`.

## Browser regression checks

```sh
pnpm exec playwright install chromium
pnpm test:e2e
```

To use an installed browser, set `CHROME_PATH` to its executable when running
`pnpm test:e2e`. Tests cover desktop, mobile, and landscape viewports, canvas
continuity through Astro transitions and browser history, destination painting
before transition snapshots, article cleanup, rapid navigation, native display
resolution, and changes to reduced-motion preferences. They block PostHog requests
in the test browser to keep synthetic traffic out of production analytics.

Visual fidelity and smooth intermediate transition frames take precedence over
optimizations that reduce display resolution or animation quality.

The homepage uses `LandingHead.astro` and a Tailwind entry limited to its own
components. Other routes use `BaseHead.astro` with the complete site utilities.
Both heads share metadata, analytics, lifecycle scripts, fonts, and `shared.css`;
keep those shared rules in one place to preserve styling during navigation.
Production builds emit a low-priority native prefetch for section CSS so it can
be cached for navigation without becoming a render-blocking homepage stylesheet.
