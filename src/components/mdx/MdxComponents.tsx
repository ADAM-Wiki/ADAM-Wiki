import { useState } from "react";
import type {
  HTMLAttributes,
  ImgHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";
import {
  Info,
  Quote,
  Link as LinkIcon,
  TriangleAlert,
  BookOpenText,
} from "lucide-react";
import ArticleLightbox from "../ArticleLightbox";

type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;
type DivProps = HTMLAttributes<HTMLDivElement>;
type ImageProps = ImgHTMLAttributes<HTMLImageElement>;
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export function MdxH2({ className = "", children, ...props }: HeadingProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex-1 h-[3px]"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(255,255,255,0.1))",
          }}
        />
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rotate-45 border border-brand-border-strong" />
          <div className="w-2 h-2 rotate-45 bg-brand-accent" />
          <div className="w-1.5 h-1.5 rotate-45 border border-brand-border-strong" />
        </div>
        <div
          className="flex-1 h-[3px]"
          style={{
            background:
              "linear-gradient(to left, transparent, rgba(255,255,255,0.1))",
          }}
        />
      </div>
      <h2
        className={`scroll-mt-32 break-words text-4xl font-serif font-bold text-brand-heading [overflow-wrap:anywhere] ${className}`}
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
      className={`scroll-mt-32 break-words flex items-center gap-3 text-3xl font-serif font-bold text-brand-heading [overflow-wrap:anywhere] ${className}`}
      {...props}
    >
      <span className="shrink-0 w-1.5 h-1.5 rotate-45 bg-[var(--color-brand-accent)]" />
      {children}
    </h3>
  );
}

export function MdxP({ className = "", children, ...props }: ParagraphProps) {
  return (
    <p
      className={`leading-relaxed text-lg font-lexend text-brand-text ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function Important({ className = "", children, ...props }: DivProps) {
  return (
    <div
      className={`border-l-4 border-brand-note-fg px-5 py-4 inline-block ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-5 h-5 text-brand-note-fg" />
        <span className="font-semibold text-brand-note-fg tracking-wide">
          Sažetak odgovora
        </span>
      </div>
      <div className="leading-relaxed text-brand-text">{children}</div>
    </div>
  );
}

export function OpisSlike({ className = "", children, ...props }: DivProps) {
  return (
    <div
      className={`border-l-4 border-brand-info-fg text-brand-text px-5 py-4 inline-block ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-5 h-5 text-brand-info-fg" />
        <span className="font-semibold text-brand-info-fg tracking-wide">
          Opis Slike
        </span>
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function QuoteBox({ className = "", children, ...props }: DivProps) {
  return (
    <div
      className={`border-l-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 inline-block ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 mb-2">
        <Quote className="w-5 h-5 text-brand-dim" />
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function MdxOL({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLOListElement>) {
  return (
    <ol className={`mdx-ol space-y-2.5 pl-0 list-none ${className}`} {...props}>
      {children}
    </ol>
  );
}

export function MdxLI({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLLIElement>) {
  return (
    <li
      className={`flex items-start gap-3 text-lg font-lexend text-brand-text leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </li>
  );
}

export function Warning({ className = "", children, ...props }: DivProps) {
  return (
    <div
      className={`border-l-4 px-5 py-4 inline-block ${className}`}
      style={{
        borderColor: "var(--color-brand-warn-fg)",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-2">
        <TriangleAlert className="w-5 h-5" style={{ color: "var(--color-brand-warn-fg)" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "var(--color-brand-warn-fg)" }}
        >
          Napomena
        </span>
      </div>
      <div className="leading-relaxed text-brand-text">{children}</div>
    </div>
  );
}

interface UcenjakProps extends DivProps {
  reference?: string;
  children: ReactNode;
}

export function Ucenjak({
  reference = "Ucenjak",
  className = "",
  children,
  ...props
}: UcenjakProps) {
  return (
    <div
      className={`px-5 py-4 inline-block border-l-4 ${className}`}
      style={{
        borderColor: "var(--color-brand-scholar-fg)",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpenText className="w-5 h-5" style={{ color: "var(--color-brand-scholar-fg)" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "var(--color-brand-scholar-fg)" }}
        >
          {reference}
        </span>
      </div>
      <div className="leading-relaxed text-brand-text">{children}</div>
    </div>
  );
}

interface QuranProps extends DivProps {
  reference?: string;
  children: ReactNode;
}

export function Quran({
  reference = "Kur'an",
  className = "",
  children,
  ...props
}: QuranProps) {
  return (
    <div
      className={`px-5 py-4 inline-block border-l-4 ${className}`}
      style={{
        borderColor: "var(--color-brand-quran-fg)",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpenText className="w-5 h-5" style={{ color: "var(--color-brand-quran-fg)" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "var(--color-brand-quran-fg)" }}
        >
          {reference}
        </span>
      </div>
      <div className="leading-relaxed text-brand-text">{children}</div>
    </div>
  );
}

interface BibleProps extends DivProps {
  reference?: string;
  children: ReactNode;
}

export function Bible({
  reference = "Biblija",
  className = "",
  children,
  ...props
}: BibleProps) {
  return (
    <div
      className={`px-5 py-4 inline-block border-l-4 ${className}`}
      style={{
        borderColor: "var(--color-brand-bible-fg)",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpenText className="w-5 h-5" style={{ color: "var(--color-brand-bible-fg)" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "var(--color-brand-bible-fg)" }}
        >
          {reference}
        </span>
      </div>
      <div className="leading-relaxed text-brand-text">{children}</div>
    </div>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-brand-dim/40 bg-brand-muted/20 font-lexend">
      <div className="h-px w-full bg-brand-dim/30" />
      <table className="w-full border-collapse text-sm">{children}</table>
      <div className="h-px w-full bg-brand-dim/30" />
    </div>
  );
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-r border-brand-dim/30 px-5 py-3 text-left font-semibold text-brand-accent font-semibold text-sm tracking-wide">
      {children}
    </th>
  );
}

export function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-r border-brand-dim/20 px-5 py-3 text-brand-text">
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
    <div className="flex">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`border-l-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 inline-block ${className}`}
        {...props}
      >
        <div className="flex items-center gap-2 mb-2">
          <LinkIcon className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide">Link</span>
        </div>
        <span>{children}</span>
      </a>
    </div>
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
          className={`rounded-lg w-full object-cover cursor-pointer hover:opacity-90 transition-opacity ${className}`}
          {...props}
        />
        {finalCaption && (
          <p className="text-brand-dim text-xs mt-2 text-center">
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

export const mdxComponents = {
  h2: MdxH2,
  h3: MdxH3,
  p: MdxP,
  Important,
  QuoteBox,
  Warning,
  Ucenjak,
  OpisSlike,
  Quran,
  Bible,
  ArticleLink,
  ArticleImage,
  ol: MdxOL,
  li: MdxLI,
  table: Table,
  th: Th,
  td: Td,
};
