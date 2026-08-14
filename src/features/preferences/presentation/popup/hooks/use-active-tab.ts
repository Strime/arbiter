import { useCallback, useEffect, useState } from 'react';
import type { MessagingClient } from '../../../../../core/messaging/client';

export type ActiveTabStatus =
  | { readonly kind: 'loading' }
  | { readonly kind: 'unsupported' }
  | { readonly kind: 'supported'; readonly badgeCount: number };

interface UseActiveTabResult {
  readonly status: ActiveTabStatus;
  readonly refresh: () => void;
}

/**
 * Détecte si l'onglet actif est un drive supporté, via un aller-retour
 * GET_STATS vers le content script. Pas de récepteur → site non supporté.
 */
export function useActiveTab(messagingClient: MessagingClient): UseActiveTabResult {
  const [status, setStatus] = useState<ActiveTabStatus>({ kind: 'loading' });
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void detectActiveTab(messagingClient).then((next) => {
      if (!cancelled) setStatus(next);
    });
    return () => {
      cancelled = true;
    };
  }, [messagingClient, refreshToken]);

  return { status, refresh };
}

async function detectActiveTab(messagingClient: MessagingClient): Promise<ActiveTabStatus> {
  let tab;
  try {
    [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  } catch {
    return { kind: 'unsupported' };
  }
  // Sans la permission « tabs », tab.url n'est lisible que sur les hôtes
  // couverts par host_permissions : url absente → site non supporté.
  if (tab?.id === undefined || tab.url === undefined) {
    return { kind: 'unsupported' };
  }
  const stats = await messagingClient.requestTabStats(tab.id);
  if (!stats) return { kind: 'unsupported' };
  return { kind: 'supported', badgeCount: stats.badgeCount };
}
