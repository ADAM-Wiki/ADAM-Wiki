---
target: Sacuvaj kao PDF print PDF
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\ljack\\Desktop\\ProjekatAdam\\src\\components\\ArticleShare.tsx Sačuvaj kao PDF print PDF"
timestamp: 2026-10-15T19-55-27Z
slug: rticleshare-tsx-sa-uvaj-kao-pdf-print-pdf-296970e5
---
# Critique — Sačuvaj kao PDF / print PDF (ArticleShare + ArticlePage + print CSS)

## Method
Dual-agent assessment. A = design review of print artifact, B = detector + code evidence.

## Health
21/40 Acceptable. Plumbing is strong, document is under-designed.

## Heuristics
1. Visibility 2 — dialog detection good, PDF itself has no folio/date confirmation.
2. Real world 3 — real selectable text, sources carry URLs. No archive header.
3. Control 2 — one take-it-or-leave-it output, no density/source options.
4. Consistency 3 — break rules good; eyebrow/tags hidden breaks IA parity.
5. Error prevention 3 — excellent in-app-browser no-op detection.
6. Recognition 1 — TOC display:none with no print replacement.
7. Flexibility 1 — no batch/compact path; 1.9 line-height prints wasteful.
8. Aesthetic 3 — good ink discipline; max-width:none violates 65ch Measure Rule.
9. Error recovery 2 — fallback copy clear on screen, absent in PDF.
10. Help/docs 1 — no provenance/citation block in PDF though handleCite exists on screen.

## Specificity
LLM: Half-authored. Screen-suppression is bespoke (token override order, table unpin, scrollport unclip, scoped URL expansion, dual-signal print detection). Paper document is generic: bronze→#333, no masthead, no provenance, no print TOC, no folio.
Detector: 7 advisories, 0 errors. ArticlePage.tsx 11px x2 (305,315); index.css 1rem (42), 3px radius (506), grid bg (553), rgba white (637), #ffffff print bg (702). #ffffff is false positive in print context; 11px is caption step not defect; grid bg unrelated to print. No print-specific rule fired — entire @media print block (661-787) silent except #702.

## What's working
- Real-text-first: window.print() preserves selectable diacritics + shaped Arabic (ArticlePage.tsx:397-403). Correct archival call.
- Scoped URL expansion only in .mdx-izvori (index.css:782-786). Clean running text, resolvable sources.
- Dual-signal failure detection beforeprint + print MQ, 800ms, try/catch (ArticlePage.tsx:179-206). Turns FB/IG/TikTok no-op into diagnosed state.

## Priority issues
- P1 No provenance in artifact: eyebrow/tags hidden, no site/URL/accessed-date/citation in PDF. Offline citation breaks. Fix: hidden print:block block with ADAM wordmark + category + articleUrl + pristupljeno date, reuse handleCite string.
- P1/P2 Measure violation: .article-body max-width:none (index.css:722-724) → 95-110ch lines on A4. Fix: max-width 65ch / 150mm in print.
- P2 Navigation amputated: .article-toc display:none, no replacement. Fix: print-only compact TOC from tocItems.
- P2/P3 Copy over-promises: "Sačuvaj kao PDF" labels a print dialog. Fix: "Štampaj / Sačuvaj kao PDF" + title tooltip.

## Evidence gaps (B)
Handled: @page 18mm 16mm, theme→white/black override, TOC hide, layout block, padding zero, table overflow/static th, marker exact-adjust, break-after/avoid, scoped link expansion, 14x print:hidden (Navbar, Footer, BackToTop, Toc, Share root, PrevNext, eyebrow, tags, related, KuranPromo), page-rise kill.
Missing: no running header/folio/counter(page), no cover, no print TOC, no footnote print handling (↩ prints dead), no orphans/widows, no Arabic embed check, callout left-rules have no print-color-adjust (only .marker does), inline body links print bare, body::before not hidden (only ::after light variant).
Browser: skipped — no browser automation exposed. Code evidence only.

## Personas
- Theology student (offline citation): deal-breaker, no URL/date/citation in PDF.
- Casey (B&W laser/library): amber washes + gray accents dither; needs B&W pass.
- Sam/Casey mobile: full-width + no TOC + in-app no-print path = unreadable offline.

## Minor
- No @page size:A4, no folio; add orphans:3 widows:3; thead repeat; extend URL expansion to footnotes or confirm no externals there; hide body::before in print; print date+reading-time consistently (currently date prints, reading-time hidden).

## Questions
- Would a PDF found on USB be attributable to ADAM and citable?
- Why does paper — where navigation is harder — get no TOC?
- Is white+gray really ink-saving vs a true paper treatment?
