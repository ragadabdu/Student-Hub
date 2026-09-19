import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API requests to the Rails backend during development.
    //
    // Why: the frontend runs on localhost:5173, the backend on
    // localhost:3000. Without a proxy, they're cross-origin, which means
    // the browser will NOT expose the backend's XSRF-TOKEN cookie to
    // `document.cookie` — so CSRF headers can't be attached, and
    // state-changing requests fail.
    //
    // With this proxy, the frontend calls `/api/v1/...` on its OWN origin
    // (localhost:5173). Vite forwards requests to the backend while
    // preserving the Host header, so Rails' CSRF origin check sees:
    //   Origin:   http://localhost:5173
    //   Host:     localhost:5173   ← derived from the preserved header
    //   base_url: http://localhost:5173
    //
    // All three match → CSRF passes.
    //
    // We deliberately do NOT set changeOrigin: true, because that would
    // rewrite the Host header to localhost:3000 while the Origin header
    // stayed at localhost:5173, causing Rails' CSRF origin check to
    // reject state-changing requests with 422.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
