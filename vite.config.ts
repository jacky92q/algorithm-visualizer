import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Deployed to https://jacky92q.github.io/algorithm-visualizer/
export default defineConfig({
  base: '/algorithm-visualizer/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Algorithm Visualizer',
        short_name: 'AlgoViz',
        description: 'Step-by-step algorithm animations with code highlighting',
        start_url: '/algorithm-visualizer/',
        scope: '/algorithm-visualizer/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F6EEDD',
        theme_color: '#6F4E37',
        categories: ['education', 'utilities'],
        icons: [
          {
            src: '/algorithm-visualizer/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/algorithm-visualizer/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
