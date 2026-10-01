"use client";

import { useEffect, useRef, useState } from "react";
import type { Img } from "@/data/types";

/** Under this rendered width the small rendition is used instead of the full one. */
const SMALL_UNDER = 480;

/**
 * Every picture on the site goes through here.
 *
 * A plain <img>, not next/image: the site is a static export, so `unoptimized`
 * is on and next/image would emit a bare src with no srcset — it cannot use the
 * ladder the content build produces. Doing it by hand gives a correct srcset,
 * and the blur placeholder rides underneath as a background until the file
 * paints. Lazy loading and the width/height reservation are kept either way.
 *
 * Anything that moves — a video file or an animated GIF — is served as video so
 * playback can be controlled. The still becomes its poster, and the clip rewinds
 * and plays from the start whenever it comes on screen, rather than being joined
 * half way through a loop it has been running off screen.
 */
export function Art({
  img,
  tone,
  alt,
  sizes,
  priority = false,
  playAbove = 0,
  quality = "auto",
}: {
  img: Img | null;
  tone: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /**
   * Rendered width, in px, below which an ambient clip stays a still. Default 0
   * so a video moves whenever it is on screen. Raise it where a thumbnail is too
   * small to be worth decoding — the list view, or the receding neighbours in
   * the phone reel.
   */
  playAbove?: number;
  /**
   * Which rendition to fetch. "auto" measures the element, which is right for a
   * tile but wrong anywhere the element is animating: the project hero starts
   * pinned at the size of the tile it flew out of, so measuring it picks the
   * small file and keeps it. Those callers say "full" outright.
   */
  quality?: "auto" | "full" | "small";
}) {
  const box = useRef<HTMLSpanElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  const [measuredSmall, setMeasuredSmall] = useState<boolean | null>(null);
  const small =
    quality === "auto" ? measuredSmall : quality === "small";

  const clip = img?.video;

  useEffect(() => {
    const el = box.current;
    if (!clip || !el) return;

    let onScreen = false;
    let wideEnough = el.getBoundingClientRect().width >= playAbove;
    const settle = () => setLive(onScreen && wideEnough);

    // Two signals: intersection alone misses a tile growing under the cursor,
    // and size alone would keep clips running off screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        settle();
      },
      { threshold: 0.25 }
    );
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      wideEnough = w >= playAbove;
      // Latches downward only. Swapping the file mid-playback restarts the
      // clip, so once the full rendition is chosen it is kept — but a hero
      // opens at its grid-tile size, and that first narrow measurement must
      // not pin it to the small file for the rest of its life.
      setMeasuredSmall((chosen: boolean | null) =>
        chosen === false ? false : w < SMALL_UNDER
      );
      settle();
    });

    io.observe(el);
    ro.observe(el);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, [clip, playAbove]);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (live) {
      // Rewind first: a clip should be watched from the start, not joined
      // part-way through because it was looping while off screen.
      el.currentTime = 0;
      // Autoplay can still be refused (iOS Low Power Mode); the poster stays.
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [live]);

  if (!img) {
    return <span className={`block h-full w-full bg-gradient-to-br ${tone}`} />;
  }

  const still = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      alt={alt}
      width={img.width}
      height={img.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        backgroundImage: `url("${img.blur}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );

  if (!clip) {
    return (
      <span ref={box} className="absolute inset-0 block">
        {still}
      </span>
    );
  }

  return (
    <span ref={box} className="absolute inset-0 block">
      {still}
      <video
        ref={video}
        // Waits for the first measurement so the right rendition is fetched once.
        src={small === null ? undefined : small ? clip.small : clip.src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        style={{ opacity: live ? 1 : 0 }}
      />
    </span>
  );
}
