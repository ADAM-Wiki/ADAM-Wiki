import { getQueryTokens } from "./searchShared";

export interface MatchRange {
  start: number;
  end: number;
}

/**
 * Per-character normalization used to line highlight matches up with the
 * original text. Mirrors the meaningful parts of normalizeForSearch (case,
 * diacritics, dž/đ) but works one character at a time so that a match found in
 * normalized space can be mapped back to a visual offset.
 */
function normalizeChar(char: string): string {
  const lowered = char.toLowerCase();
  const deDigraph = lowered === "đ" ? "d" : lowered;

  const stripped = deDigraph
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Keep only letters and digits: punctuation and whitespace never take part in
  // a match, and dropping them lets "al-Buhari" match the token "albuhari".
  return /[\p{L}\p{N}]/u.test(stripped) ? stripped : "";
}

interface NormalizedMap {
  /** The text with case, diacritics and punctuation removed. */
  compact: string;
  /** compact[i] originates from text[sourceIndex[i]]. */
  sourceIndex: number[];
}

/**
 * Built once per string rather than once per (word, token, character) as the
 * previous implementation did.
 */
function buildNormalizedMap(text: string): NormalizedMap {
  let compact = "";
  const sourceIndex: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const normalized = normalizeChar(text[i]);
    for (let k = 0; k < normalized.length; k++) {
      compact += normalized[k];
      sourceIndex.push(i);
    }
  }

  return { compact, sourceIndex };
}

function compactToken(token: string): string {
  let out = "";
  for (const char of token) out += normalizeChar(char);
  return out;
}

export function findMatchRanges(text: string, query: string): MatchRange[] {
  if (!text || !query.trim()) return [];

  const tokens = [
    ...new Set(getQueryTokens(query).map(compactToken).filter(Boolean)),
  ];
  if (!tokens.length) return [];

  const { compact, sourceIndex } = buildNormalizedMap(text);
  if (!compact) return [];

  const ranges: MatchRange[] = [];

  for (const token of tokens) {
    let from = 0;
    while (true) {
      const index = compact.indexOf(token, from);
      if (index === -1) break;

      ranges.push({
        start: sourceIndex[index],
        end: sourceIndex[index + token.length - 1] + 1,
      });

      from = index + token.length;
    }
  }

  if (!ranges.length) return [];

  ranges.sort((a, b) => a.start - b.start);

  const merged: MatchRange[] = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }

  return merged;
}

const HIGHLIGHT_CLASS =
  "bg-brand-accent/25 text-brand-accent rounded px-0.5 not-italic font-medium";

export function highlightText(text: string, query: string): React.ReactElement {
  const ranges = findMatchRanges(text, query);
  if (!ranges.length) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  ranges.forEach((range, index) => {
    if (range.start > lastIndex) {
      parts.push(
        <span key={`t-${index}`}>{text.slice(lastIndex, range.start)}</span>,
      );
    }

    parts.push(
      <mark key={`h-${index}`} className={HIGHLIGHT_CLASS}>
        {text.slice(range.start, range.end)}
      </mark>,
    );

    lastIndex = range.end;
  });

  if (lastIndex < text.length) {
    parts.push(<span key="t-end">{text.slice(lastIndex)}</span>);
  }

  return <>{parts}</>;
}
