const DIACRITICS = /[̀-ͯ]/g;
const NON_ALPHANUM = /[^a-z0-9]/g;

export const normalizeBrandKey = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(DIACRITICS, '').replace(NON_ALPHANUM, '');
