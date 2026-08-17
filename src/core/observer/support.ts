/**
 * Point central pour le support utilisateur : adresse de contact,
 * liens publics et construction du lien de signalement d'erreur.
 */

export const SUPPORT_EMAIL = 'sancassani.gaetan@gmail.com';

export const PRIVACY_POLICY_URL = 'https://strime.github.io/arbiter-data/PRIVACY.html';

export const OPENFOODFACTS_URL = 'https://world.openfoodfacts.org';
export const ODBL_LICENSE_URL = 'https://opendatacommons.org/licenses/odbl/1-0/';

/** Enseignes supportées, telles qu'affichées à l'utilisateur (popup, onboarding). */
export const SUPPORTED_SITES_FR: readonly string[] = [
  'Carrefour Drive',
  'Intermarché Drive',
  'Auchan Drive',
  'E.Leclerc Drive',
  'Lidl',
];

export interface ReportDetails {
  readonly brand?: string;
  readonly ean?: string;
  readonly displayedVerdict?: string;
}

// TODO: quand le repo sera public, remplacer ce mailto par un lien
// « new issue » GitHub pré-rempli (https://github.com/Strime/arbiter/issues/new).
export function buildReportMailtoUrl(details: ReportDetails = {}): string {
  const subject =
    details.brand !== undefined
      ? `[Coquade] Signalement d'erreur — ${details.brand}`
      : '[Coquade] Signalement de problème';

  const lines: string[] = [];
  if (details.brand !== undefined) lines.push(`Marque : ${details.brand}`);
  if (details.ean !== undefined) lines.push(`EAN : ${details.ean}`);
  if (details.displayedVerdict !== undefined) {
    lines.push(`Verdict affiché : ${details.displayedVerdict}`);
  }
  if (lines.length > 0) lines.push('');
  lines.push('Décrivez le problème constaté :', '');

  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  return `mailto:${SUPPORT_EMAIL}?${query}`;
}
