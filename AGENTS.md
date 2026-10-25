# UI and performance

- Prioritize the best UI/UX at every visible frame, including loading, Astro view transitions, rapid navigation, and browser history navigation.
- Performance work must preserve visual fidelity, native display resolution, refresh-rate motion, typography, and interaction continuity. Optimize redundant work instead of reducing quality.
- Verify intermediate transition frames as well as settled pages, and respect reduced-motion preferences.

# LLM-readable content

- `/llms.txt`, `/index.md` and every public page's `.md` twin are generated from the content collections; don't hand-write them. `/resume` negotiates `Accept: text/markdown` to `/resume.md` (`middleware.ts`).
- `src/content/resume.md` is the one hand-written source for the markdown resume; only the project entries (after the `featured-projects` marker) are generated from the project pages. Update it whenever the resume PDF in `src/lib/resume.ts` changes.
