"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WheelEvent as ReactWheelEvent } from "react";
import Link from "next/link";
import { Art } from "./Art";
import { play } from "@/lib/audio";
import { handOver, prefersReducedMotion, veilIndex } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";
import type { Project } from "@/data/projects";

/** Wheel distance that advances the reel by one project. */
const STEP = 180;

/*
 * Shape of the depth effect, in projects away from the focus.
 *
 * GAP is a dead zone — the first neighbour has to clear the focused picture
 * entirely. Everything past it compresses toward the edge, and that
 * compression is what reads as depth; even spacing would just be a filmstrip.
 */
const CLEAR = 26; // breathing room between the focused picture and the next
const GAP_CEILING = 0.4; // never push the first neighbour further than this much of the width
const SPREAD = 0.46; // preferred distance to the furthest item, as a fraction of width
const COMPRESS = 0.62; // higher packs the far items tighter against the edge
const EDGE = 40; // keep the furthest thumbnail this far inside the reel
const EASE = 0.16; // how hard the reel chases the target each frame

const falloff = (d: number) => 1 - Math.exp(-COMPRESS * d);
const scaleAt = (d: number) => 1 / (1 + 2.1 * Math.pow(d, 0.45));
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The desktop project directory: the phone's depth reel turned on its side.
 * Whatever is in the middle is large and sharp; everything else shrinks, blurs,
 * greys and bunches toward the left and right edges.
 *
 * Nothing is laid out in flow and there is no scroll container. A wheel or a
 * drag moves a target, the focus eases toward it every frame, and each project
 * is placed by its distance from that focus through a saturating curve. Driving
 * it directly rather than through native scrolling is what makes the reel
 * endless for free: distance is measured around a circle, so there is no track
 * to run out of and no scroll position to wind back.
 */
export function DeskReel({ projects }: { projects: Project[] }) {
  const box = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const focus = useRef(0);
  const target = useRef(0);
  const frame = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hash } = useRoute();
  const total = projects.length;

  const paint = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const width = el.clientWidth;
    const at = focus.current;

    const first = items.current[0];
    const art = first?.querySelector<HTMLElement>(".dreel-frame");
    const artW = art?.offsetWidth || width * 0.3;

    /* Half the focused picture, half the neighbour's own picture at its reduced
       size, then a margin. Forgetting the neighbour term is what makes the two
       overlap at the shallow end. */
    const gap = Math.min(
      artW / 2 + (artW * scaleAt(1)) / 2 + CLEAR,
      width * GAP_CEILING
    );
    const edge = width / 2 - EDGE;
    const reach = Math.max(gap + 10, Math.min(Math.max(width * SPREAD, gap + 60), edge));
    const room = reach - gap;
    const visible = room > 140 ? 4.5 : room > 70 ? 3.5 : 2.5;

    items.current.forEach((node, i) => {
      if (!node) return;
      /* Distance around a circle rather than along a line, so the list wraps
         instead of running out. */
      let d = (((i - at) % total) + total) % total;
      if (d > total / 2) d -= total;
      const away = Math.abs(d);

      if (away > visible) {
        node.style.opacity = "0";
        node.style.visibility = "hidden";
        return;
      }
      node.style.visibility = "visible";

      const x =
        Math.sign(d) * (gap * Math.min(away, 1) + room * falloff(Math.max(0, away - 1)));

      node.style.transform = `translate3d(${x.toFixed(2)}px, -50%, 0)`;
      node.style.opacity = clamp01(1 / (1 + 0.45 * away)).toFixed(3);
      node.style.zIndex = String(Math.round(100 - away * 10));

      const picture = node.querySelector<HTMLElement>(".dreel-art");
      if (picture) {
        picture.style.transform = `scale(${scaleAt(away).toFixed(4)})`;
        picture.style.filter = `blur(${Math.min(7, 2.8 * away).toFixed(2)}px) grayscale(${clamp01(0.85 * away).toFixed(2)})`;
      }
      // The caption belongs to whatever is in the middle.
      node.style.setProperty("--meta", clamp01(1 - away * 2.4).toFixed(3));
    });
  }, [total]);

  /** Ease the focus toward the target, one frame at a time. */
  const run = useCallback(() => {
    const gap = target.current - focus.current;
    if (Math.abs(gap) < 0.0005) {
      focus.current = target.current;
      frame.current = 0;
      paint();
      return;
    }
    focus.current += gap * EASE;
    paint();
    frame.current = requestAnimationFrame(run);
  }, [paint]);

  const nudge = useCallback(
    (by: number, snap = true) => {
      target.current += by;
      if (prefersReducedMotion()) focus.current = target.current;
      if (!frame.current) frame.current = requestAnimationFrame(run);

      /* Come to rest on a project rather than between two. The timer restarts
         on every wheel tick, so the snap happens once the hand stops. */
      if (settle.current) clearTimeout(settle.current);
      if (snap) {
        settle.current = setTimeout(() => {
          target.current = Math.round(target.current);
          if (!frame.current) frame.current = requestAnimationFrame(run);
        }, 110);
      }
    },
    [run]
  );

  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      // A wheel-only mouse has no horizontal axis, so map whichever is larger.
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      nudge(delta / STEP);
    },
    [nudge]
  );

  useEffect(() => {
    paint();
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nudge(1);
      else if (e.key === "ArrowLeft") nudge(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      if (frame.current) cancelAnimationFrame(frame.current);
      if (settle.current) clearTimeout(settle.current);
    };
  }, [paint, nudge]);

  /** Dragging the reel sideways, for anyone without a horizontal wheel. */
  const drag = useRef<{ x: number; from: number } | null>(null);

  return (
    <div
      ref={box}
      className="dreel"
      onWheel={onWheel}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        drag.current = { x: e.clientX, from: target.current };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const el = box.current;
        if (!el) return;
        target.current = d.from - (e.clientX - d.x) / (el.clientWidth * 0.3);
        if (!frame.current) frame.current = requestAnimationFrame(run);
      }}
      onPointerUp={() => {
        if (drag.current) nudge(0);
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
    >
      <div className="dreel-stage">
        {projects.map((p, i) => (
          <Link
            key={p.slug}
            href={`/work/${p.slug}/${hash}`}
            className="dreel-item"
            ref={(el) => {
              items.current[i] = el;
            }}
            onClick={(e) => {
              /* Clicking something off to the side brings it to the middle;
                 only the project already in the middle opens. */
              let d = (((i - focus.current) % total) + total) % total;
              if (d > total / 2) d -= total;
              if (Math.abs(d) > 0.5) {
                e.preventDefault();
                play("nav");
                nudge(d);
                return;
              }
              play("project");
              handOver(p.slug, e.currentTarget.querySelector(".dreel-art") ?? e.currentTarget);
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              if (prefersReducedMotion()) return;
              veilIndex(null);
            }}
          >
            <span className="dreel-frame">
              <span className="dreel-art">
                <Art img={p.hero} tone={p.tone} alt={p.title} sizes="34vw" playAbove={520} />
              </span>
            </span>
            <span className="dreel-meta">
              <span className="dreel-count">
                {String(i + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
              </span>
              <span className="dreel-title">{p.title}</span>
              <span className="dreel-sub">{p.blurb}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
