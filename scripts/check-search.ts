/**
 * Regression checks for the search pipeline.
 *
 * Covers the tokenizer guards (ordinary Bosnian words must not be mangled),
 * surah aliases, Quran-reference handling, highlight offset mapping, and a
 * smoke test of ranking over the real generated corpus.
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
import { hadisMeta } from "../src/lib/generated/hadisMeta";
import { hadisSearch } from "../src/lib/generated/hadisSearch";
import { opovrgavanjeMeta } from "../src/lib/generated/opovrgavanjeMeta";
import { opovrgavanjeSearch } from "../src/lib/generated/opovrgavanjeSearch";
import { ahmedijeMeta } from "../src/lib/generated/ahmedijeMeta";
import { ahmedijeSearch } from "../src/lib/generated/ahmedijeSearch";
import { ateizamMeta } from "../src/lib/generated/ateizamMeta";
import { ateizamSearch } from "../src/lib/generated/ateizamSearch";
import { hriscanstvoMeta } from "../src/lib/generated/hriscanstvoMeta";
import { hriscanstvoSearch } from "../src/lib/generated/hriscanstvoSearch";

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

console.log("\n=== tokenizer: surah aliases are live ===");
checkTrue("query('zilzal') has 'zalzalah'", getQueryTokens("zilzal").includes("zalzalah"));
checkTrue("query('ihlas') has 'ikhlas'", getQueryTokens("ihlas").includes("ikhlas"));
checkTrue("query('baqara') has 'baqarah'", getQueryTokens("baqara").includes("baqarah"));

console.log("\n=== normalization: quran refs and diacritics survive ===");
check("normalize('2:255')", normalizeForSearch("2:255"), "2:255");
check("normalize('2:255-256')", normalizeForSearch("2:255-256"), "2:255-256");
check("normalize('Hrišćanstvo')", normalizeForSearch("Hrišćanstvo"), "hriscanstvo");
check("normalize('hadždž')", normalizeForSearch("hadždž"), "hadzdz");
checkTrue("index('2:255') keeps the ref", getIndexTokens("ajet 2:255 kaze").includes("2:255"));

// ---------------------------------------------------------------- real index
const SOURCES = [
  { meta: hadisMeta, search: hadisSearch, base: "/categories/hadis/article" },
  { meta: opovrgavanjeMeta, search: opovrgavanjeSearch, base: "/categories/opovrgavanje/article" },
  { meta: ahmedijeMeta, search: ahmedijeSearch, base: "/categories/ahmedije/article" },
  { meta: ateizamMeta, search: ateizamSearch, base: "/categories/ateizam/article" },
  { meta: hriscanstvoMeta, search: hriscanstvoSearch, base: "/categories/hriscanstvo/article" },
];

type Doc = {
  id: string;
  articleId: string;
  title: string;
  content: string;
  tags: string;
};

const docs: Doc[] = [];
const titleById = new Map<string, string>();

for (const { meta, search, base } of SOURCES) {
  const bySlug = new Map(search.map((e) => [e.slug, e.chunks]));
  for (const a of meta) {
    const articleId = `${base}::${a.slug}`;
    titleById.set(articleId, a.title);
    for (const [i, chunk] of (bySlug.get(a.slug) ?? []).entries()) {
      docs.push({
        id: `${articleId}::${i}`,
        articleId,
        title: a.title,
        content: chunk,
        tags: a.tags.join(" "),
      });
    }
  }
}

const mini = new MiniSearch<Doc>({
  fields: ["title", "content", "tags"],
  storeFields: ["id", "articleId", "title"],
  tokenize: (t) => getIndexTokens(t),
});
mini.addAll(docs);

console.log(`\n=== live index: ${docs.length} chunks, ${titleById.size} articles ===`);

function runQuery(query: string, limit = 5) {
  const tokens = getQueryTokens(query).filter((t) => t.length >= 2);
  if (!tokens.length) return [];
  const normalized = normalizeForSearch(query);
  const longest = normalized.split(/\s+/).reduce((m, t) => Math.max(m, t.length), 0);
  const opts: any =
    longest <= 2
      ? { boost: { title: 5, tags: 3, content: 1 }, prefix: false, fuzzy: false }
      : longest <= 4
        ? { boost: { title: 5, tags: 3, content: 1 }, prefix: true, fuzzy: false }
        : { boost: { title: 4, tags: 2, content: 1 }, prefix: true, fuzzy: 0.2 };

  const hits = mini.search(tokens.join(" "), { ...opts, limit: 1000 });
  if (!hits.length) return [];

  const cutoff = hits[0].score * 0.3;
  const kept = hits.filter((h) => h.score >= cutoff);

  const grouped = new Map<string, { best: number; n: number }>();
  for (const h of kept) {
    const aid = (h as any).articleId as string;
    const g = grouped.get(aid);
    if (!g) grouped.set(aid, { best: h.score, n: 1 });
    else {
      g.n++;
      g.best = Math.max(g.best, h.score);
    }
  }

  return [...grouped.entries()]
    .map(([aid, g]) => ({
      title: titleById.get(aid) ?? aid,
      relevance: g.best + Math.log1p(g.n),
      chunks: g.n,
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

for (const q of ["buhari", "isus", "hadis", "zilzal", "alat", "9:44", "kadijani", "evolucija", "al-buhari", "albuhari"]) {
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
check("no match leaves text", hl("nesto drugo", "buhari"), "nesto drugo");
check("multiple hits", hl("hadis i hadis", "hadis"), "[hadis] i [hadis]");

console.log(
  `\n${failures === 0 ? "ALL ASSERTIONS PASSED" : `${failures} ASSERTION(S) FAILED`}`,
);
process.exit(failures === 0 ? 0 : 1);