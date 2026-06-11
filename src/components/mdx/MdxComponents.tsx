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
          <div className="w-1.5 h-1.5 rotate-45 border border-white/30" />
          <div className="w-2 h-2 rotate-45 bg-brand-accent" />
          <div className="w-1.5 h-1.5 rotate-45 border border-white/30" />
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
        className={`scroll-mt-32 break-words text-4xl font-serif font-bold text-white [overflow-wrap:anywhere] ${className}`}
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
      className={`scroll-mt-32 break-words flex items-center gap-3 text-3xl font-serif font-bold text-white [overflow-wrap:anywhere] ${className}`}
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
      className={`leading-relaxed text-lg text-brand-text ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function Important({ className = "", children, ...props }: DivProps) {
  return (
    <div
      className={`border-t-4 border-[#4adf80] bg-[#172b24] px-5 py-4 rounded-lg inline-block ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-5 h-5 text-[#4adf80]" />
        <span className="font-semibold text-[#4adf80] tracking-wide">
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
      className={`border-t-4 border-teal-500/50 bg-teal-500/5 text-brand-text px-5 py-4 rounded-lg inline-block ${className}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-5 h-5 text-teal-400/70" />
        <span className="font-semibold text-teal-400 tracking-wide">
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
      className={`border-t-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 rounded-lg inline-block ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2 mb-2">
        <Quote className="w-5 h-5 text-brand-dim" />
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Warning({ className = "", children, ...props }: DivProps) {
  return (
    <div
      className={`border-t-4 px-5 py-4 rounded-lg inline-block ${className}`}
      style={{
        borderColor: "#ffd44a",
        backgroundColor: "#2b2717",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-2">
        <TriangleAlert className="w-5 h-5" style={{ color: "#ffd44a" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "#ffd44a" }}
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
      className={`px-5 py-4 rounded-lg inline-block border-t-4 ${className}`}
      style={{
        borderColor: "#eab308",
        backgroundColor: "#1f1a05",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpenText className="w-5 h-5" style={{ color: "#eab308" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "#eab308" }}
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
      className={`px-5 py-4 rounded-lg inline-block border-t-4 ${className}`}
      style={{
        borderColor: "#4a9eff",
        backgroundColor: "#172038",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpenText className="w-5 h-5" style={{ color: "#4a9eff" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "#4a9eff" }}
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
      className={`px-5 py-4 rounded-lg inline-block border-t-4 ${className}`}
      style={{
        borderColor: "#ff6b6b",
        backgroundColor: "#2b1717",
      }}
      {...props}
    >
      <div className="flex items-center gap-2 mb-3">
        <BookOpenText className="w-5 h-5" style={{ color: "#ff6b6b" }} />
        <span
          className="font-semibold text-sm tracking-wide"
          style={{ color: "#ff6b6b" }}
        >
          {reference}
        </span>
      </div>
      <div className="leading-relaxed text-brand-text">{children}</div>
    </div>
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
        className={`border-t-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 rounded-lg inline-block ${className}`}
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
};
