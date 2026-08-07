import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ArticleLightboxProps {
  url: string;
  caption: string;
  onClose: () => void;
}

export default function ArticleLightbox({
  url,
  caption,
  onClose,
}: ArticleLightboxProps) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // Stop the article scrolling behind the overlay.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  // Rendered into <body> rather than in place. The lightbox is emitted inside
  // the article, whose `space-y-8` spacing puts a 32px bottom margin on every
  // child - and on a position:fixed element with top:0 and bottom:0 that margin
  // is subtracted from the resolved height, leaving a strip of the page visible
  // along the bottom. A portal also keeps the overlay immune to any ancestor
  // transform or overflow, both of which would otherwise break `fixed`.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] m-0 flex items-center justify-center bg-brand-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={caption || "Slika"}
    >
      <div
        className="flex max-h-full w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt={caption}
          className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
        />

        {caption && (
          <p className="mt-4 text-center text-sm text-brand-dim">{caption}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 text-2xl text-brand-text transition-colors hover:text-brand-heading"
        aria-label="Zatvori sliku"
      >
        ×
      </button>
    </div>,
    document.body,
  );
}
