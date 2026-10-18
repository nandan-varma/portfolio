// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";
import prefetchSectionStyles from "./integrations/prefetchSectionStyles.mjs";

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
    plugins: [tailwindcss()],
  },

  redirects: {
    "/cv":
      "https://qujr12qsco.ufs.sh/f/fthLDAMTNUTlwdChqLZue7hJ43mSDHQtXwVdx90vZ8kIKgM5",
    "/resume":
      "https://qujr12qsco.ufs.sh/f/66ba979a-9fcd-4ed7-ae19-a564d45889a6-fgc05v.pdf",
    "/resume/apple":
      "https://2puzbcbw6l.ufs.sh/f/AmQx6INo4gSiKHDyLDPZfDvQP9eRg6xphAlI78dYFUOGJoLM",
  },

  adapter: vercel(),
});
