import type { JSX } from 'react';
import { usePreferences } from '../popup/hooks/use-preferences';
import type { GetPreferences } from '../../domain/use-cases/get-preferences';
import type { UpdatePreferences } from '../../domain/use-cases/update-preferences';
import type { PreferencesRepository } from '../../domain/repositories/preferences-repository';

interface OptionsAppProps {
  readonly getPreferences: GetPreferences;
  readonly updatePreferences: UpdatePreferences;
  readonly repository: PreferencesRepository;
}

export function OptionsApp(props: OptionsAppProps): JSX.Element {
  const { preferences, loading, setEnabled } = usePreferences(props);

  return (
    <main style={styles.main}>
      <h1>Arbiter — Options</h1>
      {loading ? (
        <p>Chargement…</p>
      ) : (
        <section>
          <label>
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => {
                void setEnabled(e.target.checked);
              }}
            />{' '}
            Activer l'affichage des badges
          </label>
          <p style={styles.muted}>
            Sites bloqués : {preferences.blockedSites.length === 0 ? 'aucun' : preferences.blockedSites.join(', ')}
          </p>
        </section>
      )}
      <footer style={styles.footer}>V1 ajoutera : compte, sync Firebase, liste blocklist éditable.</footer>
    </main>
  );
}

const styles = {
  main: {
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    maxWidth: 640,
    margin: '24px auto',
    padding: 16,
    color: '#111',
  },
  muted: { color: '#666', fontSize: 13 },
  footer: { marginTop: 32, fontSize: 12, color: '#999' },
} satisfies Record<string, React.CSSProperties>;
