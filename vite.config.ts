import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base + hash routing: the built site works on any static host
// (Netlify, GitHub Pages sub-path, etc.) without server rewrites.
export default defineConfig({
  base: './',
  plugins: [react()],
});
