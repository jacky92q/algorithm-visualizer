import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed to https://jacky92q.github.io/algorithm-visualizer/
export default defineConfig({
  base: '/algorithm-visualizer/',
  plugins: [react()],
});
