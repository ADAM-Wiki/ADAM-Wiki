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
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt={caption}
          className="w-full max-h-[85vh] object-contain rounded-xl"
        />

        {caption && (
          <p className="mt-4 text-center text-sm text-brand-dim">
            {caption}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
        aria-label="Zatvori sliku"
      >
        ×
      </button>
    </div>
  );
}