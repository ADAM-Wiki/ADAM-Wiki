export interface SearchResult {
  id: string;
  title: string;
  type: 'category' | 'article' | 'page';
  url: string;
  excerpt?: string;
  snippet?: string;
  relevance: number;
}

export function normalizeForSearch(str: string): string {
  const refs: string[] = [];

  const normalizedDashes = str
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[:]\s*(\d+)\s*-\s*(\d+)/g, ':$1-$2');

  const protectedStr = normalizedDashes.replace(/\b\d+:\d+(?:-\d+)?\b/g, (match) => {
    const key = `quranrefplaceholder${refs.length}`;
    refs.push(match.toLowerCase());
    return ` ${key} `;
  });

  let normalized = protectedStr
    .toLowerCase()
    .replace(/\[([^\]]*)\]/g, '$1')
    .replace(/[-/_]/g, ' ')
    .replace(/dž/gi, 'dz')
    .replace(/đ/gi, 'd')
    .replace(/dj/gi, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s:]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  refs.forEach((ref, index) => {
    normalized = normalized.replace(`quranrefplaceholder${index}`, ref);
  });

  return normalized;
}

function expandArabicStyleQuery(query: string): string {
  return query
    .replace(/^(al|el|ibn|bin|abu|abd)(?=[a-z])/g, '$1 ')
    .replace(/([a-z])(al|el|ibn|bin|abu|abd)(?=[a-z])/g, '$1 $2 ');
}



function tokenizeForSearch(query: string): string[] {
  const normalized = normalizeForSearch(query);
  const referenceTokens = normalized.match(/\b\d+:\d+(?:-\d+)?\b/g) ?? [];

  const expanded = expandArabicStyleQuery(
    normalized.replace(/\b\d+:\d+(?:-\d+)?\b/g, ' ')
  );

  const base = expanded.split(/\s+/).filter(Boolean);
  const extra: string[] = [];

  for (const token of base) {
    if (
      (token.startsWith('al') ||
        token.startsWith('el') ||
        token.startsWith('ez') ||
        token.startsWith('az')) &&
      token.length > 2
    ) {
      extra.push(token.slice(2));
    }
    if (token.startsWith('ibn') && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith('bin') && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith('abu') && token.length > 3) extra.push(token.slice(3));
    if (token.startsWith('abd') && token.length > 3) extra.push(token.slice(3));
  }


  return [...new Set([...referenceTokens, ...base, ...extra])].filter(
    (token) => token.length >= 2
  );
}

export function getQueryTokens(query: string): string[] {
  return tokenizeForSearch(query);
}

export function getHighlightVariants(query: string): string[] {
  const tokens = tokenizeForSearch(query);
  const normalized = normalizeForSearch(query);
  const joinedTokens = tokens.join('');
  const spacedTokens = tokens.join(' ');
  const rawNoSpaces = normalized.replace(/\s+/g, '');

  return [...new Set([normalized, rawNoSpaces, joinedTokens, spacedTokens, ...tokens].filter(Boolean))];
}