import badgeStyles from './badge.css?inline';

const SHADOW_HOST_TAG = 'coquade-badge-host';
const SHADOW_HOST_MARKER = 'data-coquade-badge';

interface InjectedHost {
  readonly card: HTMLElement;
  readonly host: HTMLElement;
  readonly previousInlinePosition: string | null;
}

const injectedHosts = new Set<InjectedHost>();

/**
 * Nombre de badges actuellement rendus dans la page.
 * Les hôtes déconnectés (cartes retirées par la navigation SPA) sont exclus.
 */
export function countBadgeHosts(): number {
  let count = 0;
  for (const { host } of injectedHosts) {
    if (host.isConnected) count += 1;
  }
  return count;
}

export function removeAllBadgeHosts(): void {
  for (const { card, host, previousInlinePosition } of injectedHosts) {
    host.remove();
    if (previousInlinePosition !== null && card.style.position === 'relative') {
      if (previousInlinePosition === '') card.style.removeProperty('position');
      else card.style.position = previousInlinePosition;
    }
  }
  injectedHosts.clear();
}

export class ShadowHostFactory {
  ensureHost(card: HTMLElement): ShadowRoot {
    const existing = card.querySelector<HTMLElement>(`[${SHADOW_HOST_MARKER}]`);
    if (existing?.shadowRoot) {
      return existing.shadowRoot;
    }
    let previousInlinePosition: string | null = null;
    if (getComputedStyle(card).position === 'static') {
      previousInlinePosition = card.style.position;
      card.style.position = 'relative';
    }
    const host = document.createElement(SHADOW_HOST_TAG);
    host.setAttribute(SHADOW_HOST_MARKER, '');
    host.style.position = 'absolute';
    host.style.top = '0';
    host.style.right = '0';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'none';
    const shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = badgeStyles;
    shadow.appendChild(style);
    card.appendChild(host);
    injectedHosts.add({ card, host, previousInlinePosition });
    return shadow;
  }
}
