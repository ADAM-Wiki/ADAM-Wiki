---
target: article page /article/..
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\ljack\\Desktop\\ProjekatAdam\\src\\components\\ArticlePage.tsx"
target_fingerprint: "sha256:d8280f2dffd59950704b8306a7162797d2f475bc8b49f63517f6dc7807a9e2db"
target_path: "C:\\Users\\ljack\\Desktop\\ProjekatAdam\\src\\components\\ArticlePage.tsx"
timestamp: 2026-10-12T20-30-29Z
slug: src-components-articlepage-tsx
---
Method: dual-agent (A: ses_ece330d9fffeH6Z7xEyhF2DSFj · B: ses_ece330d9dffeqnWfo7Pp2qSvgi)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Active TOC + copy feedback solid; no reading progress on long articles |
| 2 | Match System / Real World | 3 | Bosnian manuscript voice good; "SLIČNO" label is system-speak |
| 3 | User Control and Freedom | 3 | TOC/lightbox exits good; related-card smooth-scroll fights restoration |
| 4 | Consistency and Standards | 3 | Patterns repeat well; Prethodni/Sledeći = newer/older is inverted |
| 5 | Error Prevention | 3 | Heading-slug guard, lightbox clamping good; print failure only detected after the fact |
| 6 | Recognition Rather Than Recall | 2 | Mobile TOC hidden behind pill; zero-H2 articles show no orientation at all |
| 7 | Flexibility and Efficiency | 2 | No heading anchor links; no TOC/search shortcut; can't grab section URL |
| 8 | Aesthetic and Minimalist Design | 3 | Header spare; end-of-article stacks 3 equal "what next?" bands |
| 9 | Error Recovery | 3 | Print notice names recovery; clipboard failure silent with no fallback |
| 10 | Help and Documentation | 2 | No "cite this article"; 6 callout ink colors unexplained on first encounter |
| **Total** | | **27/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Authored for this product, strongly. Mono eyebrow → serif H1 → mono meta row enforces the Marginalia Rule; numbered TOC with Arabic-Indic numerals + diamond sub-markers is a signature component, not stock; the print-to-real-text-PDF path with in-app-browser failure detection is field knowledge for a theology archive. Coherence to DESIGN.md tokens, 1px rules, flat document is high. Missed character: the header is correct but thin — no summary/abstract block, no category rubric beyond the eyebrow, identical header for 1,500- and 10,000-word articles. The "SLIČNO / Povezani članci" double-title reads as two competing headings.

**Deterministic scan:** 4 advisory findings on ArticlePage.tsx (11px meta row x3 at lines 308/316/330, 10px related tags at 451), +8 more on expanded scope (ArticleToc, ArticlePrevNext, index.css radius/color). All 4 on the target are intentional uppercase micro-labels, not body text — assessed as false positives against a type ramp built from body/heading steps. No slop/generated-UI hits. Expanded-scope index.css color/radius hits (print #ffffff, 3px radius) are print-context values, also non-blocking.

**Visual overlays:** No browser automation exposed in this session; no injection attempted, no overlays visible. Fallback signal is static code reading only.

## Overall Impression

Calm, authoritative arrival; unhurried but featureless middle on very long reads; diluted ending. Trust mechanics (real-text PDF, stable heading IDs, focus rings, reduced motion) are excellent; scholarly reassurance (sources-up-front, citation helper, version stamp) is missing. Biggest opportunity: give researchers section-level anchors + citation, and collapse the triple end-band into one ranked "continue" moment.

## What's Working

1. **Print/PDF path is genuinely excellent** (ArticlePage.tsx:334-372 + index.css @media print). Real selectable text with diacritics/Arabic intact, ink-saving token swap, TOC/table fixes, in-app-browser failure notice. Most templates punt on print; this treats paper as a second product.
2. **TOC dual-surface with unusual care** (ArticleToc.tsx). Sticky margin column without page yank, smooth-scroll stand-down, Arabic-Indic numbering, aria-current, focus trap + Escape + scroll lock. Every line earned its place.
3. **Reader-trust microdecisions.** Reading time from live word count, line-clamp-2 + title instead of char truncation, lightbox zoom-around-cursor so the Arabic word under the pointer stays put.

## Priority Issues

- **[P1] No section-anchor affordance; deep-linking is TOC-only.** Researchers cite sections but hovering an H2 offers no link/copy. Fix: hover/focus-revealed # anchor button in H2/H3 renderer copying full URL+hash. Suggested command: /impeccable harden
- **[P1] End-of-article triple-band (share 5 buttons + prev/next 2 cards + related 3 cards).** Three "what next?" bands with identical card chrome; tag-match ranking invisible. Fix: demote share to text-links (keep copy-link as sole button), merge prev/next+related into one "Nastavi čitanje" with a single "Najsličniji" primary. Suggested command: /impeccable layout
- **[P2] Meta row overload: date · reading time · word count · PDF at equal weight.** Reading time + word count duplicate one signal; row wraps to 2-3 lines at 360px. Fix: keep date + reading time, drop word count to title tooltip, move PDF into share row. Suggested command: /impeccable distill
- **[P2] Empty-TOC articles have no orientation fallback.** ArticleToc returns null on zero H2/H3; short dense articles get nothing between title and body. Fix: render description as diamond-marked summary block when tocItems is empty. Suggested command: /impeccable polish
- **[P3] Prethodni/Sledeći chronology is list-order, unlabeled.** Previous = newer with no noviji/stariji cue. Fix: relabel or add "N od M u kategoriji" position. Suggested command: /impeccable clarify

## Persona Red Flags

- **Sam (screen-reader/keyboard):** TOC gives aria-current but no "odjeljak 3 od 9" position; lightbox % live-region announces every pinch frame; prev/next nav labelled vaguely. Add aria-setsize/posinset + sr-only counter, throttle live region, name the category.
- **Casey (distracted mobile):** Floating Sadržaj pill + back-to-top + promo triple-stack in thumb zone; related-card onClick forces smooth scrollTo which reads as lag on janky devices — use instant scroll on route change; pill should show current activeHeading (~24ch) as position readout.
- **Bosnian student, 8,000-word theology on a phone on the bus:** After 15 min scrolling, "where am I in the argument?" is unanswerable without opening the sheet — no sticky mini-header with current section. Same pill-as-readout fix covers it.

## Minor Observations

- SLIČNO eyebrow + Povezani članci H2 duplication — pick one voice.
- Related-card #tag spans look clickable but are spans; link them or drop to plain dim text.
- formatDate uses sr-Latn-RS; bs-Latn-BA would state intent (output likely identical).
- 200 wpm reading speed optimistic for theological prose with Arabic; 160-170 wpm more honest.
- Body radial bronze glow technically violates no-gloss Don't; ambient and sub-8% — deserves one-line DESIGN.md exemption note.
- Duplicate @media (hover:hover) TOC blocks in index.css — merge on next touch.

## Questions to Consider

- Where is the manuscript in this manuscript — should sources/footnotes live in the margin on xl screens instead of only the TOC?
- If this is a research database, why do share buttons precede citations — should FootnoteList/Izvori come first with a "Citiraj ovaj članak" action?
- What does N REČI prove to a reader deciding whether to trust the argument — would "N izvora · M fusnota · ažurirano …" earn trust faster?
