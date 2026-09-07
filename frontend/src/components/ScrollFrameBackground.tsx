import { useEffect, useRef } from "react";

const TOTAL_FRAMES = 240;

function frameUrl(n: number) {
  return `/scroll-frames/ezgif-frame-${String(n).padStart(3, "0")}.jpg`;
}

interface Props {
  startFrame?: number;
  endFrame?: number;
  overlay?: string;
  className?: string;
  children: React.ReactNode;
}

export function ScrollFrameBackground({
  startFrame = 1,
  endFrame = TOTAL_FRAMES,
  overlay = "rgba(8,3,0,0.62)",
  className = "",
  children,
}: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const currentFrameRef = useRef(startFrame);
  const preloadedRef = useRef<Set<number>>(new Set());

  // Preload frames in idle time so they are ready before the user scrolls to them
  useEffect(() => {
    let cancelled = false;
    let i = startFrame;

    const preloadChunk = () => {
      if (cancelled) return;
      const chunkEnd = Math.min(i + 15, endFrame);
      while (i <= chunkEnd) {
        if (!preloadedRef.current.has(i)) {
          const img = new Image();
          img.src = frameUrl(i);
          preloadedRef.current.add(i);
        }
        i++;
      }
      if (i <= endFrame) {
        if (typeof requestIdleCallback !== "undefined") {
          requestIdleCallback(preloadChunk);
        } else {
          setTimeout(preloadChunk, 50);
        }
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(preloadChunk);
    } else {
      setTimeout(preloadChunk, 100);
    }

    return () => { cancelled = true; };
  }, [startFrame, endFrame]);

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    img.src = frameUrl(startFrame);

    let rafId: number;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const winH = window.innerHeight;
        // progress: 0 when bottom of viewport hits section top → 1 when top of viewport hits section bottom
        const rawProgress = (winH - rect.top) / (winH + rect.height);
        const progress = Math.max(0, Math.min(1, rawProgress));
        const frameCount = endFrame - startFrame;
        const targetFrame = startFrame + Math.round(progress * frameCount);
        if (targetFrame !== currentFrameRef.current) {
          currentFrameRef.current = targetFrame;
          img.src = frameUrl(targetFrame);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [startFrame, endFrame]);

  return (
    <div ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden
        alt=""
        style={{ zIndex: 0, transform: "scale(1.05)", transition: "none" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: overlay, zIndex: 1 }}
      />
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
