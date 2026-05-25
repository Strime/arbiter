import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Arbiter',
    description:
      "Affiche l'origine (FR / EU / US) des produits sur les sites de drive — favorisez FR/EU, évitez US.",
    permissions: ['storage', 'activeTab'],
    host_permissions: [
      'https://*.carrefour.fr/*',
      'https://drive.carrefour.fr/*',
      'https://*.intermarche.com/*',
      'https://*.auchan.fr/*',
      'https://*.leclercdrive.fr/*',
      'https://world.openfoodfacts.org/*',
    ],
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
  },
});
