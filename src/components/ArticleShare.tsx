import { useState } from "react";
import { Link as LinkIcon, Check, Quote, FileDown } from "lucide-react";
import { formatArticleDate } from "../utils/articleIndex";

interface ArticleShareProps {
  url: string;
  title: string;
  onPrint?: () => void;
}

/** Brand marks are not in lucide, so targets keep names only. */
const TARGET_NAMES = ["WhatsApp", "Telegram", "Facebook", "X"] as const;

const BUTTON_CLASS =
  "flex items-center gap-2 rounded-lg border border-brand-border px-4 py-2 text-sm text-brand-dim transition-colors hover:border-brand-border-strong hover:text-brand-heading";

// Networks sit one rung below the copy-link action: quiet text links so the
// row reads as one primary action plus alternatives, not five equal buttons.
const TEXT_LINK_CLASS =
  "text-sm text-brand-dim underline decoration-brand-border underline-offset-4 transition-colors hover:text-brand-accent hover:decoration-brand-accent";

export default function ArticleShare({ url, title, onPrint }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);
  const [cited, setCited] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, denied permission); the
      // other share targets still work, so fail quietly rather than throw.
    }
  };

  // Chicago-style short reference a student can paste into a paper.
  const handleCite = async () => {
    const accessed = formatArticleDate(new Date().toISOString().slice(0, 10));
    try {
      await navigator.clipboard.writeText(
        `„${title}“, ADAM — Research Database, ${url} (pristupljeno ${accessed}).`,
      );
      setCited(true);
      window.setTimeout(() => setCited(false), 2000);
    } catch {
      // Same quiet failure as the link copy above.
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets: { name: (typeof TARGET_NAMES)[number]; href: string }[] = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} — ${url}`)}`,
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  return (
    <div className="mt-16 border-t border-brand-border pt-8 print:hidden">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-brand-dim">
          Podeli
        </span>

        <button type="button" onClick={handleCopy} className={BUTTON_CLASS}>
          {copied ? (
            <>
              <Check aria-hidden className="h-4 w-4 shrink-0 text-brand-accent" />
              <span>Kopirano</span>
            </>
          ) : (
            <>
              <LinkIcon aria-hidden className="h-4 w-4 shrink-0" />
              <span>Kopiraj link</span>
            </>
          )}
        </button>

        <button type="button" onClick={handleCite} className={BUTTON_CLASS}>
          {cited ? (
            <>
              <Check aria-hidden className="h-4 w-4 shrink-0 text-brand-accent" />
              <span>Kopirano</span>
            </>
          ) : (
            <>
              <Quote aria-hidden className="h-4 w-4 shrink-0" />
              <span>Citiraj ovaj članak</span>
            </>
          )}
        </button>

        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            title="Otvara prozor za štampu — tu izaberite „Sačuvaj kao PDF“"
            className={BUTTON_CLASS}
          >
            <FileDown aria-hidden className="h-4 w-4 shrink-0" />
            <span>Štampaj / Sačuvaj kao PDF</span>
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {targets.map((target) => (
          <a
            key={target.name}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Podeli na ${target.name}`}
            className={TEXT_LINK_CLASS}
          >
            {target.name}
          </a>
        ))}
      </div>
    </div>
  );
}
