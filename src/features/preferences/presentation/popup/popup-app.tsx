import type { JSX } from 'react';
import { usePreferences } from './hooks/use-preferences';
import type { GetPreferences } from '../../domain/use-cases/get-preferences';
import type { UpdatePreferences } from '../../domain/use-cases/update-preferences';
import type { PreferencesRepository } from '../../domain/repositories/preferences-repository';

interface PopupAppProps {
  readonly getPreferences: GetPreferences;
  readonly updatePreferences: UpdatePreferences;
  readonly repository: PreferencesRepository;
}

export function PopupApp(props: PopupAppProps): JSX.Element {
  const { preferences, loading, setEnabled } = usePreferences(props);

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>Arbiter</h1>
      <p style={styles.subtitle}>Origine des produits sur le drive</p>
      {loading ? (
        <p style={styles.muted}>Chargement…</p>
      ) : (
        <label style={styles.toggleRow}>
          <input
            type="checkbox"
            checked={preferences.enabled}
            onChange={(e) => {
              void setEnabled(e.target.checked);
            }}
          />
          <span>{preferences.enabled ? 'Actif' : 'Désactivé'}</span>
        </label>
      )}
      <footer style={styles.footer}>v0 — local only</footer>
    </main>
  );
}

const styles = {
  main: {
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    width: 240,
    padding: 16,
    color: '#111',
  },
  title: { margin: 0, fontSize: 18, fontWeight: 600 },
  subtitle: { margin: '4px 0 16px', fontSize: 12, color: '#555' },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    cursor: 'pointer',
  },
  muted: { color: '#888', fontSize: 13 },
  footer: { marginTop: 16, fontSize: 10, color: '#999' },
} satisfies Record<string, React.CSSProperties>;
