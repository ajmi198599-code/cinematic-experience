import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    // The renderer is one lazy engine chunk. The delivery budget is measured on compressed files.
    chunkSizeWarningLimit: 550,
    rollupOptions: {
      output: { manualChunks: id => id.includes('/node_modules/three/') ? 'three' : undefined },
    },
  },
  server: {
    fs: {
      allow: [
        fileURLToPath(new URL('.', import.meta.url)),
        fileURLToPath(new URL('../beyond-reality-phase-a/data.json', import.meta.url)),
      ],
    },
  },
});
