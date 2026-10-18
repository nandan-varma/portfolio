// Shared by the client snippet (components/posthog.astro) and server-side capture
// (lib/resume.ts). Only production deploys report, so local dev and preview URLs
// never pollute data.
export const POSTHOG_KEY: string | undefined = import.meta.env.PUBLIC_POSTHOG_KEY;
export const POSTHOG_ENABLED = Boolean(POSTHOG_KEY) && process.env.VERCEL_ENV === "production";
// Server-to-server ingestion; browsers go through the same-origin /t proxy in vercel.json.
export const POSTHOG_INGEST_HOST = "https://us.i.posthog.com";
