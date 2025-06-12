// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

import sentry from "@sentry/astro";

// import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nandanvarma.com',
  integrations: [mdx(), sitemap(), react(),
  sentry({
    dsn: "https://1551f8917146f730c327de9b39b20c52@o4509488030482432.ingest.us.sentry.io/4509488040312832",
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    sourceMapsUploadOptions: {
      project: "portfolio",
      authToken: process.env.SENTRY_AUTH_TOKEN,
    },
  }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});