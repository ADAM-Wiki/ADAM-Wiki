export interface SearchResult {
  id: string;
  title: string;
  type: "category" | "article" | "page";
  url: string;
  excerpt?: string;
  snippet?: string;
  snippets?: string[];
  matchCount?: number;
  relevance: number;
}

export function normalizeForSearch(str: string): string {
  const refs: string[] = [];

  const normalizedDashes = str
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, "-")
    .replace(/[:]\s*(\d+)\s*-\s*(\d+)/g, ":$1-$2");

  const protectedStr = normalizedDashes.replace(
    /\b\d+:\d+(?:-\d+)?\b/g,
    (match) => {
      const key = `quranrefplaceholder${refs.length}`;
      refs.push(match.toLowerCase());
      return ` ${key} `;
    },
  );

  let normalized = protectedStr
    .toLowerCase()
    .replace(/\[([^\]]*)\]/g, "$1")
    .replace(/[-/_]/g, " ")
    .replace(/dž/gi, "dz")
    .replace(/đ/gi, "d")
    .replace(/dj/gi, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s:]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  refs.forEach((ref, index) => {
    normalized = normalized.replace(`quranrefplaceholder${index}`, ref);
  });

  return normalized;
}

/**
 * Article prefix particles ("al-Buhari", "ez-Zuhri"). As standalone tokens they
 * carry no signal and match almost every document, so they are dropped from
 * queries when something more specific is present.
 */
const ARABIC_PARTICLES = new Set(["al", "el", "ez", "az"]);

/** Prefixes worth stripping when a user types a name as one word ("albuhari"). */
const ATTACHED_PREFIXES = ["al", "el", "ez", "az"];
const NAME_PREFIXES = ["ibn", "bin", "abu", "abd"];

/**
 * A stripped remainder must be at least this long to be treated as a name.
 * Without this guard ordinary Bosnian vocabulary gets mangled:
 * "alat" -> "at", "album" -> "bum", "azil" -> "il", "elektron" -> "ektron".
 */
const MIN_STEM_LENGTH = 4;

const QURAN_REF = /\b\d+:\d+(?:-\d+)?\b/g;

/**
 * Tokenizer used when building the index.
 *
 * Deliberately conservative: it only normalizes and splits. Query-side
 * expansion (see getQueryTokens) is what bridges "albuhari" to "al buhari", so
 * doing it here too would bloat the index and create false matches.
 */
export function getIndexTokens(text: string): string[] {
  return normalizeForSearch(text)
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

/**
 * Adds the bare stem for a name typed as one word ("albuhari" -> "buhari",
 * "ibnalqayyim" -> "alqayyim" -> "qayyim"). The original token is always kept,
 * so this only ever widens a query.
 *
 * Stripping is refused when the remainder is short, which is what stops
 * ordinary vocabulary from being mangled: "alat" -> "at", "album" -> "bum".
 */
function stripPrefixes(token: string): string[] {
  const stems: string[] = [];
  let current = token;

  // Two passes cover the nested case ("ibn" + "al" + name).
  for (let pass = 0; pass < 2; pass++) {
    const stem = stripOnePrefix(current);
    if (!stem) break;
    stems.push(stem);
    current = stem;
  }

  return stems;
}

function stripOnePrefix(token: string): string | undefined {
  for (const prefix of [...NAME_PREFIXES, ...ATTACHED_PREFIXES]) {
    if (token.startsWith(prefix)) {
      const stem = token.slice(prefix.length);
      if (stem.length >= MIN_STEM_LENGTH) return stem;
    }
  }
  return undefined;
}

const SURAH_ALIAS_GROUPS: string[][] = [
  ["zilzal", "zalzal", "zalzalah", "zalzala"],
  ["baqara", "baqarah"],
  ["fatiha", "fatihah"],
  ["ikhlas", "ihlas"],
  ["yasin", "yaseen"],
  ["nisa", "nisaa"],
  ["maida", "maidah"],
  ["kahf", "kehf"],
  ["mulk", "mulq"],
];

/**
 * Query-time only: maps a surah name onto its common transliteration variants
 * so that "zilzal" also finds articles spelling it "zalzalah".
 */
function expandSurahAliases(tokens: string[]): string[] {
  const extra: string[] = [];

  for (const token of tokens) {
    const stripped = token.replace(/^(al|el|ez|az)/, "");

    for (const group of SURAH_ALIAS_GROUPS) {
      if (group.includes(token) || group.includes(stripped)) {
        extra.push(...group);
      }
    }
  }

  return [...new Set(extra)];
}

function tokenizeForSearch(query: string): string[] {
  const normalized = normalizeForSearch(query);
  const referenceTokens = normalized.match(QURAN_REF) ?? [];

  const base = normalized
    .replace(QURAN_REF, " ")
    .split(/\s+/)
    .filter(Boolean);

  const extra: string[] = [];
  for (const token of base) {
    extra.push(...stripPrefixes(token));
  }

  const aliasTokens = expandSurahAliases([...base, ...extra]);

  const all = [
    ...new Set([...referenceTokens, ...base, ...extra, ...aliasTokens]),
  ].filter((token) => token.length >= 2);

  // Drop bare particles, but never return an empty list for a query that is
  // literally just "al".
  const meaningful = all.filter((token) => !ARABIC_PARTICLES.has(token));
  return meaningful.length ? meaningful : all;
}

export function getQueryTokens(query: string): string[] {
  return tokenizeForSearch(query);
}

