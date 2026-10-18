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
