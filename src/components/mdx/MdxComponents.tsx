import { isValidElement, useState } from "react";
import type {
  HTMLAttributes,
  ImgHTMLAttributes,
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
  OlHTMLAttributes,
  ReactNode,
} from "react";
import {
  CircleCheckBig,
  Quote,
  Link as LinkIcon,
  TriangleAlert,
  BookOpenText,
  BookMarked,
  ScrollText,
  BookText,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import ArticleLightbox from "../ArticleLightbox";
import { IMAGE_SIZES } from "../../lib/generated/imageSizes";
import { Ref } from "./Footnotes";

export { Ref, FootnoteList, FootnoteProvider } from "./Footnotes";

type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;
type DivProps = HTMLAttributes<HTMLDivElement>;
type ImageProps = ImgHTMLAttributes<HTMLImageElement>;
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Type scale: h1 36 > h2 30 > h3 24 > h4 20 > body 18.
 *
 * h2 used to be 36px against a 30px article title, so section headings
 * outranked the title they sat under.
 */
export function MdxH2({ className = "", children, ...props }: HeadingProps) {
  return (
    <div className="space-y-6">
      {/* brand-dim/50 rather than a border token: it lands at ~1.8:1 against
          the page in both themes, where border-strong is 3.1:1 on black but a
          near-invisible 1.3:1 on paper. */}
      <div className="flex items-center gap-3" aria-hidden>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-dim/50" />
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rotate-45 border border-brand-dim/50" />
          <div className="h-2 w-2 rotate-45 bg-brand-accent" />
          <div className="h-1.5 w-1.5 rotate-45 border border-brand-dim/50" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-brand-dim/50" />
      </div>
      <h2
        className={`scroll-mt-32 break-words font-serif text-[2rem] font-semibold tracking-[-0.03em] leading-[1.1] text-brand-heading sm:text-[2.6rem] [overflow-wrap:anywhere] ${className}`}
        {...props}
      >
        {children}
      </h2>
    </div>
  );
}

export function MdxH3({ className = "", children, ...props }: HeadingProps) {
  return (
    <h3
      className={`scroll-mt-32 flex items-center gap-3 break-words font-serif text-[1.7rem] font-semibold leading-[1.2] tracking-[-0.025em] text-brand-heading sm:text-[2.05rem] [overflow-wrap:anywhere] ${className}`}
      {...props}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rotate-45 bg-brand-accent"
      />
      {children}
    </h3>
  );
}

export function MdxH4({ className = "", children, ...props }: HeadingProps) {
  return (
    <h4
      className={`scroll-mt-32 break-words font-serif text-[1.45rem] font-semibold leading-[1.2] tracking-[-0.02em] text-brand-heading sm:text-[1.7rem] [overflow-wrap:anywhere] ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}

export function MdxP({ className = "", children, ...props }: ParagraphProps) {
  return (
    <p
      className={`font-lexend text-[1.1rem] leading-[1.9] tracking-[0.005em] text-brand-text ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

/**
 * Shared shell for every callout.
 *
 * `block`, not `inline-block` - shrink-wrapping made the right edge ragged
 * whenever the content was short, and two short callouts in a row could end up
 * side by side.
 */
interface CalloutProps extends DivProps {
  icon: ReactNode;
  label?: string;
  tone: string;
  children: ReactNode;
}

function Callout({
  icon,
  label,
  tone,
  className = "",
  children,
  ...props
}: CalloutProps) {
  return (
    <div
      className={`block border-l-4 px-5 py-4 ${className}`}
      style={{ borderColor: tone }}
      {...props}
    >
      <div className="mb-2 flex items-center gap-2" style={{ color: tone }}>
        {icon}
        {label && (
          <span className="text-sm font-semibold tracking-wide">{label}</span>
        )}
      </div>
      <div className="leading-relaxed text-brand-text">{children}</div>
    </div>
  );
}

const ICON_CLASS = "h-5 w-5 shrink-0";

export function Important({ className = "", children, ...props }: DivProps) {
  return (
    <Callout
      icon={<CircleCheckBig aria-hidden className={ICON_CLASS} />}
      label="Sažetak odgovora"
      tone="var(--color-brand-note-fg)"
      className={className}
      {...props}
    >
      {children}
    </Callout>
  );
}

export function Warning({ className = "", children, ...props }: DivProps) {
  return (
    <Callout
      icon={<TriangleAlert aria-hidden className={ICON_CLASS} />}
      label="Napomena"
      tone="var(--color-brand-warn-fg)"
      className={className}
      {...props}
    >
      {children}
    </Callout>
  );
}

/** Icon only - the quote mark says everything a "Citat" label would. */
export function QuoteBox({ className = "", children, ...props }: DivProps) {
  return (
    <Callout
      icon={<Quote aria-hidden className={ICON_CLASS} />}
      tone="var(--color-brand-dim)"
      className={className}
      {...props}
    >
      {children}
    </Callout>
  );
}

interface SourceProps extends DivProps {
  reference?: string;
  children: ReactNode;
}

export function Ucenjak({
  reference = "Učenjak",
  className = "",
  children,
  ...props
}: SourceProps) {
  return (
    <Callout
      icon={<ScrollText aria-hidden className={ICON_CLASS} />}
      label={reference}
      tone="var(--color-brand-scholar-fg)"
      className={className}
      {...props}
    >
      {children}
    </Callout>
  );
}

export function Quran({
  reference = "Kur'an",
  className = "",
  children,
  ...props
}: SourceProps) {
  return (
    <Callout
      icon={<BookOpenText aria-hidden className={ICON_CLASS} />}
      label={reference}
      tone="var(--color-brand-quran-fg)"
      className={className}
      {...props}
    >
      {children}
    </Callout>
  );
}

export function Bible({
  reference = "Biblija",
  className = "",
  children,
  ...props
}: SourceProps) {
  return (
    <Callout
      icon={<BookText aria-hidden className={ICON_CLASS} />}
      label={reference}
      tone="var(--color-brand-bible-fg)"
      className={className}
      {...props}
    >
      {children}
    </Callout>
  );
}

/** Commentary on the scan or quotation directly above. */
export function OpisSlike({ className = "", children, ...props }: DivProps) {
  return (
    <Callout
      icon={<ImageIcon aria-hidden className={ICON_CLASS} />}
      label="Opis Slike"
      tone="var(--color-brand-info-fg)"
      className={className}
      {...props}
    >
      {children}
    </Callout>
  );
}

/** 1 single sweep, 2 two passes, 3 three scribbles, 4 a marker running dry. */
const MARKER_VARIANTS = ["1", "2", "3", "4"] as const;

type MarkerVariant = (typeof MARKER_VARIANTS)[number];

/** Flattens children to their text, so nested markup still seeds a stroke. */
function markerText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(markerText).join("");
  if (isValidElement(node)) {
    return markerText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

/** FNV-1a. Any cheap avalanche would do - this one is four lines. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

interface MarkerProps extends HTMLAttributes<HTMLElement> {
  /**
   * Pins the stroke, as `variant="2"` or `variant={2}` - MDX makes both easy
   * to reach for, so both are accepted. Omit it and the phrase picks its own.
   */
  variant?: MarkerVariant | 1 | 2 | 3 | 4;
  children: ReactNode;
}

/**
 * Marker highlight for a phrase worth stopping on.
 *
 * The stroke is picked by hashing the marked text, not at random: articles are
 * prerendered, so Math.random would draw one stroke into the HTML and a
 * different one the moment React hydrated, swapping it under the reader. A
 * hash gives the same variety between phrases while staying identical across
 * prerender, hydration and rebuilds. The cost is that repeating a phrase
 * verbatim repeats its stroke - pass `variant` on one of them if that shows.
 */
export function Marker({
  variant,
  className = "",
  children,
  ...props
}: MarkerProps) {
  const stroke =
    variant === undefined
      ? MARKER_VARIANTS[hash(markerText(children)) % MARKER_VARIANTS.length]
      : String(variant);

  return (
    <mark className={`marker marker-${stroke} ${className}`} {...props}>
      {children}
    </mark>
  );
}

export function MdxOL({
  className = "",
  children,
  ...props
}: OlHTMLAttributes<HTMLOListElement>) {
  return (
    <ol className={`mdx-ol space-y-2.5 list-none pl-0 ${className}`} {...props}>
      {children}
    </ol>
  );
}

export function MdxUL({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={`mdx-ul space-y-2.5 list-none pl-0 ${className}`} {...props}>
      {children}
    </ul>
  );
}

export function MdxLI({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={`flex items-start gap-3 font-lexend text-lg leading-relaxed text-brand-text ${className}`}
      {...props}
    >
      {children}
    </li>
  );
}

export function MdxBlockquote({
  className = "",
  children,
  ...props
}: BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={`border-l-4 border-brand-accent pl-5 font-lexend text-lg italic leading-relaxed text-brand-dim ${className}`}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function MdxCode({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={`rounded border border-brand-border bg-brand-surface px-1.5 py-0.5 font-mono text-[0.9em] text-brand-heading ${className}`}
      {...props}
    >
      {children}
    </code>
  );
}

export function MdxPre({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLPreElement>) {
  return (
    <pre
      className={`overflow-x-auto rounded-lg border border-brand-border bg-brand-surface p-4 font-mono text-sm text-brand-text ${className}`}
      {...props}
    >
      {children}
    </pre>
  );
}

export function MdxHr({
  className = "",
  ...props
}: HTMLAttributes<HTMLHRElement>) {
  return <hr className={`border-brand-border ${className}`} {...props} />;
}

/**
 * Inline link inside prose. The article is not wrapped in `.prose`, and
 * Tailwind's preflight strips link colour and underline, so without this an
 * inline link is indistinguishable from body text.
 */
export function MdxA({
  href = "",
  className = "",
  children,
  ...props
}: AnchorProps) {
  const external = /^https?:\/\//.test(href);

  return (
    <a
      href={href}
      // Several articles link bare URLs, which are one unbreakable token and
      // push the page sideways on a phone without the anywhere-wrap.
      className={`text-brand-accent underline decoration-brand-accent/40 underline-offset-4 transition-colors hover:decoration-brand-accent [overflow-wrap:anywhere] ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...props}
    >
      {children}
    </a>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    // A long table scrolls inside its own box rather than down the page, which
    // is what lets the header stay pinned: `overflow-x: auto` for the mobile
    // case forces this element to be a scroll container on both axes anyway,
    // so sticky can only ever resolve against this box, never the page.
    <div className="mdx-table-wrap my-6 max-h-[32rem] overflow-auto rounded-lg border border-brand-border font-lexend">
      {/* border-separate, not collapse: a collapsed border is shared between
          rows, so the sticky header cannot paint over it and a sliver of the
          scrolling row bleeds through underneath. Cells only carry a bottom
          border, so nothing doubles up. */}
      <table className="mdx-table w-full border-separate border-spacing-0 text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ children }: { children: ReactNode }) {
  return (
    <th
      scope="col"
      className="border-b border-brand-border px-5 py-3 text-left text-sm font-semibold tracking-wide text-brand-accent"
    >
      {children}
    </th>
  );
}

export function Td({ children }: { children: ReactNode }) {
  return (
    <td className="border-b border-brand-border px-5 py-3 text-brand-text">
      {children}
    </td>
  );
}

interface ArticleLinkProps extends AnchorProps {
  href: string;
  children: ReactNode;
}

export function ArticleLink({
  href,
  className = "",
  children,
  ...props
}: ArticleLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block border-l-4 border-brand-dim px-5 py-4 text-brand-text transition-colors hover:border-brand-accent ${className}`}
      {...props}
    >
      <span className="mb-2 flex items-center gap-2 text-brand-dim transition-colors group-hover:text-brand-accent">
        <LinkIcon aria-hidden className={ICON_CLASS} />
        <span className="text-sm font-semibold tracking-wide">Link</span>
      </span>
      <span>{children}</span>
    </a>
  );
}

interface ArticleImageProps extends ImageProps {
  caption?: string;
}

/**
 * Intrinsic size of a scan, for the width/height attributes.
 *
 * The manifest is keyed by the path under public/, while MDX writes the full
 * request path including the deploy base ("/ADAM-Wiki/images/..."), so the base
 * is trimmed before the lookup.
 */
function intrinsicSize(src: string): [number, number] | undefined {
  const base = import.meta.env.BASE_URL;
  const relative =
    base !== "/" && src.startsWith(base) ? src.slice(base.length - 1) : src;

  return IMAGE_SIZES[relative];
}

export function ArticleImage({
  src = "",
  alt = "",
  caption = "",
  className = "",
  ...props
}: ArticleImageProps) {
  const [open, setOpen] = useState(false);
  // Only a real caption or a real alt is worth printing. The filename fallback
  // this used to have put strings like "1" and "sahih-3" under the scans, and
  // fed the same thing to alt.
  const finalCaption = caption || alt;
  const size = intrinsicSize(src);

  return (
    <>
      <div className="my-4">
        {/* A button, not a bare <img> with onClick: opening the lightbox is an
            action, and as a div-alike it was unreachable by keyboard and
            invisible to assistive tech. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          // With alt text present the image already names the button; a label
          // here as well would have it announced twice. Only a decorative scan
          // needs one supplied.
          aria-label={alt ? undefined : "Uvećaj sliku"}
          // zoom-in, and stated explicitly: Tailwind v4 gives buttons
          // `cursor: default`, so wrapping the scan in one silently took away
          // the only hint that it opens full size.
          className="group/img relative block w-full cursor-zoom-in overflow-hidden rounded-lg"
        >
          <img
            src={src}
            alt={alt}
            // Reserves the box before the bytes arrive, so a page of scans
            // stops reflowing under the reader as it loads.
            width={size?.[0]}
            height={size?.[1]}
            loading="lazy"
            decoding="async"
            className={`h-auto w-full rounded-lg transition-opacity group-hover/img:opacity-90 ${className}`}
            {...props}
          />

          {/* A cursor is no affordance at all on a phone, which is where these
              scans are least readable inline. The badge is always visible so
              touch readers can see the page opens larger; it only brightens on
              hover. Manuscript scans are the evidence the site rests on, so it
              matters that they look openable. */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-brand-overlay px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-text opacity-80 backdrop-blur-sm transition-opacity group-hover/img:opacity-100"
          >
            <Maximize2 className="h-3 w-3 shrink-0" />
            Uvećaj
          </span>
        </button>

        {finalCaption && (
          <p className="mt-2 text-center text-xs text-brand-dim">
            {finalCaption}
          </p>
        )}
      </div>

      {open && (
        <ArticleLightbox
          url={src}
          caption={finalCaption}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface ArapskiProps extends DivProps {
  /** Optional citation, rendered left-to-right beneath the Arabic. */
  reference?: string;
  children: ReactNode;
}

/**
 * Right-to-left block for Arabic source text.
 *
 * The accent rule sits on the right edge, mirroring the left rule the
 * left-to-right callouts use. Arabic needs noticeably more leading than Latin
 * at the same size, hence the loose line height.
 */
export function Arapski({
  reference,
  className = "",
  children,
  ...props
}: ArapskiProps) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className={`border-r-4 border-brand-accent px-5 py-4 ${className}`}
      {...props}
    >
      {/* Amiri draws small for its point size, so this is larger than the
          equivalent Latin block would be. */}
      <div className="font-arabic text-[1.9rem] leading-[1.95] text-brand-heading">
        {children}
      </div>

      {reference && (
        <p dir="ltr" className="mt-3 text-left text-xs text-brand-dim">
          {reference}
        </p>
      )}
    </div>
  );
}

interface IzvoriProps extends DivProps {
  title?: string;
  children: ReactNode;
}

/** Numbered source list, normally closing an article. */
export function Izvori({
  title = "Izvori",
  className = "",
  children,
  ...props
}: IzvoriProps) {
  return (
    <div
      className={`mdx-izvori border-l-4 border-brand-border-strong px-5 py-4 ${className}`}
      {...props}
    >
      <div className="mb-3 flex items-center gap-2">
        <BookMarked aria-hidden className={`${ICON_CLASS} text-brand-dim`} />
        <span className="text-sm font-semibold tracking-wide text-brand-dim">
          {title}
        </span>
      </div>

      <ol className="list-outside list-decimal space-y-2 pl-5 marker:font-mono marker:text-xs marker:text-brand-accent">
        {children}
      </ol>
    </div>
  );
}

export function Izvor({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={`pl-1 text-base leading-relaxed text-brand-text ${className}`}
      {...props}
    >
      {children}
    </li>
  );
}

export const mdxComponents = {
  h2: MdxH2,
  h3: MdxH3,
  h4: MdxH4,
  p: MdxP,
  a: MdxA,
  ol: MdxOL,
  ul: MdxUL,
  li: MdxLI,
  blockquote: MdxBlockquote,
  code: MdxCode,
  pre: MdxPre,
  hr: MdxHr,
  table: Table,
  th: Th,
  td: Td,
  Ref,
  Marker,
  Important,
  QuoteBox,
  Warning,
  Ucenjak,
  OpisSlike,
  Quran,
  Bible,
  ArticleLink,
  ArticleImage,
  Arapski,
  Izvori,
  Izvor,
};
