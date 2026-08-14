import type { JSX } from 'react';
import { usePreferences } from './hooks/use-preferences';
import { useActiveTab, type ActiveTabStatus } from './hooks/use-active-tab';
import { SUPPORTED_SITES_FR, buildReportMailtoUrl } from '../../../../core/support/support';
import type { GetPreferences } from '../../domain/use-cases/get-preferences';
import type { UpdatePreferences } from '../../domain/use-cases/update-preferences';
import type { PreferencesRepository } from '../../domain/repositories/preferences-repository';
import type { MessagingClient } from '../../../../core/messaging/client';
import './popup-app.css';

interface PopupAppProps {
  readonly getPreferences: GetPreferences;
  readonly updatePreferences: UpdatePreferences;
  readonly repository: PreferencesRepository;
  readonly messagingClient: MessagingClient;
}

function StatusPanel(props: { readonly status: ActiveTabStatus; readonly enabled: boolean }): JSX.Element {
  const { status, enabled } = props;

  if (status.kind === 'loading') {
    return (
      <section className="popup__status">
        <p className="popup__status-line popup__muted">Vérification de la page…</p>
      </section>
    );
  }

  if (status.kind === 'unsupported') {
    return (
      <section className="popup__status">
        <p className="popup__status-line">
          <span className="popup__dot" aria-hidden="true" />
          <span>Cette page n'est pas un drive supporté.</span>
        </p>
        <ul className="popup__sites">
          {SUPPORTED_SITES_FR.map((site) => (
            <li key={site}>{site}</li>
          ))}
        </ul>
      </section>
    );
  }

  if (!enabled) {
    return (
      <section className="popup__status">
        <p className="popup__status-line">
          <span className="popup__dot" aria-hidden="true" />
          <span>Drive supporté, mais Arbiter est désactivé.</span>
        </p>
        <p className="popup__count">Activez-le ci-dessous pour afficher les badges.</p>
      </section>
    );
  }

  return (
    <section className="popup__status">
      <p className="popup__status-line">
        <span className="popup__dot popup__dot--active" aria-hidden="true" />
        <span>Actif sur cette page</span>
      </p>
      <p className="popup__count">
        {status.badgeCount === 0
          ? 'Aucun produit badgé pour l’instant.'
          : status.badgeCount === 1
            ? '1 produit badgé'
            : `${status.badgeCount} produits badgés`}
      </p>
    </section>
  );
}

export function PopupApp(props: PopupAppProps): JSX.Element {
  const { preferences, loading, setEnabled } = usePreferences(props);
  const { status, refresh } = useActiveTab(props.messagingClient);
  const version = browser.runtime.getManifest().version;

  return (
    <main className="popup">
      <h1 className="popup__title">Arbiter</h1>
      <p className="popup__subtitle">Origine des produits sur le drive</p>

      {!loading && <StatusPanel status={status} enabled={preferences.enabled} />}

      {loading ? (
        <p className="popup__muted">Chargement…</p>
      ) : (
        <label className="popup__toggle">
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => {
              void setEnabled(e.target.checked).then(refresh);
            }}
          />
          <span>{preferences.enabled ? 'Actif' : 'Désactivé'}</span>
        </label>
      )}

      <nav className="popup__links">
        <button
          type="button"
          className="popup__link"
          onClick={() => {
            void browser.runtime.openOptionsPage();
          }}
        >
          Options
        </button>
        <a className="popup__link" href={buildReportMailtoUrl()}>
          Signaler un problème
        </a>
      </nav>

      <footer className="popup__footer">v{version}</footer>
    </main>
  );
}
