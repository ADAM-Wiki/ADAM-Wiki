import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, RotateCcw, X } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface ArticleLightboxProps {
  url: string;
  caption: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;
/** Where a double-tap lands, and one press of the zoom button. */
const STEP = 1.6;
const DOUBLE_TAP_SCALE = 2.5;

interface Point {
  x: number;
  y: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Full-screen image viewer with zoom and pan.
 *
 * The scans this opens are photographs of manuscript pages - the reason to
 * enlarge one is almost always to read Arabic set at a few pixels tall, which
 * fit-to-screen cannot show. So the viewer zooms to 8x and pans, by pinch,
 * wheel, drag, double-tap, buttons or keyboard.
 *
 * Written against Pointer Events rather than a pan/zoom dependency: pointers
 * unify mouse, touch and pen, so one set of handlers covers a two-finger pinch
 * on a phone and a drag with a mouse, and the whole behaviour is about a
 * hundred lines.
 *
 * Every gesture has a non-gesture equivalent - the toolbar and the keyboard
 * both drive the same zoom - because a pinch is unavailable to anyone using a
 * keyboard, and undiscoverable to plenty of people who are not.
 */
export default function ArticleLightbox({
  url,
  caption,
  onClose,
}: ArticleLightboxProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  // Animate button and keyboard zooming, but never a live gesture - a
  // transition during a drag lags the finger.
  const [smooth, setSmooth] = useState(false);

  /** Live pointers, keyed by pointerId; two of them means a pinch. */
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ distance: number; scale: number } | null>(null);
  const pan = useRef<{ start: Point; offset: Point } | null>(null);
  /** Distinguishes a drag from a click, so panning does not close the viewer. */
  const dragged = useRef(false);

  useFocusTrap(true, overlayRef);

  /**
   * Keeps the image overlapping the stage.
   *
   * Beyond this the picture could be flung off-screen entirely, leaving an
   * empty overlay and no obvious way back short of closing it.
   */
  const clampOffset = useCallback((next: Point, atScale: number): Point => {
    const stage = stageRef.current;
    const image = imageRef.current;
    if (!stage || !image) return next;

    // offsetWidth is the laid-out size, unaffected by the transform.
    const overflowX = Math.max(
      0,
      (image.offsetWidth * atScale - stage.clientWidth) / 2,
    );
    const overflowY = Math.max(
      0,
      (image.offsetHeight * atScale - stage.clientHeight) / 2,
    );

    return {
      x: clamp(next.x, -overflowX, overflowX),
      y: clamp(next.y, -overflowY, overflowY),
    };
  }, []);

  /**
   * Zooms about a fixed point, so whatever is under the cursor or between the
   * fingers stays there. Zooming about the centre instead would slide the word
   * being read out from under the reader on every step.
   */
  const zoomAround = useCallback(
    (nextScale: number, focus: Point | null, animate = false) => {
      const stage = stageRef.current;
      const target = clamp(nextScale, MIN_SCALE, MAX_SCALE);

      setSmooth(animate);

      setScale((current) => {
        setOffset((currentOffset) => {
          if (target === MIN_SCALE) return { x: 0, y: 0 };
          if (!stage) return currentOffset;

          const rect = stage.getBoundingClientRect();
          const point = focus ?? {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };

          // Relative to the stage centre, which is the transform origin.
          const fx = point.x - rect.left - rect.width / 2;
          const fy = point.y - rect.top - rect.height / 2;
          const ratio = target / current;

          return clampOffset(
            {
              x: fx - (fx - currentOffset.x) * ratio,
              y: fy - (fy - currentOffset.y) * ratio,
            },
            target,
          );
        });

        return target;
      });
    },
    [clampOffset],
  );

  const reset = useCallback(() => {
    setSmooth(true);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          onClose();
          return;
        case "+":
        case "=":
          event.preventDefault();
          zoomAround(scale * STEP, null, true);
          return;
        case "-":
        case "_":
          event.preventDefault();
          zoomAround(scale / STEP, null, true);
          return;
        case "0":
          event.preventDefault();
          reset();
          return;
      }

      // Arrow keys pan once there is somewhere to pan to; below that the
      // browser's own scrolling is not wanted here either.
      const nudge = 60;
      const moves: Record<string, Point> = {
        ArrowLeft: { x: nudge, y: 0 },
        ArrowRight: { x: -nudge, y: 0 },
        ArrowUp: { x: 0, y: nudge },
        ArrowDown: { x: 0, y: -nudge },
      };
      const move = moves[event.key];
      if (!move) return;

      event.preventDefault();
      if (scale === MIN_SCALE) return;

      setSmooth(true);
      setOffset((current) =>
        clampOffset({ x: current.x + move.x, y: current.y + move.y }, scale),
      );
    };

    document.addEventListener("keydown", onKeyDown);

    // Stop the article scrolling behind the overlay.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, scale, zoomAround, reset, clampOffset]);

  /**
   * Wheel zooms rather than scrolls.
   *
   * Registered by hand because React's onWheel is passive, and a passive
   * listener cannot preventDefault - so the page behind would scroll and, on a
   * trackpad pinch, the whole browser would zoom.
   */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY / 320);
      zoomAround(scale * factor, { x: event.clientX, y: event.clientY });
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [scale, zoomAround]);

  const distanceBetween = (a: Point, b: Point) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  const midpointOf = (a: Point, b: Point): Point => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });

  const handlePointerDown = (event: React.PointerEvent) => {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    dragged.current = false;

    const active = [...pointers.current.values()];

    if (active.length === 2) {
      pinch.current = {
        distance: distanceBetween(active[0], active[1]),
        scale,
      };
      pan.current = null;
    } else if (active.length === 1 && scale > MIN_SCALE) {
      pan.current = {
        start: { x: event.clientX, y: event.clientY },
        offset,
      };
    }
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!pointers.current.has(event.pointerId)) return;

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const active = [...pointers.current.values()];

    if (active.length === 2 && pinch.current) {
      dragged.current = true;
      const distance = distanceBetween(active[0], active[1]);
      const ratio = distance / pinch.current.distance;
      zoomAround(pinch.current.scale * ratio, midpointOf(active[0], active[1]));
      return;
    }

    if (active.length === 1 && pan.current) {
      const dx = event.clientX - pan.current.start.x;
      const dy = event.clientY - pan.current.start.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragged.current = true;

      setSmooth(false);
      setOffset(
        clampOffset(
          { x: pan.current.offset.x + dx, y: pan.current.offset.y + dy },
          scale,
        ),
      );
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);

    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) pan.current = null;

    // A click on the backdrop closes; a pan that ended over it does not.
    if (
      !dragged.current &&
      event.target === stageRef.current &&
      pointers.current.size === 0
    ) {
      onClose();
    }
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    const focus = { x: event.clientX, y: event.clientY };
    if (scale > MIN_SCALE) reset();
    else zoomAround(DOUBLE_TAP_SCALE, focus, true);
  };

  if (typeof document === "undefined") return null;

  const zoomed = scale > MIN_SCALE;
  const percent = Math.round(scale * 100);

  const toolButton =
    "flex h-11 w-11 items-center justify-center rounded-lg border border-brand-border bg-brand-surface text-brand-dim transition-colors hover:border-brand-border-strong hover:text-brand-heading disabled:cursor-not-allowed disabled:opacity-40";

  // Rendered into <body> rather than in place. The lightbox is emitted inside
  // the article, whose `space-y-8` spacing puts a 32px bottom margin on every
  // child - and on a position:fixed element with top:0 and bottom:0 that margin
  // is subtracted from the resolved height, leaving a strip of the page visible
  // along the bottom. A portal also keeps the overlay immune to any ancestor
  // transform or overflow, both of which would otherwise break `fixed`.
  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] m-0 flex flex-col overscroll-contain bg-brand-overlay backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={caption || "Slika"}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 p-4">
        <span
          className="font-mono text-xs uppercase tracking-widest text-brand-dim"
          aria-live="polite"
        >
          {percent}%
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => zoomAround(scale / STEP, null, true)}
            disabled={scale <= MIN_SCALE}
            aria-label="Umanji"
            className={toolButton}
          >
            <ZoomOut aria-hidden className="h-4 w-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => zoomAround(scale * STEP, null, true)}
            disabled={scale >= MAX_SCALE}
            aria-label="Uvećaj"
            className={toolButton}
          >
            <ZoomIn aria-hidden className="h-4 w-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={!zoomed}
            aria-label="Vrati na početnu veličinu"
            className={toolButton}
          >
            <RotateCcw aria-hidden className="h-4 w-4 shrink-0" />
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori sliku"
            className={toolButton}
          >
            <X aria-hidden className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>

      {/* touch-none: the browser's own pinch and pan would otherwise zoom the
          whole page instead of the picture. */}
      <div
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        className={`flex flex-1 touch-none items-center justify-center overflow-hidden px-4 ${
          zoomed ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
        }`}
      >
        <img
          ref={imageRef}
          src={url}
          alt={caption}
          draggable={false}
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transition: smooth ? "transform 180ms ease-out" : "none",
            willChange: "transform",
          }}
          className="max-h-full w-auto max-w-full select-none rounded-xl object-contain"
        />
      </div>

      <div className="shrink-0 px-4 pb-5 pt-3 text-center">
        {caption && (
          <p className="text-sm text-brand-dim">{caption}</p>
        )}
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-brand-dim/70">
          <span className="hidden sm:inline">
            Točkić ili dvoklik za uvećanje · prevlačenje za pomeranje · +/− ·
            esc
          </span>
          <span className="sm:hidden">
            Dvostruki dodir ili dva prsta za uvećanje
          </span>
        </p>
      </div>
    </div>,
    document.body,
  );
}
