const FRENCH_ARTICLES = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'l']);

export function guessBrandFromTitle(title: string): string | null {
  const firstToken = title.split(/\s+/)[0] ?? '';
  if (firstToken.length < 3) return null;
  if (FRENCH_ARTICLES.has(firstToken.toLowerCase())) return null;
  return firstToken;
}
