/**
 * Regression checks for the search pipeline.
 *
 * Covers the tokenizer guards (ordinary Bosnian words must not be mangled),
 * transliteration aliases, Quran-reference handling, highlight offset mapping
 * (including the dž/dj digraphs), and a smoke test of ranking over the real
 * generated corpus.
 *
 * Ranking policy (options, cutoff, exact-token bypass, grouping, relevance
 * formula) and the category corpus are IMPORTED from the production code
 * (src/utils/searchRanking.ts, src/utils/searchCorpus.ts) rather than
 * re-implemented here - the previous copy had already drifted from the
 * worker, which is what this file exists to prevent.
 *
 * Run with: npm run check:search
 */
import { findMatchRanges } from "../src/utils/highlight";
import MiniSearch from "minisearch";
import {
  getIndexTokens,
  getQueryTokens,
  normalizeForSearch,
} from "../src/utils/searchShared";
import {
  getMiniSearchOptions,
  filterHitsByRelevance,
  groupHitsByArticle,
  articleRelevance,
} from "../src/utils/searchRanking";
import { ARTICLE_SOURCES } from "../src/utils/searchCorpus";
import { isPlaceholderArticle } from "../src/lib/categoryArticles";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`}`,
  );
}
function checkTrue(label: string, actual: boolean) {
  check(label, actual, true);
}

console.log("=== tokenizer: index side must not mangle ordinary words ===");
for (const word of ["alat", "album", "elektron", "azil", "aleja", "element"]) {
  check(`index("${word}")`, getIndexTokens(word), [word]);
}

console.log("\n=== tokenizer: query side keeps name stripping ===");
checkTrue("query('albuhari') has 'buhari'", getQueryTokens("albuhari").includes("buhari"));
checkTrue("query('ibnabbas') has 'abbas'", getQueryTokens("ibnabbas").includes("abbas"));
checkTrue("query('alat') has NO 'at'", !getQueryTokens("alat").includes("at"));
checkTrue("query('normalizacija') is single token", getQueryTokens("normalizacija").length === 1);
checkTrue("query('kombinacija') is single token", getQueryTokens("kombinacija").length === 1);
checkTrue("query('album') has NO 'bum'", !getQueryTokens("album").includes("bum"));
checkTrue("query('azil') has NO 'il'", !getQueryTokens("azil").includes("il"));

console.log("\n=== aliases: surahs and names are live ===");
checkTrue("query('zilzal') has 'zalzalah'", getQueryTokens("zilzal").includes("zalzalah"));
checkTrue("query('ihlas') has 'ikhlas'", getQueryTokens("ihlas").includes("ikhlas"));
checkTrue("query('baqara') has 'baqarah'", getQueryTokens("baqara").includes("baqarah"));
checkTrue("query('muhammad') has 'muhammed'", getQueryTokens("muhammad").includes("muhammed"));
checkTrue("query('muhammed') has 'mohamed'", getQueryTokens("muhammed").includes("mohamed"));
checkTrue("query('quran') has 'kuran'", getQueryTokens("quran").includes("kuran"));
checkTrue("query('Kur'an') has 'quran'", getQueryTokens("Kur'an").includes("quran"));
checkTrue("query('hajj') has 'hadz'", getQueryTokens("hajj").includes("hadz"));
checkTrue("query('tawhid') has 'tevhid'", getQueryTokens("tawhid").includes("tevhid"));
// The alias table must not widen ordinary words into unrelated tokens.
checkTrue("query('album') has NO alias junk", getQueryTokens("album").length === 1);

console.log("\n=== normalization: quran refs and diacritics survive ===");
check("normalize('2:255')", normalizeForSearch("2:255"), "2:255");
check("normalize('2:255-256')", normalizeForSearch("2:255-256"), "2:255-256");
check("normalize('Hrišćanstvo')", normalizeForSearch("Hrišćanstvo"), "hriscanstvo");
check("normalize('hadždž')", normalizeForSearch("hadždž"), "hadzdz");
check("normalize('Bukhari')", normalizeForSearch("Bukhari"), "buhari");
check("normalize('Sahih al-Bukhari 114')", normalizeForSearch("Sahih al-Bukhari 114"), "sahih al buhari 114");
check("query('bukhari') == query('buhari')", getQueryTokens("bukhari"), getQueryTokens("buhari"));
check("index('bukhari') == index('buhari')", getIndexTokens("bukhari"), getIndexTokens("buhari"));
checkTrue("index('2:255') keeps the ref", getIndexTokens("ajet 2:255 kaze").includes("2:255"));

// ---------------------------------------------------------------- real index
type Doc = {
  id: string;
  articleId: string;
  title: string;
  content: string;
  tags: string;
};

const docs: Doc[] = [];
const titleById = new Map<string, string>();
const docById = new Map<string, Doc>();
const docTokensById = new Map<string, Set<string>>();

for (const { meta, search, basePath } of ARTICLE_SOURCES) {
  const bySlug = new Map(search.map((e) => [e.slug, e.chunks]));
  for (const a of meta) {
    // Mirrors the worker, which leaves scaffolding articles out of the index.
    if (isPlaceholderArticle(a)) continue;
    const articleId = `${basePath}::${a.slug}`;
    titleById.set(articleId, a.title);
    for (const [i, chunk] of (bySlug.get(a.slug) ?? []).entries()) {
      const id = `${articleId}::${i}`;
      const doc: Doc = {
        id,
        articleId,
        title: a.title,
        content: chunk.text,
        tags: a.tags?.join(" ") ?? "",
      };
      docs.push(doc);
      docById.set(id, doc);
    }
  }
}

const mini = new MiniSearch<Doc>({
  fields: ["title", "content", "tags"],
  storeFields: ["id", "articleId", "title"],
  tokenize: (t) => getIndexTokens(t),
});
mini.addAll(docs);

// Same lazy token sets as the worker's exact-token bypass.
function docTokens(id: string): ReadonlySet<string> | undefined {
  let cached = docTokensById.get(id);
  if (!cached) {
    const doc = docById.get(id);
    if (!doc) return undefined;
    cached = new Set(getIndexTokens(`${doc.title} ${doc.content} ${doc.tags}`));
    docTokensById.set(id, cached);
  }
  return cached;
}

console.log(`\n=== live index: ${docs.length} chunks, ${titleById.size} articles ===`);

function runQuery(query: string, limit = 5) {
  const tokens = getQueryTokens(query).filter((t) => t.length >= 2);
  if (!tokens.length) return [];

  const rankOptions = getMiniSearchOptions(query);
  // No `limit`: MiniSearch v7 removed the option (see searchRanking.ts).
  const hits = mini.search(tokens.join(" "), rankOptions);
  const kept = filterHitsByRelevance(hits, tokens, rankOptions, docTokens);

  const grouped = groupHitsByArticle(kept, (h) => h.articleId);

  return [...grouped.entries()]
    .map(([articleId, group]) => ({
      title: titleById.get(articleId) ?? articleId,
      relevance: articleRelevance(group.bestScore, group.chunkHits),
      chunks: group.chunkHits,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

console.log("\n=== ranking smoke: real queries over the full corpus ===");
for (const q of ["buhari", "isus", "hadis", "zilzal", "alat", "9:44", "kadijani", "evolucija", "al-buhari", "albuhari", "muhammed", "dječak"]) {
  const rows = runQuery(q);
  console.log(`\nquery "${q}" -> ${rows.length} results`);
  for (const r of rows) {
    console.log(
      `   ${r.relevance.toFixed(2).padStart(6)}  (${String(r.chunks).padStart(3)} chunks)  ${r.title.slice(0, 70)}`,
    );
  }
}

console.log("\n=== highlight ranges ===");
function hl(text: string, query: string): string {
  const ranges = findMatchRanges(text, query);
  let out = "";
  let last = 0;
  for (const r of ranges) {
    out += text.slice(last, r.start) + "[" + text.slice(r.start, r.end) + "]";
    last = r.end;
  }
  return out + text.slice(last);
}
check("highlight buhari", hl("Sahih al-Buhari zbirka", "buhari"), "Sahih al-[Buhari] zbirka");
check("highlight diacritics", hl("Hrišćanstvo i islam", "hriscanstvo"), "[Hrišćanstvo] i islam");
check("highlight across hyphen", hl("Sahih al-Buhari", "albuhari"), "Sahih [al-Buhari]");
check("highlight dz digraph", hl("hadždž je stub", "hadzdz"), "[hadždž] je stub");
// The index folds dj->d, so the highlighter must too, or "dječak" matched
// the index yet rendered no <mark>. Same for the single-codepoint dž (U+01C6).
// The range ends where the queried substring ends ("deca" -> "dječa|k").
check("highlight dj digraph", hl("dječak u hadisu", "deca"), "[dječa]k u hadisu");
// Full-word query maps the 5-char token back across the folded digraph to the
// whole source word.
check("highlight dj as typed", hl("dječak u hadisu", "djecak"), "[dječak] u hadisu");
check("highlight single-codepoint dž", hl("dženaza danas", "dzenaza"), "[dženaza] danas");
check("no match leaves text", hl("nesto drugo", "buhari"), "nesto drugo");
check("multiple hits", hl("hadis i hadis", "hadis"), "[hadis] i [hadis]");

console.log(
  `\n${failures === 0 ? "ALL ASSERTIONS PASSED" : `${failures} ASSERTION(S) FAILED`}`,
);
process.exit(failures === 0 ? 0 : 1);
