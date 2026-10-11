// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://tether.app',
  integrations: [mdx(), react()],
  markdown: {
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
