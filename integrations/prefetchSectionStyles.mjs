import { readFile, writeFile } from 'node:fs/promises';

/** Warm section CSS without adding it to the homepage's render-blocking styles. */
export default function prefetchSectionStyles() {
  return {
    name: 'prefetch-section-styles',
    hooks: {
      'astro:build:generated': async ({ dir }) => {
        const homepageURL = new URL('index.html', dir);
        const [homepage, section] = await Promise.all([
          readFile(homepageURL, 'utf8'),
          readFile(new URL('projects/index.html', dir), 'utf8'),
        ]);
        const stylesheets = html => (html.match(/<link\b[^>]*>/g) ?? [])
          .filter(tag => /\brel="stylesheet"/.test(tag))
          .map(tag => tag.match(/\bhref="([^"]+)"/)?.[1])
          .filter(href => href?.startsWith('/') && href.endsWith('.css'));
        const initialStyles = new Set(stylesheets(homepage));
        const hints = [...new Set(stylesheets(section))]
          .filter(href => !initialStyles.has(href))
          .map(href => `<link rel="prefetch" as="style" fetchpriority="low" href="${href}">`)
          .join('');
        await writeFile(homepageURL, homepage.replace('</head>', `${hints}</head>`));
      },
    },
  };
}
