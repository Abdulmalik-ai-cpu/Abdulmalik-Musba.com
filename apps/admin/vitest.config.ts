import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  // tsconfig sets `jsx: preserve` for Next.js; esbuild needs the automatic runtime.
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@portfolio/api-client': resolve(__dirname, '../../packages/api-client/src/index.ts'),
      '@portfolio/types': resolve(__dirname, '../../packages/types/src/index.ts'),
      '@portfolio/ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
      '@portfolio/utils': resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@portfolio/validation': resolve(__dirname, '../../packages/validation/src/index.ts'),
    },
  },
});
