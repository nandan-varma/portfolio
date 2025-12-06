// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.nandanvarma.com',
  integrations: [mdx(), sitemap(), react()],

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        external: ['pyodide'],
      },
    }
  },

  redirects: {
    '/cv': 'https://qujr12qsco.ufs.sh/f/fthLDAMTNUTlvG2WP5NtSWA6D1E3dn59jRJIHL24zrchovMw',
  },

  adapter: vercel(),
});