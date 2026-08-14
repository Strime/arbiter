import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

// WxtVitest (wxt/testing) fournit :
// - le mock de l'API extension (`browser`/`chrome` -> fakeBrowser) via un setup file virtuel ;
// - les alias tsconfig (@/, ~/, @@/, ~~/) ;
// - les auto-imports WXT (browser, defineBackground, defineContentScript, ...) ;
// - la résolution basée sur wxt.config.ts (srcDir: 'src').
export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    environment: 'happy-dom',
    include: ['src/**/__tests__/**/*.test.ts'],
  },
});
