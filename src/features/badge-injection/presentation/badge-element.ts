import type { BrandOrigin } from '../../origin-detection/domain/entities/brand-origin';
import type { ManufacturingOrigin } from '../../origin-detection/domain/entities/manufacturing-origin';
import type { OriginRegion } from '../../origin-detection/domain/entities/origin';
import type { OriginVerdict } from '../../origin-detection/domain/entities/origin-verdict';
import { flagSvgFor } from './country-flags';
import { SOURCE_LABEL_FR, countryNameFr } from './country-names';

const REGION_CLASS: Record<OriginRegion, string> = {
  FR: 'arbiter-badge--fr',
  EU: 'arbiter-badge--eu',
  US: 'arbiter-badge--us',
  OTHER: 'arbiter-badge--other',
  UNKNOWN: 'arbiter-badge--unknown',
};

const LOW_CONFIDENCE_THRESHOLD = 0.5;

function worstRegion(a: OriginRegion, b: OriginRegion): OriginRegion {
  const rank: Record<OriginRegion, number> = { FR: 0, EU: 1, OTHER: 2, US: 3, UNKNOWN: -1 };
  if (rank[a] === -1) return b;
  if (rank[b] === -1) return a;
  return rank[a] >= rank[b] ? a : b;
}

function setFlagInto(host: HTMLElement, country: string | undefined): void {
  host.innerHTML = flagSvgFor(country);
}

function ariaLabel(verdict: OriginVerdict): string {
  const brand = verdict.brand ? countryNameFr(verdict.brand.country) : 'inconnue';
  const mfg = verdict.manufacturing ? countryNameFr(verdict.manufacturing.country) : 'inconnue';
  return `Marque ${brand}, fabrication ${mfg}`;
}

function renderSection(
  title: string,
  origin: BrandOrigin | ManufacturingOrigin | undefined,
  parentCompany: string | undefined,
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'arbiter-tooltip__section';

  const header = document.createElement('div');
  header.className = 'arbiter-tooltip__header';
  header.textContent = title;
  section.appendChild(header);

  if (!origin) {
    const unknown = document.createElement('div');
    unknown.className = 'arbiter-tooltip__unknown';
    unknown.textContent = 'Origine inconnue';
    section.appendChild(unknown);
    return section;
  }

  const country = document.createElement('div');
  country.className = 'arbiter-tooltip__country';
  const flag = document.createElement('span');
  flag.className = 'arbiter-tooltip__country-flag';
  setFlagInto(flag, origin.country);
  country.appendChild(flag);
  const name = document.createElement('span');
  name.textContent = countryNameFr(origin.country);
  country.appendChild(name);
  section.appendChild(country);

  if (parentCompany) {
    const parent = document.createElement('div');
    parent.className = 'arbiter-tooltip__parent';
    parent.textContent = parentCompany;
    section.appendChild(parent);
  }

  const confidenceWrap = document.createElement('div');
  confidenceWrap.className = 'arbiter-tooltip__confidence';
  const bar = document.createElement('div');
  bar.className = 'arbiter-tooltip__bar';
  const fill = document.createElement('div');
  const isLow = origin.confidence < LOW_CONFIDENCE_THRESHOLD;
  fill.className = isLow
    ? 'arbiter-tooltip__bar-fill arbiter-tooltip__bar-fill--low'
    : 'arbiter-tooltip__bar-fill';
  fill.style.width = `${Math.round(origin.confidence * 100)}%`;
  bar.appendChild(fill);
  confidenceWrap.appendChild(bar);
  const value = document.createElement('span');
  value.className = 'arbiter-tooltip__confidence-value';
  value.textContent = `${Math.round(origin.confidence * 100)} %`;
  confidenceWrap.appendChild(value);
  section.appendChild(confidenceWrap);

  if (isLow) {
    const estimated = document.createElement('div');
    estimated.className = 'arbiter-tooltip__estimated';
    estimated.textContent = 'estimation';
    section.appendChild(estimated);
  }

  const source = document.createElement('div');
  source.className = 'arbiter-tooltip__source';
  source.textContent = `source : ${SOURCE_LABEL_FR[origin.source]}`;
  section.appendChild(source);

  return section;
}

export function renderBadge(shadow: ShadowRoot, verdict: OriginVerdict): void {
  shadow.querySelectorAll('.arbiter-badge').forEach((n) => n.remove());

  const composite = worstRegion(verdict.brandRegion, verdict.manufacturingRegion);
  const badge = document.createElement('div');
  badge.className = `arbiter-badge ${REGION_CLASS[composite]}`;
  badge.tabIndex = 0;
  badge.setAttribute('role', 'img');
  badge.setAttribute('aria-label', ariaLabel(verdict));

  const brandFlag = document.createElement('span');
  brandFlag.className = 'arbiter-badge__flag';
  setFlagInto(brandFlag, verdict.brand?.country);
  badge.appendChild(brandFlag);

  const sep = document.createElement('span');
  sep.className = 'arbiter-badge__sep';
  sep.textContent = '▸';
  badge.appendChild(sep);

  const mfgFlag = document.createElement('span');
  mfgFlag.className = 'arbiter-badge__flag';
  setFlagInto(mfgFlag, verdict.manufacturing?.country);
  badge.appendChild(mfgFlag);

  const tooltip = document.createElement('div');
  tooltip.className = 'arbiter-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.appendChild(renderSection('Marque', verdict.brand, verdict.brand?.parentCompany));
  tooltip.appendChild(renderSection('Fabrication', verdict.manufacturing, undefined));
  badge.appendChild(tooltip);

  shadow.appendChild(badge);
}
