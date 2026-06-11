// renders every [H2], [QUOTE], [IMAGE] etc.

import {
  Info,
  Quote,
  Link as LinkIcon,
  TriangleAlert,
  BookOpenText,
} from "lucide-react";

import type { LightboxData } from "../utils/articleTypes";


interface ArticleContentRendererProps {
  content: string[];
  slugifyHeading: (text: string) => string;
  headingRefs: React.MutableRefObject<Record<string, HTMLElement | null>>;
  setLightboxData: React.Dispatch<React.SetStateAction<LightboxData | null>>;
}

export default function ArticleContentRenderer({
  content,
  slugifyHeading,
  headingRefs,
  setLightboxData,
}: ArticleContentRendererProps) {
  return (
    <article className="prose prose-invert max-w-none space-y-8">
      {content.map((paragraph, index) => {
        if (paragraph.startsWith("[H2]")) {
  const text = paragraph.replace("[H2]", "").trim();
  const id = slugifyHeading(text);

  return (
    <div key={index} className="space-y-6">
      {index > 0 && <div className="h-px w-full bg-[var(--color-brand-muted)]/70" />}

      <h2
        id={id}
        ref={(el) => {
          headingRefs.current[id] = el;
        }}
        className="scroll-mt-32 break-words text-2xl font-serif font-medium text-white [overflow-wrap:anywhere]"
      >
        {text}
      </h2>
    </div>
  );
}

          if (paragraph.startsWith("[H3]")) {
            const text = paragraph.replace("[H3]", "").trim();
            const id = slugifyHeading(text);

            return (
              <h3
                key={index}
                id={id}
                ref={(el) => {
                  headingRefs.current[id] = el;
                }}
                className="scroll-mt-32 break-words flex items-center gap-3 text-2xl font-serif font-medium text-white [overflow-wrap:anywhere]"
              >
                <span className="shrink-0 w-1.5 h-1.5 rotate-45 bg-[var(--color-brand-accent)] " />
                {text}
              </h3>
            );
          }

        if (paragraph.startsWith("[IMPORTANT]")) {
          const text = paragraph.replace("[IMPORTANT]", "").trim();

          return (
            <div
              key={index}
              className="border-t-4 border-[#4adf80] bg-[#172b24] px-5 py-4 rounded-lg inline-block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-[#4adf80]" />
                <span className="font-semibold text-[#4adf80] tracking-wide">
                  Sažetak odgovora
                </span>
              </div>
              <p className="leading-relaxed">{text}</p>
            </div>
          );
        }

        if (paragraph.startsWith("[QUOTE]")) {
          const text = paragraph.replace("[QUOTE]", "").trim();

          return (
            <div
              key={index}
              className="border-t-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 rounded-lg inline-block"
            >
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-5 h-5 text-brand-dim" />
              </div>
              <p className="leading-relaxed">{text}</p>
            </div>
          );
        }

        if (paragraph.startsWith("[WARNING]")) {
          const text = paragraph.replace("[WARNING]", "").trim();

          return (
            <div
              key={index}
              className="border-t-4 px-5 py-4 rounded-lg inline-block"
              style={{
                borderColor: "#ffd44a",
                backgroundColor: "#2b2717",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TriangleAlert
                  className="w-5 h-5"
                  style={{ color: "#ffd44a" }}
                />
                <span
                  className="font-semibold text-sm tracking-wide"
                  style={{ color: "#ffd44a" }}
                >
                  Napomena
                </span>
              </div>
              <p className="leading-relaxed">{text}</p>
            </div>
          );
        }

        if (paragraph.startsWith("[QURAN:")) {
          const fallback = paragraph.replace("[QURAN:]", "").trim();
          const match = paragraph.match(/\[QURAN:([^\]]+)\](.*)/s);
          const reference = match ? match[1].trim() : "Kur'an";
          const text = match ? match[2].trim() : fallback;

          return (
            <div
              key={index}
              className="px-5 py-4 rounded-lg inline-block border-t-4"
              style={{
                borderColor: "#4a9eff",
                backgroundColor: "#172038",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpenText
                  className="w-5 h-5"
                  style={{ color: "#4a9eff" }}
                />
                <span
                  className="font-semibold text-sm tracking-wide"
                  style={{ color: "#4a9eff" }}
                >
                  {reference}
                </span>
              </div>
              <p className="leading-relaxed">{text}</p>
            </div>
          );
        }

        if (paragraph.startsWith("[BIBLE:")) {
          const fallback = paragraph.replace("[BIBLE:]", "").trim();
          const match = paragraph.match(/\[BIBLE:([^\]]+)\](.*)/s);
          const reference = match ? match[1].trim() : "Biblija";
          const text = match ? match[2].trim() : fallback;

          return (
            <div
              key={index}
              className="px-5 py-4 rounded-lg inline-block border-t-4"
              style={{
                borderColor: "#ff6b6b",
                backgroundColor: "#2b1717",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BookOpenText
                  className="w-5 h-5"
                  style={{ color: "#ff6b6b" }}
                />
                <span
                  className="font-semibold text-sm tracking-wide"
                  style={{ color: "#ff6b6b" }}
                >
                  {reference}
                </span>
              </div>
              <p className="leading-relaxed">{text}</p>
            </div>
          );
        }

        if (paragraph.startsWith("[LINK]")) {
          const contentValue = paragraph.replace("[LINK]", "").trim();
          const [label, url] = contentValue.includes("|")
            ? contentValue.split("|")
            : [contentValue, contentValue];

          return (
            <div key={index} className="flex">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="border-t-4 border-brand-dim bg-brand-muted text-brand-text px-5 py-4 rounded-lg inline-block"
              >
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="w-5 h-5" />
                  <span className="font-semibold text-sm tracking-wide">
                    Link
                  </span>
                </div>
                <span>{label}</span>
              </a>
            </div>
          );
        }

        if (paragraph.startsWith("[IMAGE]")) {
          const contentValue = paragraph.replace("[IMAGE]", "").trim();
          const [url, caption] = contentValue.includes("|")
            ? contentValue.split("|")
            : [contentValue, ""];
          const autoCaption =
            caption || url.split("/").pop()?.replace(/\.[^.]+$/, "") || "";

          return (
            <div key={index} className="my-4">
              <img
                src={url}
                alt={autoCaption || "slika"}
                loading="lazy"
                decoding="async"
                onClick={() => setLightboxData({ url, caption: autoCaption })}
                className="rounded-lg w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
              {autoCaption && (
                <p className="text-brand-dim text-xs mt-2 text-center">
                  {autoCaption}
                </p>
              )}
            </div>
          );
        }

        return <p key={index}>{paragraph}</p>;
      })}
    </article>
  );
}