# Hyperframes Composition Brief: Adam-Wiki

## Objective
Create a short launch-style brag video for Adam-Wiki (ADAM — Research Database), a Bosnian/Serbian research archive on Quran, hadith and comparative religion.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20.5s (must stay within 15–25s)

## Source Material
- Project root: `C:\Users\ljack\Desktop\ProjekatAdam`
- Primary files read: `index.html`, `src/index.css` (`@theme` tokens), `DESIGN.md`, `src/components/Hero.tsx`, `src/components/TopicsGrid.tsx`, `src/components/SearchPage.tsx`, `src/components/Navbar.tsx`, `src/utils/categoriesData.ts`, `src/utils/siteConfig.ts`, `src/App.tsx`
- Product name: Adam-Wiki (wordmark rendered as `ADAM`)
- Tagline / strongest claim: `Uspostavljanje Istine kroz dokaze` + `…izgrađena za tragaoce za istinom u doba organizovane sumnje.`
- Key UI or visual moment to recreate: the hero search field (placeholder `npr. Meka i Jesrib u Bibliji`, button `Pretraži članke`) resolving into the search results view with the bronze-highlighted match and the `Pronađeno u tekstu` preview panel; secondarily the home-page category card grid with real per-category counts.
- Copy that must appear verbatim:
  - `NAUČNA BAZA ZNANJA` (mono eyebrow, uppercase, ruled both sides)
  - `Uspostavljanje` / `Istine` (bronze italic) / `kroz dokaze`
  - `204 članka · 8 kategorija`
  - `npr. Meka i Jesrib u Bibliji` (placeholder) and `Pretraži članke` (button)
  - `Pronađeno u tekstu`
  - `u doba organizovane sumnje.`
  - `ADAM` and `adam-wiki.github.io/ADAM-Wiki`
- Result row content (real, from `src/lib/generated/spisiMeta.ts`): eyebrow `SPISI`, title `Meka i Jesrib u Bibliji`, snippet `Postanje 10:30 i naziv Mesa, prevod iz Njukasla iz 1811. koji donosi Meka i Medina…`
- Category cards (real counts, home-page order): `KURAN 55`, `ISTORIJA 41`, `ATEIZAM 40`, `OPORGOVANJE 24`, `SPISI 18`, `AHMEDIJE 11`, `HADISKE NAUKE 9`, `HRIŠĆANSTVO 6`
- Section label as on the site: `01` + `PREGLEDAJ KATEGORIJE`

## Creative Direction
- Tone preset: polished
- Creative direction: illuminated manuscript meets research archive — quiet premium product film
- Interpretation: 4 scenes, long holds, soft slides and crossfades; bronze is the only bright colour on screen; music is a warm bed; SFX are polite and few; nothing flashes.
- Angle: the archive brags in its own words. The video plays the site completely straight and ends on the site's own best clause.
- Hook: serif `Uspostavljanje Istine kroz dokaze` slamming into a near-black frame over the giant 7%-opacity `Å` watermark, search field rising underneath.
- Outro / punchline: `„u doba organizovane sumnje."` alone on screen, then the `ADAM` wordmark + URL.
- Avoid:
  - Generic SaaS language ("streamline", "unlock", "supercharge") — none of it, ever
  - Abstract filler — every scene contains real site copy, real counts or real UI
  - An unrelated visual redesign — the composition is the site's own dark/bronze system

## Visual Identity
- Background: `#11100d` (lampblack); surfaces `#1b1714`, field `#161310`, hover `#261f1c`
- Text: `#f4efe6` heading, `#e7dfd4` body, `#b7ac98` dim; rules `#3a312b`, strong rules `#5a4a3d`
- Accent: `#c7a16a` (antique bronze), on-accent `#1a140f`; highlight treatment = bronze at 25% over surface with `#c7a16a` text
- Display font: Cormorant Garamond (serif) for all headings, italic for emphasis; fallback `Playfair Display, Georgia, serif`
- Body/UI font: Inter for UI text; `ui-monospace` uppercase with `letter-spacing: 0.2em+` for labels and counts
- Visual references from the project: the giant `Å` hero watermark at 7% opacity with a radial mask; the ruled mono eyebrow; bronze italic emphasis word; rounded-2xl search field with a leading bronze magnifier; the 4-column rounded category cards with a mono count on the right; fixed top navbar with `ADAM` wordmark left and nav items `TAGOVI · KATEGORIJE · O NAMA · KONTAKT · BESPLATAN KUR'AN`

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. Hero headline — 4.0s (0.0–4.0) — ruled eyebrow `NAUČNA BAZA ZNANJA`, serif headline `Uspostavljanje Istine kroz dokaze`, search field rising, `204 članka · 8 kategorija`
2. Search in action — 6.5s (4.0–10.5) — query `Meka i Jesrib u Bibliji` typed into the field, `Pretraži članke` clicked, results + `Pronađeno u tekstu` preview panel lands (beat-locked 8.74s)
3. The archive — 5.5s (10.5–16.0) — eight real category cards arrive one per beat from 10.93s, whole grid held
4. Punch line and wordmark — 4.5s (16.0–20.5) — `„u doba organizovane sumnje."` (17.47s), then `ADAM` wordmark (18.56s) + URL, bed fades

## Audio
- Audio role: warm bed
- Audio arc: fades in under the headline, ticks with the typed query, rhythmic under the arriving cards, opens up for the punch line, one bell into silence
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (already copied into `composition/assets/music/`)
- Music treatment: `data-volume` 0.32, fade-in over ~1.0s from 0.0s, fade out over the final ~1.2s under the wordmark, never above 0.5
- Music cue guidance: bundled preset at `.opencode/skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json` (109.96 BPM). Strong locks: **8.74s** results panel reveal, **17.47s** punch line, **18.56s** wordmark. Beat grid for the eight category cards: 10.93, 11.46, 12.02, 12.55, 13.11, 13.64, 14.20, 14.73. Cue metadata is timing hints only — readability wins any conflict.
- Audio-reactive treatment: subtle — the bronze accent elements (headline emphasis word, counts, wordmark rule) and the `Å` watermark breathe slightly with music RMS/bass. No waveform, equalizer, particle or strobe visuals. Follow the `hyperframes-creative` audio-reactive workflow for extraction; if extraction is unavailable, note it and continue without blocking the render.
- Audio-coupled moments:
  - Scene 2 query typing — randomized `assets/sfx/keyboard/keypress-*.wav` per character
  - Scene 2 submit — `assets/sfx/ui/mouseclick1.ogg` on the `Pretraži članke` press
  - Scene 2 results panel — `assets/sfx/interface/drop_001.ogg` as the panel lands (8.74s)
  - Scene 3 category grid — `assets/sfx/casino/card-place-*.ogg` on the first (10.93s) and last (14.73s) card only; counts tick silently
  - Scene 4 wordmark — `assets/sfx/impact/impactBell_heavy_000.ogg` at 18.56s, ringing over the fading bed
  - Silence rule: no SFX during the Scene 1 headline or the Scene 4 punch line
- SFX selection guidance: `.opencode/skills/brag/assets/sfx/sfx-analysis.md` — prefer low/medium high-frequency risk files; these are polished tones, so keep total cue count at 6 or fewer plus typing
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density and volume from the implemented animation. Music and SFX files are already copied under `composition/assets/`.
- Audio files: all staged in `<output-dir>/composition/assets/{music,sfx/…}`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. This is a `/brag` run: do not enter the `hyperframes` entry-point intent interview and do not route into the generic promo / launch-video workflow. Prefer native Hyperframes conventions.

Requirements:
- Show at least one real UI/copy element from the source project (the hero search field and the search results view are the centerpiece; scene 3 uses the real home-page grid).
- Keep all text readable in the final render — a settled hold of ≥0.8s for short labels, ~0.3s per word for sentences; the punch line gets the longest hold.
- Total duration 15–25s (20.5s planned).
- Include the planned music + SFX layer.
- Treat `/brag` audio notes as guidance, not a cue sheet; choose SFX after the visual animation exists.
- Lock 1–3 major moments to strong cues within ±0.15s (marked `// beat-locked`); snap the eight card arrivals to consecutive `beats[]` within ±0.10s (marked `// beat-grid`), or use natural timing if readability suffers.
- Copy assets already staged locally; keep creation and rendering local — no remote/publishing workflows.
- Run `npx hyperframes check` before render — that is brag's single gate.
