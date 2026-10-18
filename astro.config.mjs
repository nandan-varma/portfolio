// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import posthog from "@posthog/rollup-plugin";
import prefetchSectionStyles from "./integrations/prefetchSectionStyles.mjs";

// Upload source maps to PostHog error tracking when a personal API key is set
// (production builds on Vercel). Maps are deleted after upload, never served.
const posthogSourceMaps = process.env.POSTHOG_API_KEY
  ? [posthog({ personalApiKey: process.env.POSTHOG_API_KEY, projectId: "322151", host: "https://us.i.posthog.com" })]
  : [];

// https://astro.build/config
export default defineConfig({
  site: "https://www.nandan.fyi",
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/recommend"),
    }),
    react(),
    prefetchSectionStyles(),
  ],

  vite: {
    plugins: [tailwindcss(), ...posthogSourceMaps],
  },

  adapter: vercel(),
});
