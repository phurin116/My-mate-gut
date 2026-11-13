import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single-bundle build used for embedded previews: one JS file, one CSS file, fonts inlined.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
