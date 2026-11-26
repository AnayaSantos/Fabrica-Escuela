import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: '@tracelog/api-client',
        replacement: path.resolve(projectRoot, 'src/shared/api/index.ts'),
      },
      {
        find: '@tracelog/hu-15/fecha-estimada',
        replacement: path.resolve(projectRoot, 'src/modules/hu-15/utils/fechaEstimada.ts'),
      },
      {
        find: '@tracelog/hu-19/ejemplos',
        replacement: path.resolve(projectRoot, 'src/modules/hu-19/ejemplos.ts'),
      },
      {
        find: '@tracelog/hu-19',
        replacement: path.resolve(projectRoot, 'src/modules/hu-19/components/AlertaTiempoEntrega.tsx'),
      },
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
