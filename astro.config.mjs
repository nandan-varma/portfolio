// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://www.nandan.fyi",
  integrations: [mdx(), sitemap(), react()],

  vite: {
    plugins: [tailwindcss()],
  },

  redirects: {
    "/cv":
      "https://qujr12qsco.ufs.sh/f/fthLDAMTNUTlwdChqLZue7hJ43mSDHQtXwVdx90vZ8kIKgM5",
    "/resume":
      "https://qujr12qsco.ufs.sh/f/fthLDAMTNUTlpXwxWFqTgaChdqixHZzrR4PkbvIQ2F9AtfWs",
  },

  adapter: vercel(),
});
