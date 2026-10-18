---
name: ADAM — Research Database
description: A serious editorial research archive — ink-black and uncoated-paper reading grounds, antique-bronze accents, formal serif headings, mono marginalia.
colors:
  # Dark theme. Canonical values, declared in @theme in src/index.css.
  lampblack: "#11100d"
  umber-surface: "#1b1714"
  umber-surface-hover: "#261f1c"
  umber-muted: "#201b18"
  umber-rule: "#3a312b"
  umber-rule-strong: "#5a4a3d"
  ivory-ink: "#f4efe6"
  parchment-ink: "#e7dfd4"
  faded-parchment: "#b7ac98"
  antique-bronze: "#c7a16a"
  bronze-ink: "#1a140f"
  lampblack-veil: "rgba(17, 16, 13, 0.88)"
  # Light theme ("paper"). Overrides on html[data-theme="light"].
  uncoated-cream: "#f5f1e8"
  cream-surface: "#fbf8f3"
  cream-surface-hover: "#e9e0cf"
  cream-muted: "#efe5d4"
  parchment-rule: "#d7c5a7"
  parchment-rule-strong: "#b88c5b"
  cocoa-ink: "#2e2019"
  clay-ink: "#3d2f2a"
  graphite-ink: "#665e54"
  deep-bronze: "#9e7040"
  cream-on-bronze: "#fffaf4"
  cocoa-veil: "rgba(46, 32, 25, 0.6)"
  # MDX callout inks. Dark value first, paper value second; both are used in
  # production because every article ships both themes.
  note-green: "#9db08b"
  note-green-paper: "#5c6d4b"
  info-slate: "#8cae9f"
  info-slate-paper: "#4b6763"
  warn-ochre: "#d7b36b"
  warn-ochre-paper: "#8a6513"
  scholar-gold: "#d8b774"
  scholar-gold-paper: "#7a5b16"
  quran-blue: "#9fb7d9"
  quran-blue-paper: "#405d87"
  bible-rose: "#d28a7a"
  bible-rose-paper: "#9b4a42"
typography:
  display:
    fontFamily: "Cormorant Garamond, Playfair Display, Amiri, Georgia, serif"
    fontSize: "clamp(2.8rem, 8vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 0.9
  headline:
    fontFamily: "Cormorant Garamond, Playfair Display, Amiri, Georgia, serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 1.2
  title:
    fontFamily: "Cormorant Garamond, Playfair Display, Amiri, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Lexend, Amiri, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 400
    lineHeight: 1.9
  ui:
    fontFamily: "Inter, Amiri, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    letterSpacing: "0.1em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  2xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.antique-bronze}"
    textColor: "{colors.bronze-ink}"
    rounded: "{rounded.lg}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.antique-bronze}"
    textColor: "{colors.bronze-ink}"
    rounded: "{rounded.lg}"
    padding: "14px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.faded-parchment}"
    rounded: "{rounded.lg}"
    padding: "14px 24px"
  chip:
    backgroundColor: "{colors.umber-surface}"
    textColor: "{colors.faded-parchment}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  chip-hover:
    backgroundColor: "{colors.umber-surface}"
    textColor: "{colors.antique-bronze}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  input:
    backgroundColor: "{colors.umber-surface}"
    textColor: "{colors.ivory-ink}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  input-focus:
    backgroundColor: "{colors.umber-surface}"
    textColor: "{colors.ivory-ink}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.umber-surface}"
    textColor: "{colors.parchment-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: ADAM — Research Database

## Overview

**Creative North Star: "The Annotated Manuscript"**

Every surface in this system is a page of a working codex. Headings carry a
mono marginalia label above them, the way a scribe's rubric sits above the
passage it names; sections are marked with a small bronze diamond rotated
45°, standing in for the rubrication marks of a manuscript; the article body
is set in a single 65-character measure with a numbered table of contents
hanging beside it in the margin. The two themes are the two states of that
page: **Lampblack** (`#11100d`) is the reading room after dark, **Uncoated
Cream** (`#f5f1e8`) is the sheet itself, carrying a 5%-opacity fractal grain
that is applied as a fixed overlay and never in dark mode.

Personality: formal, calm and unhurried. Authority comes from the serif
headings, the whitespace and the typographic scale — never from colour,
effects or ornament. Content density is that of a reference archive: long
articles, source citations, tables of isnad chains, and a metadata row on
every page. Confirmed visual rejections: no gloss. No gradients, no
glassmorphism, no glow, no drop shadows on content, no marketing-page
energy.

**Key Characteristics:**

- Two reading grounds — Lampblack dark and Uncoated Cream paper — that share
  one token vocabulary and one accent hue.
- Antique Bronze as the only interactive colour; it marks state, it never
  fills a surface.
- Serif headings (Cormorant Garamond) over sans/serif-adjacent body text
  (Lexend for articles, Inter for interface), with Amiri as the Arabic
  fallback inside every stack.
- Mono uppercase marginalia at 12px for every label, index number and piece
  of metadata.
- Flat document, shadowed floaters: content sits on the page, only genuinely
  floating layers are lifted off it.
- 1px rules and one-step tonal shifts instead of boxes and cards wherever
  either will do.

## Colors

The palette is a warm monochrome — near-black, warm ivory, muted bronze —
with a single accent hue and a small family of semantic inks reserved for
MDX callouts.

### Primary

- **Antique Bronze** (`#c7a16a` dark / `#9e7040` paper): the system's only
  interactive colour. It draws the focus ring, the active table-of-contents
  item, the current nav state, hover borders, the selected tag, the italic
  hero word, the diamond rubric marks and the fill of the one primary button
  style. It is the same hue on both grounds; only its lightness moves.
- **Bronze Ink** (`#1a140f` / `#fffaf4`): the text that sits *on* bronze.
  Used almost nowhere else — a filled bronze surface always carries it.

### Secondary

- **Callout inks** (`note-green #9db08b`, `info-slate #8cae9f`,
  `warn-ochre #d7b36b`, `scholar-gold #d8b774`, `quran-blue #9fb7d9`,
  `bible-rose #d28a7a`, each with a darker paper counterpart): six semantic
  inks that exist only in the MDX callout system. They colour the 4px side
  rule, the label and the leading glyph of a callout; the callout body itself
  is never filled and stays on the page background.

### Neutral

- **Lampblack** (`#11100d`) / **Uncoated Cream** (`#f5f1e8`): the two page
  grounds.
- **Umber Surface** (`#1b1714`) / **Cream Surface** (`#fbf8f3`): the one step
  up from the ground, for cards, chips, table headers and the navbar.
- **Umber Rule** (`#3a312b`) / **Parchment Rule** (`#d7c5a7`): the 1px line
  that does almost all of the structural work in this system.
- **Ivory Ink** (`#f4efe6`) / **Cocoa Ink** (`#2e2019`): headings.
- **Parchment Ink** (`#e7dfd4`) / **Clay Ink** (`#3d2f2a`): body text.
- **Faded Parchment** (`#b7ac98`) / **Graphite Ink** (`#665e54`): metadata,
  secondary copy, placeholder text.
- **Lampblack Veil** (`rgba(17,16,13,0.88)`) / **Cocoa Veil**
  (`rgba(46,32,25,0.6)`): the backdrop behind modal overlays.

### Named Rules

**The Bronze Minority Rule.** Bronze is a state colour, not a surface
colour. If more than a few percent of a viewport is bronze, something is
wrong: the accent earns its power by being the only saturated thing on the
page.

**The Two-Script Rule.** Amiri sits in every font stack as the last
resolvable face, so an Arabic glyph — or the ﷺ ligature — always lands on a
Naskh face that matches the serif headings. Latin resolves in front of it and
is unaffected.

## Typography

**Display Font:** Cormorant Garamond, with Playfair Display as the second
serif and Amiri as the installed-font fallback
**Body Font:** Lexend for article prose, Inter for interface copy
**Label/Mono Font:** the system monospace stack (`ui-monospace`, Menlo,
Consolas), uppercase, 12px

**Character:** a formal serif carrying the authority, a neutral sans carrying
the reading, and a monospace carrying the archive's own bookkeeping. The
serif never appears in running text and the monospace never appears in
sentences — each face owns a register.

### Hierarchy

- **Display** (400, `clamp(2.8rem, 8vw, 4.5rem)`, line-height 0.9): the home
  hero only, with one italic bronze word inside it.
- **Headline** (500, 30px, 1.2): every page `h1`, and the article title at
  600/36px on wide screens.
- **Title** (500, 24px, 1.25): article `h2` sections.
- **Body** (400, 17.6px, 1.9, Lexend, `max-w-prose` ≈ 65ch): article prose.
  Interface copy drops to 14px Inter.
- **Label** (400, 12px, uppercase, `0.1em` tracking, mono): eyebrows, index
  numbers, metadata rows, tag chips, button text.

**The Marginalia Rule.** Anything that is bookkeeping rather than content —
a date, a reading time, a word count, a category, an index number, a button
label — is set in uppercase mono at 12px in Faded Parchment. Anything that is
content is set in Lexend. The two never mix inside one line except in the
article meta row, where the mono labels sit under the serif title.

## Layout

A single centred container, `max-w-7xl` (1280px) with 24px side gutters, is
the whole spatial model. Sections are separated by 80px of vertical rhythm
and, on index pages, a 1px rule; cards sit in a 2/3/4-column responsive grid
with 16–24px gaps. The navbar is a fixed 64px bar; pages begin 80px below it.

Article pages break the container into a `300px + 1fr` grid at `lg`: the
numbered table of contents is sticky in the left margin at 28px row density,
and the prose column is capped at `max-w-prose`. Below `lg` the margin column
disappears and the table of contents becomes a floating trigger bottom-left
that opens a sheet — the same item markup at 44px touch rows.

**The Measure Rule.** Article prose is capped at roughly 65 characters per
line. Headers, meta rows, related-article grids and footers align to the
prose column's left edge so the page reads as one margin.

Responsive steps are the platform defaults: 640 / 768 / 1024 / 1280 / 1536.

## Elevation & Depth

The document is flat. Cards, sections, tables, lists and chips carry no
shadow at all — depth is expressed by a 1px rule and a single tonal step from
the ground (`#11100d` → `#1b1714`). Shadows exist, but only on layers that
genuinely sit above the page, and their presence is the signal that a layer
is floating.

### Shadow Vocabulary

- **Floating panel** (`box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)`, i.e.
  Tailwind `shadow-2xl`): the fixed promo panel and the pagination popover.
  Anything fixed-position that covers content.
- **Floating control** (`box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)`, i.e.
  `shadow-lg`): the circular back-to-top buttons, the mobile table-of-
  contents trigger, the footnote popover (`shadow-xl`).
- **Hero image card** (`box-shadow: 0 22px 44px rgba(15,12,10,0.18)`): a
  single bespoke value, used once, on the home hero's framed image.

### Named Rules

**The Floating-Layer Rule.** A shadow is only ever a declaration that a layer
is above the document. Content that scrolls with the page never gets one.

## Shapes

Corners are gently and consistently curved: 8px (`rounded-lg`) is the default
for buttons, inputs, cards, table wrappers and callout frames; 12px and 16px
are reserved for floating panels and framed imagery; `rounded-full` belongs
to chips, tags, topic pills and the circular floating controls — nothing else
is a pill. Borders are 1px, in Umber Rule, and are the primary structural
device; 4px left rules appear only in MDX callouts and quotations.

**The Diamond Rule.** The recurring mark of this system is a small square
rotated 45° in Antique Bronze: it bullets list items, separates table-of-
contents sub-headings, divides sections, and labels the article's summary
block. New marks should be diamonds unless there is a reason not to be.

## Components

Components are restrained and utilitarian: quiet at rest, explicit on
interaction, and never decorative.

### Buttons

- **Shape:** 8px radius, uppercase mono label at 12px with `0.1em` tracking.
- **Primary:** Antique Bronze fill with Bronze Ink text, 14px × 24px padding
  (14px vertical). Used for the single commit action on a page — a form
  submit, a promo CTA.
- **Hover / Focus:** hover drops to 90% opacity (or one surface step for
  ghost buttons); every interactive element on the site receives the global
  focus ring — a 2px Antique Bronze outline at 2px offset, drawn only for
  `:focus-visible`.
- **Ghost:** transparent with a 1px Umber Rule border and Faded Parchment
  text; hover shifts border and text to bronze.

### Chips

- **Style:** fully rounded, Umber Surface background, 1px Umber Rule border,
  Faded Parchment text at 12px, 6px × 12px padding.
- **State:** hover moves border and text to Antique Bronze. Used for tags,
  hero topic pills, the article meta row and search filters. Chips are never
  filled at rest.

### Cards / Containers

- **Corner Style:** 8px.
- **Background:** Umber Surface on Lampblack, Cream Surface on Uncoated
  Cream.
- **Shadow Strategy:** none — see the Floating-Layer Rule.
- **Border:** 1px Umber Rule; hover raises it to the strong variant and moves
  the title to bronze.
- **Internal Padding:** 24px.

### Inputs / Fields

- **Style:** Umber Surface fill, 1px border that starts at the rule colour,
  8px radius, 12px × 16px padding, Ivory Ink text, Faded Parchment
  placeholder.
- **Focus:** the border becomes Antique Bronze; the global focus ring also
  applies.

### Navigation

Fixed 64px bar on the page ground with a 1px bottom rule; the wordmark is
serif at 30px, the links are 12px uppercase mono, and hover/active move to
Antique Bronze. On small screens the bar collapses to a hamburger that opens
a full-height sheet using the same ground, rule and veil tokens as the other
overlays.

### Signature Components

**MDX Callout.** An unfilled block on the page background with a 4px left
rule and a mono uppercase label in one of the six semantic inks. It is
deliberately never a filled panel: it sits in the text the way a marginal note
does.

**Table of Contents.** Mono numbered items (Arabic-Indic numerals via
`Intl.NumberFormat("ar-u-nu-arab")`) in 6px-radius boxes, with sub-headings
indented behind a small diamond. The active item is tinted with the muted
surface and bronze text. It exists twice — sticky margin column on desktop,
floating sheet on mobile — from one set of item markup.

**Marker Highlight.** A `<mark>` washed with a translucent amber band rather
than a filled block, so glyphs stay legible on both grounds; a second variant
draws a hand-wobbled SVG stroke under the phrase instead.

## Do's and Don'ts

### Do:

- **Do** separate structure with a 1px Umber Rule before reaching for a
  border, a fill or a shadow.
- **Do** set metadata, labels, index numbers and button text in uppercase
  mono at 12px in Faded Parchment.
- **Do** use Antique Bronze only to mark state — current, hover, focus,
  selected — and keep it under a few percent of any viewport.
- **Do** keep article prose at 17.6px with 1.9 line-height inside a ~65ch
  measure.
- **Do** give every keyboard-reachable element the global focus ring
  (`:focus-visible`, 2px Antique Bronze, 2px offset).
- **Do** express elevation with the tonal step from ground to surface
  (`#11100d` → `#1b1714`).
- **Do** reuse the diamond mark for new bullets, dividers and status marks.

### Don't:

- **Don't** put a shadow on anything that scrolls with the page.
- **Don't** fill a card, callout or chip with colour at rest.
- **Don't** introduce a second saturated hue outside the six MDX callout
  inks.
- **Don't** add gradients, glassmorphism, glow or any other gloss —
  with one exemption: the ambient body radial bronze wash (sub-8% alpha
  lamplight, `index.css`) is atmosphere, not surface gloss.
- **Don't** set a sentence in uppercase mono, or metadata in the serif.
- **Don't** let Arabic fall through to a mismatched fallback — Amiri stays in
  the stack.
- **Don't** use a radius other than 8px for controls, or a pill for anything
  that is not a chip.
