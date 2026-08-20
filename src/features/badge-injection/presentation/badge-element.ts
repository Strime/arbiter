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
  FR: 'coquade-badge--fr',
  EU: 'coquade-badge--eu',
  US: 'coquade-badge--us',
  OTHER: 'coquade-badge--other',
  UNKNOWN: 'coquade-badge--unknown',
};

const LOW_CONFIDENCE_THRESHOLD = 0.5;

function setFlagInto(host: HTMLElement, country: string | undefined): void {
  host.replaceChildren(flagElementFor(country));
}

function ariaLabel(verdict: OriginVerdict): string {
  const brand = verdict.brand ? countryNameFr(verdict.brand.country) : 'inconnue';
  const mfg = verdict.manufacturing ? countryNameFr(verdict.manufacturing.country) : 'inconnue';
  const owner = verdict.brand?.parentCountry
    ? `, détenue par ${verdict.brand.parentCompany ?? 'un groupe'} (${countryNameFr(verdict.brand.parentCountry)})`
    : '';
  return `Marque ${brand}${owner}, fabrication ${mfg}`;
}

/** Actionnariat de la marque : nom du groupe et/ou pays du propriétaire ultime. */
interface OwnershipInfo {
  readonly company?: string;
  readonly country?: string;
}

// Marqueur « capital étranger » sur la pastille : marque FR/EU dont le
// propriétaire ultime est hors UE. Une détention intra-UE n'est signalée que
// dans le tooltip.
function hasForeignOwnership(verdict: OriginVerdict): boolean {
  return (
    (verdict.brandRegion === 'FR' || verdict.brandRegion === 'EU') &&
    (verdict.ownershipRegion === 'US' || verdict.ownershipRegion === 'OTHER')
  );
}

function renderSection(
  title: string,
  origin: BrandOrigin | ManufacturingOrigin | undefined,
  ownership: OwnershipInfo | undefined,
): HTMLElement {
  const section = document.createElement('section');
  section.className = 'coquade-tooltip__section';

  const header = document.createElement('div');
  header.className = 'coquade-tooltip__header';
  header.textContent = title;
  section.appendChild(header);

  if (!origin) {
    const unknown = document.createElement('div');
    unknown.className = 'coquade-tooltip__unknown';
    unknown.textContent = 'Origine inconnue';
    section.appendChild(unknown);
    return section;
  }

  const country = document.createElement('div');
  country.className = 'coquade-tooltip__country';
  const flag = document.createElement('span');
  flag.className = 'coquade-tooltip__country-flag';
  setFlagInto(flag, origin.country);
  country.appendChild(flag);
  const name = document.createElement('span');
  name.textContent = countryNameFr(origin.country);
  country.appendChild(name);
  section.appendChild(country);

  if (ownership && (ownership.company || ownership.country)) {
    const parent = document.createElement('div');
    parent.className = 'coquade-tooltip__parent';
    if (ownership.country) {
      const parentFlag = document.createElement('span');
      parentFlag.className = 'coquade-tooltip__parent-flag';
      setFlagInto(parentFlag, ownership.country);
      parent.appendChild(parentFlag);
    }
    const label = document.createElement('span');
    label.textContent = ownership.company
      ? `Détenue par ${ownership.company}`
      : `Groupe propriétaire : ${countryNameFr(ownership.country)}`;
    parent.appendChild(label);
    section.appendChild(parent);
  }

  const confidenceWrap = document.createElement('div');
  confidenceWrap.className = 'coquade-tooltip__confidence';
  const bar = document.createElement('div');
  bar.className = 'coquade-tooltip__bar';
  const fill = document.createElement('div');
  const isLow = origin.confidence < LOW_CONFIDENCE_THRESHOLD;
  fill.className = isLow
    ? 'coquade-tooltip__bar-fill coquade-tooltip__bar-fill--low'
    : 'coquade-tooltip__bar-fill';
  fill.style.width = `${Math.round(origin.confidence * 100)}%`;
  bar.appendChild(fill);
  confidenceWrap.appendChild(bar);
  const value = document.createElement('span');
  value.className = 'coquade-tooltip__confidence-value';
  value.textContent = `${Math.round(origin.confidence * 100)} %`;
  confidenceWrap.appendChild(value);
  section.appendChild(confidenceWrap);

  if (isLow) {
    const estimated = document.createElement('div');
    estimated.className = 'coquade-tooltip__estimated';
    estimated.textContent = 'estimation';
    section.appendChild(estimated);
  }

  const source = document.createElement('div');
  source.className = 'coquade-tooltip__source';
  source.textContent = `source : ${SOURCE_LABEL_FR[origin.source]}`;
  section.appendChild(source);

  return section;
}

const OPEN_CLASS = 'coquade-badge--open';

let tooltipIdCounter = 0;

function renderReportLink(verdict: OriginVerdict, product: BadgeProductInfo): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'coquade-tooltip__report';
  link.href = buildReportMailtoUrl({
    brand: product.brand,
    ean: product.ean,
    displayedVerdict: ariaLabel(verdict),
  });
  link.textContent = 'Signaler une erreur';
  return link;
}

export function renderBadge(shadow: ShadowRoot, verdict: OriginVerdict, product: BadgeProductInfo): void {
  shadow.querySelectorAll('.coquade-badge').forEach((n) => n.remove());

  const badge = document.createElement('div');
  badge.className = `coquade-badge ${REGION_CLASS[verdict.brandRegion]}`;
  badge.tabIndex = 0;
  badge.setAttribute('role', 'img');
  badge.setAttribute('aria-label', ariaLabel(verdict));

  const brandFlag = document.createElement('span');
  brandFlag.className = 'coquade-badge__flag';
  setFlagInto(brandFlag, verdict.brand?.country);
  badge.appendChild(brandFlag);

  if (hasForeignOwnership(verdict)) {
    const sep = document.createElement('span');
    sep.className = 'coquade-badge__sep';
    sep.textContent = '·';
    badge.appendChild(sep);
    const ownerFlag = document.createElement('span');
    ownerFlag.className = 'coquade-badge__owner-flag';
    setFlagInto(ownerFlag, verdict.brand?.parentCountry);
    badge.appendChild(ownerFlag);
  }

  const tooltip = document.createElement('div');
  tooltip.className = 'coquade-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.id = `coquade-tooltip-${++tooltipIdCounter}`;
  badge.setAttribute('aria-describedby', tooltip.id);
  tooltip.appendChild(
    renderSection('Marque', verdict.brand, {
      company: verdict.brand?.parentCompany,
      country: verdict.brand?.parentCountry,
    }),
  );
  tooltip.appendChild(renderSection('Fabrication', verdict.manufacturing, undefined));
  tooltip.appendChild(renderReportLink(verdict, product));
  badge.appendChild(tooltip);

  // Capture sur document : les sites qui stoppent la propagation du clic
  // n'empêchent pas la fermeture. S'auto-détache une fois fermé (et donc
  // aussi au premier clic suivant si la pastille a été retirée du DOM).
  const closeOnOutsideClick = (event: Event): void => {
    if (event.composedPath().includes(badge)) return;
    close();
  };

  function close(): void {
    badge.classList.remove(OPEN_CLASS);
    // Sans blur, :focus-within maintiendrait le tooltip visible.
    badge.blur();
    document.removeEventListener('click', closeOnOutsideClick, true);
  }

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
    if (badge.classList.contains(OPEN_CLASS)) {
      close();
    } else {
      badge.classList.add(OPEN_CLASS);
      document.addEventListener('click', closeOnOutsideClick, true);
    }
  });

  badge.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    close();
  });

  shadow.appendChild(badge);
}
