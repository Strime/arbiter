import type { JSX } from 'react';
import { usePreferences } from '../popup/hooks/use-preferences';
import {
  ODBL_LICENSE_URL,
  OPENFOODFACTS_URL,
  PRIVACY_POLICY_URL,
  buildReportMailtoUrl,
} from '../../../../core/support/support';
import type { GetPreferences } from '../../domain/use-cases/get-preferences';
import type { UpdatePreferences } from '../../domain/use-cases/update-preferences';
import type { PreferencesRepository } from '../../domain/repositories/preferences-repository';
import './options-app.css';

interface OptionsAppProps {
  readonly getPreferences: GetPreferences;
  readonly updatePreferences: UpdatePreferences;
  readonly repository: PreferencesRepository;
}

export function OptionsApp(props: OptionsAppProps): JSX.Element {
  const { preferences, loading, setEnabled } = usePreferences(props);
  const version = browser.runtime.getManifest().version;

  return (
    <main className="options">
      <h1 className="options__title">Cocarde — Options</h1>

      <section className="options__section">
        <h2 className="options__section-title">Affichage</h2>
        {loading ? (
          <p className="options__muted">Chargement…</p>
        ) : (
          <label className="options__toggle">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => {
                void setEnabled(e.target.checked);
              }}
            />{' '}
            Activer l'affichage des badges
          </label>
        )}
      </section>

      <section className="options__section">
        <h2 className="options__section-title">À propos</h2>
        <ul className="options__about">
          <li>
            <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
              Politique de confidentialité
            </a>{' '}
            — 100&nbsp;% local, aucune donnée collectée.
          </li>
          <li>
            Données produits issues d'
            <a href={OPENFOODFACTS_URL} target="_blank" rel="noreferrer">
              OpenFoodFacts
            </a>
            , sous licence{' '}
            <a href={ODBL_LICENSE_URL} target="_blank" rel="noreferrer">
              Open Database License (ODbL)
            </a>
            .
          </li>
          <li>
            <a href={buildReportMailtoUrl()}>Signaler un problème</a>
          </li>
        </ul>
      </section>

      <footer className="options__footer">Cocarde v{version}</footer>
    </main>
  );
}
