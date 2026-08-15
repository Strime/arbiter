import { buildReportMailtoUrl } from '../../../core/observer/support';
import type { BrandOrigin } from '../../origin-detection/domain/entities/brand-origin';
import type { ManufacturingOrigin } from '../../origin-detection/domain/entities/manufacturing-origin';
import type { OriginRegion } from '../../origin-detection/domain/entities/origin';
import type { OriginVerdict } from '../../origin-detection/domain/entities/origin-verdict';
import { flagElementFor } from './country-flags';
import { SOURCE_LABEL_FR, countryNameFr } from './country-names';

/** Infos produit nécessaires au lien « Signaler une erreur ». */
export interface BadgeProductInfo {
  readonly brand: string;
  readonly ean?: string;
}

const REGION_CLASS: Record<OriginRegion, string> = {
  FR: 'cocarde-badge--fr',
  EU: 'cocarde-badge--eu',
  US: 'cocarde-badge--us',
  OTHER: 'cocarde-badge--other',
  UNKNOWN: 'cocarde-badge--unknown',
};

const LOW_CONFIDENCE_THRESHOLD = 0.5;

function setFlagInto(host: HTMLElement, country: string | undefined): void {
  host.replaceChildren(flagElementFor(country));
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
  section.className = 'cocarde-tooltip__section';

  const header = document.createElement('div');
  header.className = 'cocarde-tooltip__header';
  header.textContent = title;
  section.appendChild(header);

  if (!origin) {
    const unknown = document.createElement('div');
    unknown.className = 'cocarde-tooltip__unknown';
    unknown.textContent = 'Origine inconnue';
    section.appendChild(unknown);
    return section;
  }

  const country = document.createElement('div');
  country.className = 'cocarde-tooltip__country';
  const flag = document.createElement('span');
  flag.className = 'cocarde-tooltip__country-flag';
  setFlagInto(flag, origin.country);
  country.appendChild(flag);
  const name = document.createElement('span');
  name.textContent = countryNameFr(origin.country);
  country.appendChild(name);
  section.appendChild(country);

  if (parentCompany) {
    const parent = document.createElement('div');
    parent.className = 'cocarde-tooltip__parent';
    parent.textContent = parentCompany;
    section.appendChild(parent);
  }

  const confidenceWrap = document.createElement('div');
  confidenceWrap.className = 'cocarde-tooltip__confidence';
  const bar = document.createElement('div');
  bar.className = 'cocarde-tooltip__bar';
  const fill = document.createElement('div');
  const isLow = origin.confidence < LOW_CONFIDENCE_THRESHOLD;
  fill.className = isLow
    ? 'cocarde-tooltip__bar-fill cocarde-tooltip__bar-fill--low'
    : 'cocarde-tooltip__bar-fill';
  fill.style.width = `${Math.round(origin.confidence * 100)}%`;
  bar.appendChild(fill);
  confidenceWrap.appendChild(bar);
  const value = document.createElement('span');
  value.className = 'cocarde-tooltip__confidence-value';
  value.textContent = `${Math.round(origin.confidence * 100)} %`;
  confidenceWrap.appendChild(value);
  section.appendChild(confidenceWrap);

  if (isLow) {
    const estimated = document.createElement('div');
    estimated.className = 'cocarde-tooltip__estimated';
    estimated.textContent = 'estimation';
    section.appendChild(estimated);
  }

  const source = document.createElement('div');
  source.className = 'cocarde-tooltip__source';
  source.textContent = `source : ${SOURCE_LABEL_FR[origin.source]}`;
  section.appendChild(source);

  return section;
}

const OPEN_CLASS = 'cocarde-badge--open';

let tooltipIdCounter = 0;

function renderReportLink(verdict: OriginVerdict, product: BadgeProductInfo): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'cocarde-tooltip__report';
  link.href = buildReportMailtoUrl({
    brand: product.brand,
    ean: product.ean,
    displayedVerdict: ariaLabel(verdict),
  });
  link.textContent = 'Signaler une erreur';
  return link;
}

export function renderBadge(shadow: ShadowRoot, verdict: OriginVerdict, product: BadgeProductInfo): void {
  shadow.querySelectorAll('.cocarde-badge').forEach((n) => n.remove());

  const badge = document.createElement('div');
  badge.className = `cocarde-badge ${REGION_CLASS[verdict.brandRegion]}`;
  badge.tabIndex = 0;
  badge.setAttribute('role', 'img');
  badge.setAttribute('aria-label', ariaLabel(verdict));

  const brandFlag = document.createElement('span');
  brandFlag.className = 'cocarde-badge__flag';
  setFlagInto(brandFlag, verdict.brand?.country);
  badge.appendChild(brandFlag);

  const tooltip = document.createElement('div');
  tooltip.className = 'cocarde-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.id = `cocarde-tooltip-${++tooltipIdCounter}`;
  badge.setAttribute('aria-describedby', tooltip.id);
  tooltip.appendChild(renderSection('Marque', verdict.brand, verdict.brand?.parentCompany));
  tooltip.appendChild(renderSection('Fabrication', verdict.manufacturing, undefined));
  tooltip.appendChild(renderReportLink(verdict, product));
  badge.appendChild(tooltip);

  // Toggle au clic/tap (tactile), en plus du hover/focus gérés en CSS.
  // stopPropagation/preventDefault : la carte produit est souvent un lien.
  badge.addEventListener('click', (event) => {
    if (event.target instanceof Node && tooltip.contains(event.target)) {
      // Clic sur le lien de signalement : laisser le mailto se déclencher,
      // sans naviguer vers la fiche produit.
      event.stopPropagation();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    badge.classList.toggle(OPEN_CLASS);
  });

  badge.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    badge.classList.remove(OPEN_CLASS);
    badge.blur();
  });

  shadow.appendChild(badge);
}
