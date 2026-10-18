# GLOSSARY

Domain terms for the ADAM — Research Database codebase. Add a term whenever a
new concept gets a name in the code; edit it when the meaning shifts.

## Category registry

**The one hand-written list of categories**: `CATEGORIES` in
`src/utils/categoriesData.ts` (13 entries, ids like `hadis`, `kuran`).

Everything else derives from it:

- the build generator (`npm run generate:meta`) emits per-category
  `<id>Meta.ts` / `<id>Search.ts` plus the registry-wide `metaIndex.ts`
  (listing data, main-bundle-safe) and `searchIndex.ts` (full text,
  worker-only)
- `src/App.tsx` builds one article route per entry via
  `import.meta.glob("./components/*ArticlePage.tsx")`
- `scripts/lib/routes.ts` builds sitemap + prerender routes from
  `META_BY_CATEGORY`

**Adding a category** = one registry entry + its content dir
(`src/content/articles/<id>/`) + one
`src/components/<Pascal(id)>ArticlePage.tsx`. `npm run check:registry` (wired
into `build`) fails the build if any derived artifact misses the entry — the
failure mode that once left `spisi`/`kuran` out of the sitemap.

## Article

An `.mdx` file under `src/content/articles/<categoryId>/`. Its frontmatter
(`meta` export) becomes listing metadata; its body becomes search chunks.

## Placeholder article

A scaffolding article (slug `test-clanak` or similar). Generated metadata keeps
them, but listings, counts and the sitemap filter them out via
`isPlaceholderArticle`. A category may be empty (no articles at all) — that is
legitimate scaffolding, not an error.

## Search chunk

~120 words of article text generated per heading section, carrying the
`headingId` a search result links to. Lives in `searchIndex.ts` /
`<id>Search.ts`; ~1.4 MB total, imported only by the search worker.
