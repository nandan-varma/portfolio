import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

import sentry from "@sentry/astro";

import { visualizer } from 'rollup-plugin-visualizer';

// import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nandanvarma.com',
  integrations: [mdx(), sitemap(), react(),
   sentry(),
  ],

  vite: {
    plugins: [tailwindcss(), visualizer()],
  },

  adapter: vercel(),
});