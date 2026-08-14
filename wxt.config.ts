import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifest: ({ browser }) => ({
    name: 'Arbiter',
    description:
      "Affiche l'origine (marque et fabrication — FR, EU, US) des produits sur les drives français, pour des achats éclairés.",
    permissions: ['storage', 'alarms'],
    host_permissions: [
      'https://*.carrefour.fr/*',
      'https://*.intermarche.com/*',
      'https://*.auchan.fr/*',
      'https://*.leclercdrive.fr/*',
      'https://*.lidl.fr/*',
      'https://world.openfoodfacts.org/*',
    ],
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          // Identité AMO — figée à la première soumission, ne plus changer ensuite.
          id: 'arbiter@sancassani.dev',
          strict_min_version: '115.0',
          // Aucune donnée transmise au développeur ; stockage 100 % local,
          // OpenFoodFacts appelé en fallback fonctionnel uniquement (cf. PRIVACY.md).
          data_collection_permissions: {
            required: ['none'],
          },
        },
      },
    }),
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
  }),
});
