"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Art } from "./Art";
import { play } from "@/lib/audio";
import { handOver, prefersReducedMotion, veilIndex } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";
import type { Project } from "@/data/projects";

/** Scroll distance that advances the reel by one project. */
const STEP = 120;

/*
 * The reel has no end. The track holds this many copies of the list and the
 * scroll position is quietly wound back to the middle one whenever it nears an
 * edge — every position is equivalent modulo one copy, so the jump is
 * invisible. Nine copies means thousands of pixels of scrolling between winds,
 * and 9x the projects in snap points, which stays small.
 */
const CYCLES = 9;

/*
 * Shape of the depth effect. Distance is measured in projects, as a float.
 *
 * GAP is a dead zone: the first neighbour has to clear the focused picture AND
 * its captions, or the counter and title land on top of it. Everything past the
 * first neighbour then compresses toward the edge, which is what reads as depth.
 */
const CAPTION_OFFSET = 18; // matches the 1.1rem the captions sit off the picture
const CLEAR = 14; // breathing room between a caption and the next picture
const GAP_CEILING = 0.46; // never push the first neighbour further than this much of the height
const SPREAD = 0.47; // preferred distance to the furthest item, as a fraction of height
const COMPRESS = 0.7; // higher packs the far items tighter against the edge
const EDGE = 26; // keep the furthest thumbnail this far inside the reel

const falloff = (d: number) => 1 - Math.exp(-COMPRESS * d);
const scaleAt = (d: number) => 1 / (1 + 3 * Math.pow(d, 0.4));
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The phone project directory: a vertical reel where whatever is at the centre
 * is large and sharp and everything else recedes — smaller, blurred, greyed and
 * bunched toward the edges.
 *
 * Positions are not laid out in flow. A tall track supplies the scroll range, a
 * sticky stage holds the projects, and each one is placed by its distance from
 * the focus through a saturating curve — that compression is what reads as
 * depth. Even spacing would just look like a list.
 */
export function PhoneReel({ projects }: { projects: Project[] }) {
  const reel = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const { hash } = useRoute();
  const total = projects.length;

  const paint = useCallback(() => {
    const box = reel.current;
    if (!box) return;
    const focus = box.scrollTop / STEP;
    const height = box.clientHeight;

    /* The dead zone is measured, not guessed: the picture's height comes from
       the viewport WIDTH while the captions are a fixed type size, so the two
       drift apart across phones and any constant here would eventually collide. */
    const first = items.current[0];
    const px = (sel: string) => {
      const el = first?.querySelector(sel);
      return el instanceof HTMLElement ? el.offsetHeight : 0;
    };
    const artH = px(".reel-frame") || height * 0.37;
    const capH = Math.max(px(".reel-meta-top"), px(".reel-meta-bottom"));
    /* Half the focused picture, its caption, half the neighbour's own picture,
       then a margin — the neighbour term is easy to forget and is what put the
       caption underneath the next thumbnail. */
    const gap = Math.min(
      artH / 2 + CAPTION_OFFSET + capH + (artH * scaleAt(1)) / 2 + CLEAR,
      height * GAP_CEILING
    );
    /* Whatever is left between the dead zone and the edge is the room the rest
       of the reel has to work with. On a short phone that is almost nothing, so
       show fewer neighbours rather than running them off the screen. */
    const edge = height / 2 - EDGE;
    const reach = Math.max(gap + 8, Math.min(Math.max(height * SPREAD, gap + 50), edge));
    const room = reach - gap;
    const visible = room > 90 ? 4.5 : room > 45 ? 3.5 : room > 18 ? 2.5 : 1.5;

    /* The snap points sit inside the track, which begins one screen down the
       scroll content because the sticky stage occupies that much flow. Telling
       them how far to shift back is what keeps them on multiples of the step. */
    box.style.setProperty("--stage-h", `${box.clientHeight}px`);

    items.current.forEach((el, i) => {
      if (!el) return;
      /* Distance around a circle, not along a line: take whichever copy of
         this project is nearest, so the list wraps instead of running out. */
      let d = (((i - focus) % total) + total) % total;
      if (d > total / 2) d -= total;
      const away = Math.abs(d);

      if (away > visible) {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
        return;
      }
      el.style.visibility = "visible";

      const y =
        Math.sign(d) * (gap * Math.min(away, 1) + room * falloff(Math.max(0, away - 1)));
      const scale = scaleAt(away);
      const blur = Math.min(8, 3.2 * away);
      const grey = clamp01(0.85 * away);

      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
      el.style.opacity = clamp01(1 / (1 + 0.5 * away)).toFixed(3);
      el.style.zIndex = String(Math.round(100 - away * 10));

      const art = el.querySelector<HTMLElement>(".reel-art");
      if (art) {
        art.style.transform = `scale(${scale.toFixed(4)})`;
        art.style.filter = `blur(${blur.toFixed(2)}px) grayscale(${grey.toFixed(2)})`;
      }
      // Captions belong to the focused project only.
      el.style.setProperty("--meta", clamp01(1 - away * 2.2).toFixed(3));
    });
  }, [total]);

  useEffect(() => {
    const box = reel.current;
    if (!box) return;

    const cycle = total * STEP;
    // Start in the middle copy, so there is as much reel above as below.
    box.scrollTop = cycle * Math.floor(CYCLES / 2);

    /* Wind back before either edge is in reach. The shift is a whole number of
       copies, so the projects do not move — only the scrollbar does, and it is
       hidden. */
    const onScroll = () => {
      const shift = cycle * (CYCLES - 2);
      if (box.scrollTop < cycle) box.scrollTop += shift;
      else if (box.scrollTop > cycle * (CYCLES - 1)) box.scrollTop -= shift;
      paint();
    };

    paint();
    box.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint);
    /* The reel also changes height when the statement above it folds away,
       which is not a window resize — without this the depth curve stays laid
       out for the old, shorter box. */
    const ro = new ResizeObserver(paint);
    ro.observe(box);
    return () => {
      box.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
      ro.disconnect();
    };
  }, [paint, total]);

  return (
    <div className="reel" ref={reel}>
      <div className="reel-stage">
        {projects.map((p, i) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}/${hash}`}
            className="reel-item"
            ref={(el) => {
              items.current[i] = el;
            }}
            onClick={(e) => {
              play("project");
              const art = e.currentTarget.querySelector(".reel-art");
              handOver(p.slug, art ?? e.currentTarget);
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
              }
              if (prefersReducedMotion()) return;
              veilIndex(null);
            }}
          >
            <span className="reel-frame">
              <span className="reel-meta reel-meta-top">
                <span className="reel-count">
                  {String(i + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
                </span>
                <span className="reel-title">{p.title}</span>
              </span>

              <span className="reel-art">
                <Art
                  img={p.hero}
                  tone={p.tone}
                  alt={p.title}
                  sizes="90vw"
                  playAbove={200}
                />
              </span>

              <span className="reel-brackets" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>

              <span className="reel-meta reel-meta-bottom">
                <span className="reel-sub">{p.blurb}</span>
                <span className="reel-year">{p.year}</span>
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Supplies the scroll range, and one snap point per project per copy. */}
      <div
        className="reel-track"
        style={{ height: `${CYCLES * total * STEP}px` }}
      >
        {Array.from({ length: CYCLES * total }, (_, k) => (
          <i key={k} style={{ top: `calc(${k * STEP}px - var(--stage-h, 0px))` }} />
        ))}
      </div>
    </div>
  );
}
