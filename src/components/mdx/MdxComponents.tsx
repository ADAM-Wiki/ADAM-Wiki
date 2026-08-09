import { useState } from "react";
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
  Image as ImageIcon,
} from "lucide-react";
import ArticleLightbox from "../ArticleLightbox";
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
        className={`scroll-mt-32 break-words font-serif text-2xl font-bold text-brand-heading sm:text-3xl [overflow-wrap:anywhere] ${className}`}
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
      className={`scroll-mt-32 flex items-center gap-3 break-words font-serif text-xl font-bold text-brand-heading sm:text-2xl [overflow-wrap:anywhere] ${className}`}
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
      className={`scroll-mt-32 break-words font-serif text-lg font-semibold text-brand-heading sm:text-xl [overflow-wrap:anywhere] ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}

export function MdxP({ className = "", children, ...props }: ParagraphProps) {
  return (
    <p
      className={`font-lexend text-lg leading-relaxed text-brand-text ${className}`}
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
      className={`border-l-2 border-brand-border-strong pl-5 font-lexend text-lg italic leading-relaxed text-brand-dim ${className}`}
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

export function MdxHr({ className = "", ...props }: HTMLAttributes<HTMLHRElement>) {
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
    <th className="border-b border-brand-border px-5 py-3 text-left text-sm font-semibold tracking-wide text-brand-accent">
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

export function ArticleImage({
  src = "",
  alt = "",
  caption = "",
  className = "",
  ...props
}: ArticleImageProps) {
  const [open, setOpen] = useState(false);
  const finalCaption =
    caption ||
    alt ||
    src
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ||
    "";

  return (
    <>
      <div className="my-4">
        <img
          src={src}
          alt={alt || finalCaption || "slika"}
          loading="lazy"
          decoding="async"
          onClick={() => setOpen(true)}
          className={`w-full cursor-pointer rounded-lg transition-opacity hover:opacity-90 ${className}`}
          {...props}
        />
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
      className={`border-l-4 border-brand-border-strong px-5 py-4 ${className}`}
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
