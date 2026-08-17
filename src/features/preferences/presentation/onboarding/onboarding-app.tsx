import type { JSX } from 'react';
import { PRIVACY_POLICY_URL, SUPPORTED_SITES_FR } from '../../../../core/observer/support';
import './onboarding-app.css';

export function OnboardingApp(): JSX.Element {
  return (
    <main className="onboarding">
      <h1 className="onboarding__title">Bienvenue dans Coquade</h1>
      <p className="onboarding__intro">
        Coquade affiche l'origine des produits directement sur les pages de votre drive. Un badge
        coloré apparaît sur chaque produit reconnu, pour vous aider à acheter en connaissance de
        cause.
      </p>

      <section className="onboarding__section">
        <h2 className="onboarding__section-title">La légende des badges</h2>
        <ul className="onboarding__legend">
          <li>
            <span className="onboarding__swatch onboarding__swatch--fr" aria-hidden="true">
              FR
            </span>
            <span>Bleu foncé — marque française</span>
          </li>
          <li>
            <span className="onboarding__swatch onboarding__swatch--eu" aria-hidden="true">
              EU
            </span>
            <span>Bleu clair — marque européenne</span>
          </li>
          <li>
            <span className="onboarding__swatch onboarding__swatch--us" aria-hidden="true">
              US
            </span>
            <span>Rouge — marque américaine</span>
          </li>
        </ul>
      </section>

      <section className="onboarding__section">
        <h2 className="onboarding__section-title">Marque et fabrication</h2>
        <p className="onboarding__text">
          <strong>Marque</strong> : la nationalité de l'entreprise propriétaire de la marque — c'est
          elle que colore le badge.
        </p>
        <p className="onboarding__text">
          <strong>Fabrication</strong> : le lieu physique de production, affiché dans le détail du
          badge quand il est connu.
        </p>
      </section>

      <section className="onboarding__section">
        <h2 className="onboarding__section-title">Enseignes supportées</h2>
        <ul className="onboarding__list">
          {SUPPORTED_SITES_FR.map((site) => (
            <li key={site}>{site}</li>
          ))}
        </ul>
      </section>

      <section className="onboarding__section onboarding__privacy">
        100&nbsp;% local, aucune donnée collectée.{' '}
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
          Politique de confidentialité
        </a>
      </section>

      <button
        type="button"
        className="onboarding__close"
        onClick={() => {
          window.close();
        }}
      >
        Fermer
      </button>
    </main>
  );
}
