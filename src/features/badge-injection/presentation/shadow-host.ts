import badgeStyles from './badge.css?inline';

const SHADOW_HOST_TAG = 'arbiter-badge-host';
const SHADOW_HOST_MARKER = 'data-arbiter-badge';

export class ShadowHostFactory {
  ensureHost(card: HTMLElement): ShadowRoot {
    const existing = card.querySelector<HTMLElement>(`[${SHADOW_HOST_MARKER}]`);
    if (existing?.shadowRoot) {
      return existing.shadowRoot;
    }
    if (getComputedStyle(card).position === 'static') {
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
    return shadow;
  }
}
