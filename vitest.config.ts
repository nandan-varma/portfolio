/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/**/*.{js,ts,tsx,astro}',
      ],
      exclude: [
        'node_modules/',
        'tests/',
        'src/**/*.d.ts',
        'src/**/*.config.*',
        'public/',
        'dist/',
        '.astro/',
        'static/',
        '**/*.config.*',
        '**/types.d.ts',
        '**/content.d.ts',
        '**/_astro/**',
        '**/astro:scripts/**',
      ],
    },
    // Vitest configuration options
  },
});