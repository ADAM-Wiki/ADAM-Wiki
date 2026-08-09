import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackToTop from "./BackToTop";
import { SITE_NAME } from "../utils/siteConfig";
import { getAllArticles } from "../utils/articleIndex";

interface TagCount {
  tag: string;
  count: number;
}

/** Colour per weight step; the size comes from tierPx so that the width
 *  estimate and the rendered text can never disagree. */
const TIER_STYLES = [
  "text-brand-dim",
  "text-brand-text",
  "text-brand-text",
  "font-serif text-brand-heading",
  "font-serif text-brand-accent",
];

/** Font size at full width, in px, from rarest to most used. */
const TIER_PX_BASE = [14, 16, 20, 30, 48];
const REFERENCE_WIDTH = 900;

/**
 * The whole disc scales with its container so a phone gets the same shape at a
 * smaller size, rather than the rows wrapping and collapsing back to a block.
 */
function tierScale(containerWidth: number): number {
  return Math.min(1, Math.max(0.7, containerWidth / REFERENCE_WIDTH));
}

function tierPx(tier: number, scale: number): number {
  return Math.max(11, Math.round(TIER_PX_BASE[tier] * scale));
}

function collectTags(): TagCount[] {
  const counts = new Map<string, number>();

  for (const article of getAllArticles()) {
    for (const tag of article.tags ?? []) {
      const clean = tag.trim();
      if (clean) counts.set(clean, (counts.get(clean) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([tag, count]) => ({ tag, count }));
}

function tierFor(count: number, min: number, max: number): number {
  if (max === min) return 2;
  // Square root keeps a single very popular tag from flattening everything else.
  const scale = Math.sqrt((count - min) / (max - min));
  return Math.min(4, Math.round(scale * 4));
}

/** Puts the heaviest entry in the middle of a row, tapering to both ends. */
function centreWeighted<T extends TagCount>(tags: T[]): T[] {
  const sorted = [...tags].sort((a, b) => b.count - a.count);
  const arranged: T[] = [];

  sorted.forEach((entry, index) => {
    if (index % 2 === 0) arranged.push(entry);
    else arranged.unshift(entry);
  });

  return arranged;
}

const AVG_GLYPH_RATIO = 0.55;
const ROW_GAP_PX = 20;

function estimateWidth(tag: string, tier: number, scale: number): number {
  return tag.length * tierPx(tier, scale) * AVG_GLYPH_RATIO + ROW_GAP_PX * scale;
}

/**
 * Packs the tags into rows whose *rendered width* follows a sine curve - narrow
 * at top and bottom, widest through the middle - so the centred rows trace a
 * disc. Plain flex-wrap fills a rectangle instead.
 *
 * Budgeting by pixels rather than tag count matters because the middle rows
 * also carry the largest type: an equal split by count overflows the container
 * and wraps, which flattens the circle back into a block.
 */
function circularRows(
  tags: (TagCount & { tier: number })[],
  maxRowPx: number,
  scale: number,
): (TagCount & { tier: number })[][] {
  if (!tags.length) return [];

  const sorted = [...tags].sort((a, b) => b.count - a.count);

  // Enough rows that the whole set fits without any row exceeding maxRowPx.
  // The mean of sin over a half period is 2/pi, so that is the average row's
  // share of the peak width. Too few rows and the surplus piles into the middle
  // row, which then wraps and flattens the disc.
  const totalWidth = sorted.reduce(
    (sum, t) => sum + estimateWidth(t.tag, t.tier, scale),
    0,
  );
  const MEAN_SINE = 2 / Math.PI;
  let rowCount = Math.max(
    5,
    Math.ceil((totalWidth * 1.05) / (maxRowPx * MEAN_SINE)),
  );
  if (rowCount % 2 === 0) rowCount += 1; // odd, so there is a single middle row

  const weights = Array.from({ length: rowCount }, (_, i) =>
    Math.sin((Math.PI * (i + 0.5)) / rowCount),
  );
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const peak = Math.min(maxRowPx, (totalWidth * 1.05) / weightSum);
  const targets = weights.map((w) => peak * w);

  // Middle row first, then alternately above and below, so the heaviest tags
  // land in the widest part of the disc.
  const middle = Math.floor(rowCount / 2);
  const fillOrder = [middle];
  for (let d = 1; fillOrder.length < rowCount; d++) {
    if (middle - d >= 0) fillOrder.push(middle - d);
    if (middle + d < rowCount) fillOrder.push(middle + d);
  }

  const rows: (TagCount & { tier: number })[][] = Array.from(
    { length: rowCount },
    () => [],
  );

  let cursor = 0;
  for (const row of fillOrder) {
    let used = 0;
    while (cursor < sorted.length) {
      const next = sorted[cursor];
      const width = estimateWidth(next.tag, next.tier, scale);
      // Always take at least one, so no row is left empty.
      if (used > 0 && used + width > targets[row]) break;
      rows[row].push(next);
      used += width;
      cursor++;
    }
  }

  // Rounding can still leave a couple over; spread them one per row from the
  // middle outward rather than dumping them all into one row.
  let spread = 0;
  while (cursor < sorted.length) {
    rows[fillOrder[spread % fillOrder.length]].push(sorted[cursor]);
    cursor++;
    spread++;
  }

  return rows.filter((row) => row.length).map(centreWeighted);
}

const tagHref = (tag: string) => `/search?q=${encodeURIComponent(tag)}`;

export default function TagsPage() {
  const cloudRef = useRef<HTMLDivElement | null>(null);
  // Prerendering has no layout, so start at the desktop reference and correct
  // once the element has been measured.
  const [cloudWidth, setCloudWidth] = useState(REFERENCE_WIDTH);

  useEffect(() => {
    const node = cloudRef.current;
    if (!node) return;

    const measure = () => setCloudWidth(node.clientWidth || REFERENCE_WIDTH);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = tierScale(cloudWidth);

  const { cloud, grouped, total } = useMemo(() => {
    const tags = collectTags();
    const counts = tags.map((t) => t.count);
    // The real lowest count, not 0 - otherwise the scale is compressed and the
    // smallest tier never gets used.
    const min = counts.length ? Math.min(...counts) : 0;
    const max = counts.length ? Math.max(...counts) : 1;

    const alphabetical = [...tags].sort((a, b) =>
      a.tag.localeCompare(b.tag, "sr"),
    );

    const byLetter = new Map<string, TagCount[]>();
    for (const entry of alphabetical) {
      const letter = entry.tag[0]?.toUpperCase() ?? "#";
      if (!byLetter.has(letter)) byLetter.set(letter, []);
      byLetter.get(letter)!.push(entry);
    }

    const weighted = tags.map((entry) => ({
      ...entry,
      tier: tierFor(entry.count, min, max),
    }));

    return {
      cloud: circularRows(weighted, cloudWidth, scale),
      grouped: [...byLetter.entries()],
      total: tags.length,
    };
  }, [cloudWidth, scale]);

  return (
    <div className="min-h-screen bg-brand-bg relative selection:bg-brand-accent selection:text-brand-on-accent">
      <Helmet>
        <title>{`Tagovi | ${SITE_NAME}`}</title>
        <meta
          name="description"
          content="Svi tagovi na Adam-Wiki, poređani po učestalosti i abecedno."
        />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
              TAGOVI
            </span>
            <h1 className="mt-2 font-serif text-3xl font-medium text-brand-heading">
              Svi tagovi
            </h1>
            <p className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 font-mono text-xs uppercase tracking-widest text-brand-dim">
              <span className="font-serif text-2xl tracking-normal text-brand-accent">
                {total}
              </span>
              tagova
              <span className="text-brand-border-strong">·</span>
              veći znači češći
            </p>
          </div>

          {/* Weighted cloud: size and colour both track how often a tag is used. */}
          <div className="relative mt-14">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07]"
              style={{
                background:
                  "radial-gradient(circle, var(--color-brand-accent) 0%, transparent 70%)",
              }}
            />

            <div
              ref={cloudRef}
              className="relative mx-auto flex w-full max-w-[940px] flex-col items-center"
              style={{ rowGap: `${Math.round(10 * scale)}px` }}
            >
              {cloud.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex flex-nowrap items-center justify-center"
                  style={{ columnGap: `${Math.round(ROW_GAP_PX * scale)}px` }}
                >
                  {row.map(({ tag, count, tier }) => (
                    <Link
                      key={tag}
                      to={tagHref(tag)}
                      title={`${tag} — ${count} ${count === 1 ? "članak" : "članaka"}`}
                      style={{ fontSize: `${tierPx(tier, scale)}px` }}
                      className={`inline-block whitespace-nowrap leading-none decoration-2 underline-offset-4 transition-transform duration-200 hover:scale-110 hover:text-brand-accent hover:underline ${TIER_STYLES[tier]}`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Alphabetical index: names only, no article listings. */}
          <div className="mt-24 border-t border-brand-border pt-12">
            <h2 className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-brand-dim">
              Abecedno
            </h2>

            <div className="space-y-10">
              {grouped.map(([letter, entries]) => (
                <div key={letter}>
                  {/* Letter, then a rule across the remaining width, so each
                      group reads as its own band rather than one long list. */}
                  <div className="mb-4 flex items-center gap-4">
                    <span className="font-serif text-2xl leading-none text-brand-accent">
                      {letter}
                    </span>
                    <span
                      aria-hidden
                      className="h-px flex-1 bg-brand-border"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-brand-dim">
                      {entries.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {entries.map(({ tag, count }) => (
                      <Link
                        key={tag}
                        to={tagHref(tag)}
                        className="group flex items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text transition-colors hover:border-brand-border-strong hover:text-brand-heading"
                      >
                        {tag}
                        <span className="font-mono text-[10px] text-brand-dim transition-colors group-hover:text-brand-accent">
                          {count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <BackToTop />
      <Footer />
    </div>
  );
}
