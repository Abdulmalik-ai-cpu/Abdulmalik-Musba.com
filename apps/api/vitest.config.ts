import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      '@portfolio/config': resolve(__dirname, '../../packages/config/src/index.ts'),
      '@portfolio/validation': resolve(__dirname, '../../packages/validation/src/index.ts'),
      '@portfolio/types': resolve(__dirname, '../../packages/types/src/index.ts'),
      '@portfolio/utils': resolve(__dirname, '../../packages/utils/src/index.ts'),
    },
  },
});
