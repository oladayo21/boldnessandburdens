// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  // Mostly a static marketing site; only the /bb26 lookup + admin routes opt
  // into on-demand rendering via `export const prerender = false`.
  output: 'static',
  adapter: cloudflare(),
  // Svelte powers the interactive admin console islands.
  integrations: [svelte()],
});
