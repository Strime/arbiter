import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // « output » plutôt que « .output » (défaut WXT) : les dossiers à point
  // sont invisibles dans le Finder, or on y récupère les zips à soumettre.
  outDir: 'output',
  zip: {
    // Le zip de sources (revue AMO) ne doit pas embarquer les builds,
    // sinon sa taille gonfle à chaque build (il finit par s'auto-inclure).
    excludeSources: ['output/**'],
  },
  manifest: ({ browser }) => ({
    name: 'Coquade',
    description:
      "Affiche l'origine (marque et fabrication) des produits sur les drives français, pour des achats éclairés.",
    permissions: ['storage', 'alarms'],
    host_permissions: [
      'https://*.carrefour.fr/*',
      'https://*.intermarche.com/*',
      'https://*.auchan.fr/*',
      'https://*.leclercdrive.fr/*',
      'https://*.lidl.fr/*',
      'https://world.openfoodfacts.org/*',
      // OTA brands.json (GitHub Pages) — défense en profondeur + transparence
      // store ; WXT fusionne host_permissions dans permissions pour Firefox MV2.
      'https://strime.github.io/*',
    ],
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          // Identité AMO — figée à la première soumission, ne plus changer ensuite.
          id: 'gaetan@alpsan.fr',
          // ≥140 requis : data_collection_permissions n'existe qu'à partir de
          // Firefox 140 (web-ext lint KEY_FIREFOX_UNSUPPORTED_BY_MIN_VERSION).
          strict_min_version: '140.0',
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
