import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://serambi.example',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
});
