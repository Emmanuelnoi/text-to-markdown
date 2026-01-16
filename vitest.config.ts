import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['libs/**/*.spec.ts', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', 'src/test-setup.ts', '**/*.spec.ts', '**/*.config.ts'],
    },
    server: { deps: { inline: ['@angular/**', '@spartan-ng/**', 'lucide-angular'] } },
  },
  resolve: { conditions: ['default'] },
});
