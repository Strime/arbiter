const FLAG_SVGS: Record<string, string> = {
  FR: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="18" fill="#0055A4"/><rect x="8" width="8" height="18" fill="#fff"/><rect x="16" width="8" height="18" fill="#EF4135"/></svg>',
  IT: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="18" fill="#009246"/><rect x="8" width="8" height="18" fill="#fff"/><rect x="16" width="8" height="18" fill="#CE2B37"/></svg>',
  IE: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="18" fill="#169B62"/><rect x="8" width="8" height="18" fill="#fff"/><rect x="16" width="8" height="18" fill="#FF883E"/></svg>',
  BE: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="18" fill="#000"/><rect x="8" width="8" height="18" fill="#FAE042"/><rect x="16" width="8" height="18" fill="#ED2939"/></svg>',
  DE: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="6" fill="#000"/><rect y="6" width="24" height="6" fill="#DD0000"/><rect y="12" width="24" height="6" fill="#FFCE00"/></svg>',
  NL: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="6" fill="#AE1C28"/><rect y="6" width="24" height="6" fill="#fff"/><rect y="12" width="24" height="6" fill="#21468B"/></svg>',
  ES: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="4.5" fill="#AA151B"/><rect y="4.5" width="24" height="9" fill="#F1BF00"/><rect y="13.5" width="24" height="4.5" fill="#AA151B"/></svg>',
  PT: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="18" fill="#006600"/><rect x="10" width="14" height="18" fill="#FF0000"/><circle cx="10" cy="9" r="2.5" fill="#FFD700"/></svg>',
  AT: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#fff"/><rect width="24" height="6" fill="#ED2939"/><rect y="12" width="24" height="6" fill="#ED2939"/></svg>',
  PL: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="9" fill="#fff"/><rect y="9" width="24" height="9" fill="#DC143C"/></svg>',
  DK: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#C8102E"/><rect x="7" width="3" height="18" fill="#fff"/><rect y="7.5" width="24" height="3" fill="#fff"/></svg>',
  SE: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#006AA7"/><rect x="7" width="3" height="18" fill="#FECC00"/><rect y="7.5" width="24" height="3" fill="#FECC00"/></svg>',
  FI: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#fff"/><rect x="7" width="3" height="18" fill="#003580"/><rect y="7.5" width="24" height="3" fill="#003580"/></svg>',
  GR: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#fff"/><rect y="2" width="24" height="2" fill="#0D5EAF"/><rect y="6" width="24" height="2" fill="#0D5EAF"/><rect y="10" width="24" height="2" fill="#0D5EAF"/><rect y="14" width="24" height="2" fill="#0D5EAF"/><rect width="10" height="10" fill="#0D5EAF"/><rect x="3" y="1" width="4" height="8" fill="#fff"/><rect x="1" y="3" width="8" height="4" fill="#fff"/></svg>',
  CZ: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="9" fill="#fff"/><rect y="9" width="24" height="9" fill="#D7141A"/><path d="M0 0 L12 9 L0 18 Z" fill="#11457E"/></svg>',
  HU: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="6" fill="#CE2939"/><rect y="6" width="24" height="6" fill="#fff"/><rect y="12" width="24" height="6" fill="#477050"/></svg>',
  RO: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="8" height="18" fill="#002B7F"/><rect x="8" width="8" height="18" fill="#FCD116"/><rect x="16" width="8" height="18" fill="#CE1126"/></svg>',
  BG: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="6" fill="#fff"/><rect y="6" width="24" height="6" fill="#00966E"/><rect y="12" width="24" height="6" fill="#D62612"/></svg>',
  US: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#B22234"/><rect y="2" width="24" height="1.4" fill="#fff"/><rect y="5" width="24" height="1.4" fill="#fff"/><rect y="8" width="24" height="1.4" fill="#fff"/><rect y="11" width="24" height="1.4" fill="#fff"/><rect y="14" width="24" height="1.4" fill="#fff"/><rect width="10" height="9.7" fill="#3C3B6E"/></svg>',
  GB: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#012169"/><path d="M0 0 L24 18 M24 0 L0 18" stroke="#fff" stroke-width="3"/><path d="M0 0 L24 18 M24 0 L0 18" stroke="#C8102E" stroke-width="1.5"/><path d="M12 0 V18 M0 9 H24" stroke="#fff" stroke-width="4"/><path d="M12 0 V18 M0 9 H24" stroke="#C8102E" stroke-width="2"/></svg>',
  CH: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#DA291C"/><rect x="10" y="4" width="4" height="10" fill="#fff"/><rect x="7" y="7" width="10" height="4" fill="#fff"/></svg>',
  NO: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#BA0C2F"/><rect x="6" width="3" height="18" fill="#fff"/><rect y="7.5" width="24" height="3" fill="#fff"/><rect x="7" width="1" height="18" fill="#00205B"/><rect y="8.5" width="24" height="1" fill="#00205B"/></svg>',
  CN: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#DE2910"/><circle cx="5" cy="5" r="2" fill="#FFDE00"/></svg>',
  JP: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#fff"/><circle cx="12" cy="9" r="5.4" fill="#BC002D"/></svg>',
  CA: '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="6" height="18" fill="#FF0000"/><rect x="6" width="12" height="18" fill="#fff"/><rect x="18" width="6" height="18" fill="#FF0000"/><polygon points="12,5 13,8 15.5,7.5 13.5,10 14.5,12 12,11 9.5,12 10.5,10 8.5,7.5 11,8" fill="#FF0000"/></svg>',
};

function fallbackChip(code: string): string {
  const label = code.slice(0, 2).toUpperCase();
  return `<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#6b7280" rx="2"/><text x="12" y="13" text-anchor="middle" fill="#fff" font-size="10" font-family="sans-serif" font-weight="700">${label}</text></svg>`;
}

const UNKNOWN_FLAG_SVG =
  '<svg viewBox="0 0 24 18" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="18" fill="#9ca3af" rx="2"/><text x="12" y="13" text-anchor="middle" fill="#fff" font-size="11" font-family="sans-serif" font-weight="700">?</text></svg>';

export function flagSvgFor(country: string | undefined): string {
  if (!country) return UNKNOWN_FLAG_SVG;
  return FLAG_SVGS[country] ?? fallbackChip(country);
}
