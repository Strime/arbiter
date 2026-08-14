#!/usr/bin/env node
// Smoke test E2E : charge le build réel (.output/chrome-mv3) dans le Chrome
// système via Playwright, visite des pages drive réelles et compte les badges
// effectivement rendus par la chaîne complète (content script → background →
// verdict → injection Shadow DOM).
//
// Usage : npm run build && node scripts/e2e/smoke.mjs
// Notes :
// - fenêtre visible obligatoire (MV3 + extensions ≠ headless classique) ;
// - Carrefour/Leclerc sont protégés par Datadome : non visités ici, QA
//   manuelle documentée dans docs/store-submission.md ;
// - un échec Auchan (bot-detection) est toléré (warning), Lidl fait foi.
import { chromium } from 'playwright';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXT = join(ROOT, '.output', 'chrome-mv3');
const SHOTS = join(ROOT, 'docs', 'store-assets');

const TARGETS = [
  { id: 'lidl', url: 'https://www.lidl.fr/q/search?q=chocolat', required: true },
  { id: 'auchan', url: 'https://www.auchan.fr/recherche?text=chocolat', required: false },
];

const profile = mkdtempSync(join(tmpdir(), 'arbiter-e2e-'));
const ctx = await chromium.launchPersistentContext(profile, {
  // Chromium Playwright : le Chrome de marque ignore --load-extension depuis 2025.
  headless: false,
  viewport: { width: 1280, height: 800 },
  args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`],
});

// L'onboarding s'ouvre au premier install (onInstalled) : preuve que le
// background tourne. On le capture puis on le ferme.
await new Promise((r) => setTimeout(r, 3000));
const onboarding = ctx.pages().find((p) => p.url().includes('onboarding'));
if (onboarding) {
  await onboarding.screenshot({ path: join(SHOTS, 'screenshot-onboarding.png') });
  console.log('onboarding : ouvert au premier install ✔ (capturé)');
  await onboarding.close();
} else {
  console.warn('onboarding : NON ouvert — vérifier onInstalled');
}

let failed = false;
for (const t of TARGETS) {
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => {
    if (m.text().includes('[arbiter]')) logs.push(m.text());
  });
  try {
    await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    // bannière cookies éventuelle
    await page.locator('#onetrust-accept-btn-handler, button:has-text("Tout accepter")').first()
      .click({ timeout: 5_000 }).catch(() => {});
    // laisser la chaîne complète tourner (observer → messaging → OFF éventuel)
    await page.waitForTimeout(8_000);
    const badges = await page.evaluate(() => document.querySelectorAll('arbiter-badge-host[data-arbiter-badge]').length);
    const cards = await page.evaluate(() => document.querySelectorAll('[data-grid-data], [data-gridbox-impression], article.product-thumbnail').length);
    console.log(`${t.id} : ${badges} badge(s) rendus sur ${cards} carte(s) — logs: ${logs.join(' | ') || '(aucun)'}`);
    if (badges > 0) {
      await page.screenshot({ path: join(SHOTS, `screenshot-${t.id}-e2e.png`) });
    } else if (t.required) {
      failed = true;
      console.error(`${t.id} : ÉCHEC — aucun badge rendu`);
    } else {
      console.warn(`${t.id} : 0 badge (toléré — bot-detection possible)`);
    }
  } catch (e) {
    if (t.required) { failed = true; console.error(`${t.id} : ÉCHEC —`, e.message); }
    else console.warn(`${t.id} : inaccessible (${e.message}) — toléré`);
  }
  await page.close();
}

await ctx.close();
process.exit(failed ? 1 : 0);
