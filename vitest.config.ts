import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/api/**/*.test.ts'],
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
  },
});
