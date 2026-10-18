---
target: footer
total_score: 17
max_score: 36
na_heuristics: 9
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\ljack\\Desktop\\ProjekatAdam\\src\\components\\Footer.tsx"
target_fingerprint: "sha256:34f6ab6eead24107436c25734012a1bb077b712257baf7c17c7f8543be1d64bb"
target_path: "C:\\Users\\ljack\\Desktop\\ProjekatAdam\\src\\components\\Footer.tsx"
timestamp: 2026-10-12T22-12-18Z
slug: src-components-footer-tsx
---
Method: dual-agent (A: ses_ecdd4b6fdffeeJyW2RygO9BuBf · B: ses_ecdd4b6f8ffe0n3sHmf9Zar3AZ)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No aria-current/active bronze; identical on every route |
| 2 | Match System / Real World | 2 | "Legalno" translator-ese; ekavian "korišćenja" vs nav voice |
| 3 | User Control and Freedom | 2 | Logo smooth-scroll bypasses reduced-motion; no way back up |
| 4 | Consistency and Standards | 1 | Third wordmark style; 10px-bold-sans heads vs 12px-mono spec |
| 5 | Error Prevention | 3 | Correct externals + real Links; nothing destructive to guard |
| 6 | Recognition Rather Than Recall | 1 | /categories, /tags, /search, Kur'an offer all hidden |
| 7 | Flexibility and Efficiency | 2 | No dense-sitemap path for power users; tiny targets |
| 8 | Aesthetic and Minimalist Design | 3 | Clean but ~200px+ air for 5 links; long empty mobile scroll |
| 9 | Error Recovery | n/a | No form, search, or fallible action in footer |
| 10 | Help and Documentation | 1 | Finishing reader gets Kontakt + O Projektu, no citation/methodology bridge |
| **Total** | | **17/36** | **Poor** |

## Design Specificity Verdict

**LLM assessment:** Generic institutional footer wearing archive tokens. Palette, 1px rules, and the Bosnian tagline ("Arhiva naučnih dokaza i istraživanja posvećena istini u doba sumnje") gesture at the research archive, but nothing else speaks the Annotated Manuscript: sans-24 wordmark where DESIGN.md mandates serif, 10px-bold-sans heads where the Marginalia Rule requires 12px mono, hover-to-heading where bronze is the system's only interactive colour, zero diamonds, labels ("Legalno"/"Navigacija") that could belong to any CMS. The literal end of every long theology article reads as a law-office lobby. Coherence with DESIGN.md: tokens obeyed, typography/voice/marks ignored.

**Deterministic scan:** 4 advisories, one rule (`design-system-font-size`, all 10px off-ramp): section heads (lines 29, 50), copyright (69), socials (73; identical literals on 74-75 unreported — detector undercounts the repeat). No false positives; every hit verified in source. The scan independently confirms the core typographic finding: the footer's label tier lives outside the design system.

**Visual overlays:** No browser automation exposed; no injection attempted, no overlays. Fallback signal is static code reading only.

## Overall Impression

Correct plumbing (real links, landmarks, print:hidden, build-year copyright), wrong voice and wrong IA. A reader finishing a 15-minute article must climb ~100vh back to the nav to keep researching — on mobile, a full interaction restart. Biggest opportunity: an "Arhiva" column plus one continuation line turns the bureaucratic ending into a custodial one.

## What's Working

1. **Real `<Link>`s throughout** (Footer.tsx:1-7, documented rationale) — middle-click, crawlers, prerendered routes all work.
2. **Landmark semantics + print discipline** — two `<nav aria-label>`s, `<footer>` landmark, `print:hidden`; printed articles don't waste a page.
3. **Build-year copyright + correct externals** — no stale-year rot; `rel="noopener noreferrer"` on all three socials.

## Priority Issues

- **[P0] Footer hides the archive's primary routes; Read-mode dead-ends.** No /categories, /tags, /search, or Kur'an offer — only Kontakt + O Projektu. Fix: add "Arhiva" column (Kategorije, Tagovi, Pretraga, Besplatan Kur'an via KURAN_PATH import, never hardcoded). Suggested command: /impeccable layout
- **[P1] Typographic voice violates DESIGN.md.** Sans-24 wordmark, 10px-bold-sans heads, hover-to-heading; site now has three typographic authorities. Fix: serif wordmark, `font-mono text-xs` heads, `hover:text-brand-accent` everywhere, one bronze diamond at the colophon. Suggested command: /impeccable polish
- **[P1] Ekavian "korišćenja" against the nav's ijekavian voice.** Credibility nick at the trust-sensitive legal moment. Fix: "korištenja"; audit UsloviPage/KolaciciPage titles in the same edit. Suggested command: /impeccable clarify
- **[P2] No end-of-page continuation; peak-end wasted.** Highest-intent moment, lowest affordance density. Fix: ghost-button "Pretraži arhivu" + reduced-motion-respecting "Nazad na vrh" above the colophon rule. Suggested command: /impeccable layout
- **[P3] 10px social text-links are sub-24px targets shouting in caps.** Fix: `text-xs` + `py-2` hit-slop + `aria-label="ADAM na YouTubeu"` etc. + bronze hover. Suggested command: /impeccable audit

## Persona Red Flags

- **Jordan (efficient researcher):** most punished — every article-end forces scroll-to-top or hamburger reopen; no aria-current; footer learned as useless.
- **Riley (keyboard/low-vision):** `font-light` dim tagline plus 10px heads/links strain thresholds; two `<nav>` landmarks partially redeem.
- **Casey (mobile thumb):** `py-24 mb-20 gap-16` single-column stack is ~600px of air with 5 small links; 10px socials invite mis-taps; no big Pretraži/Vrh target.
- **Bosnian student finishing a theology article:** seeks cite/more-on-tag/who-wrote-this, finds ekavian legalese; trust built over 3,000 words leaks out in 5 links.

## Minor Observations

- `bg-brand-bg/50` adds nothing over solid grounds; the `border-t` already does the work.
- ALL-CAPS copyright with em-dash shouts in paper theme; quiet 12px mono would sit better.
- Logo smooth-scroll duplicates the `ScrollToTop` router mechanism; keep one, gate on reduced motion.
- "O Projektu" vs Navbar's "O nama" for the same /about destination — pick one.
- No `aria-current="page"` in footer or Navbar — site-wide gap the footer inherits.

## Questions to Consider

- Should the footer's final word be "SVA PRAVA ZADRŽANA" — or a quiet invitation to keep asking?
- What would this footer look like as a colophon (who keeps the archive, how to cite it, last revised) instead of a sitemap stub?
- If bronze is the only interactive colour and the footer uses zero bronze, is it telling readers nothing down here is worth interacting with?
