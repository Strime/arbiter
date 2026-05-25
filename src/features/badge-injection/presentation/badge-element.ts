import type { OriginRegion } from '../../origin-detection/domain/entities/origin';
import type { OriginVerdict } from '../../origin-detection/domain/entities/origin-verdict';

const REGION_LABEL: Record<OriginRegion, string> = {
  FR: 'FR',
  EU: 'EU',
  US: 'US',
  OTHER: '?',
  UNKNOWN: '?',
};

const REGION_CLASS: Record<OriginRegion, string> = {
  FR: 'arbiter-badge--fr',
  EU: 'arbiter-badge--eu',
  US: 'arbiter-badge--us',
  OTHER: 'arbiter-badge--other',
  UNKNOWN: 'arbiter-badge--unknown',
};

function worstRegion(a: OriginRegion, b: OriginRegion): OriginRegion {
  const rank: Record<OriginRegion, number> = { FR: 0, EU: 1, OTHER: 2, US: 3, UNKNOWN: -1 };
  if (rank[a] === -1) return b;
  if (rank[b] === -1) return a;
  return rank[a] >= rank[b] ? a : b;
}

export function renderBadge(shadow: ShadowRoot, verdict: OriginVerdict): void {
  shadow.querySelectorAll('.arbiter-badge').forEach((n) => n.remove());

  const composite = worstRegion(verdict.brandRegion, verdict.manufacturingRegion);
  const badge = document.createElement('div');
  badge.className = `arbiter-badge ${REGION_CLASS[composite]}`;

  const brand = document.createElement('span');
  brand.className = 'arbiter-badge__brand';
  brand.textContent = `marque ${REGION_LABEL[verdict.brandRegion]}`;
  badge.appendChild(brand);

  const sep = document.createElement('span');
  sep.className = 'arbiter-badge__sep';
  sep.textContent = '·';
  badge.appendChild(sep);

  const manufacturing = document.createElement('span');
  manufacturing.className = 'arbiter-badge__manufacturing';
  manufacturing.textContent = `fab. ${REGION_LABEL[verdict.manufacturingRegion]}`;
  badge.appendChild(manufacturing);

  const tooltipParts: string[] = [];
  if (verdict.brand) {
    tooltipParts.push(`Marque : ${verdict.brand.country}${verdict.brand.parentCompany ? ` (${verdict.brand.parentCompany})` : ''}`);
  }
  if (verdict.manufacturing) {
    tooltipParts.push(`Fabrication : ${verdict.manufacturing.country} (source ${verdict.manufacturing.source})`);
  }
  if (tooltipParts.length > 0) {
    badge.title = tooltipParts.join('\n');
  }

  shadow.appendChild(badge);
}
