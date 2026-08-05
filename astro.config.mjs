import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: 独自ドメイン取得後に差し替える(README_SETUP.md 手順3)
export const SITE_URL = 'https://okinawa-drive-blog.example.com';

export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  build: { format: 'directory' },
});
