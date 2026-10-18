/**
 * Heading anchor ids - the ONE implementation of the contract that keeps
 * search results, TOC jumps and the search index pointing at the same DOM ids.
 *
 * Two sides derive ids from different text sources and must agree exactly:
 *
 *   - build time (scripts/lib/generate-category-meta.ts): reads the markdown
 *     heading line (`## Some heading`), stores the resulting id in the
 *     generated *Search.ts chunks - a search result links to `#<id>`
 *   - runtime (src/components/ArticlePage.tsx): reads the rendered DOM
 *     `textContent` of each h2/h3 and assigns `heading.id`
 *
 * Both sources agree only while headings are plain text. The characters
 * `[ < & {` (markdown links, HTML/JSX tags, entities, MDX expressions) render
 * into different text than the raw markdown line, so the two derivations would
 * silently diverge: the search index would carry an id the page never
 * assigns, and useScrollToHash would poll for a second and give up.
 * scripts/check-anchors.ts fails the build on any such heading.
 *
 * Only h2/h3 participate - the article table of contents is built from
 * querySelectorAll("h2, h3").
 *
 * The dedup suffix rule (first occurrence keeps the bare id, repeats get
 * -1, -2, ...) is part of the contract, not an implementation detail: four
 * hriscanstvo articles repeat headings like "Doktrinalni znacaj" three times
 * and their existing search-result anchors carry the suffixes. Do not change
 * the rule without accepting that every already-indexed link to those
 * headings retargets.
 */

/** Lowercase, strip diacritics, `đ` -> `dj`, hyphenate. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "dj")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Per-article id allocator: first occurrence of a slug keeps it bare, later
 * occurrences get `-1`, `-2`, ... Create ONE per article (fresh counter map).
 */
export function createHeadingIdAllocator(): (text: string) => string {
  const counts: Record<string, number> = {};

  return (text: string): string => {
    const base = slugify(text);
    const seen = counts[base] ?? 0;
    counts[base] = seen + 1;
    return seen === 0 ? base : `${base}-${seen}`;
  };
}
