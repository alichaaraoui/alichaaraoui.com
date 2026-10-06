"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WheelEvent as ReactWheelEvent } from "react";
import Link from "next/link";
import { Art } from "./Art";
import { NoteBody } from "./NoteTile";
import { play } from "@/lib/audio";
import { handOver, prefersReducedMotion, veilIndex } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";
import { notes, type Project } from "@/data/projects";

/** Wheel distance that advances the reel by one project. */
const STEP = 190;

/*
 * Shape of the depth effect, in projects away from the focus.
 *
 * GAP is a dead zone — the first neighbour has to clear the focused picture and
 * its brackets. Everything past it compresses toward the edge, and that
 * compression is what reads as depth; even spacing would just be a list.
 */
const CLEAR = 30; // room between the focused picture and the next one
const GAP_CEILING = 0.46; // never push the first neighbour further than this much of the height
/* The focused picture is sized off the rail's HEIGHT, not its column width: at
   full column width it ate half the rail and left the neighbours nowhere to go,
   so the gap hit its ceiling and the caption landed on the next thumbnail. */
const FRAME = 0.36; // focused picture height, as a fraction of the rail
const FRAME_AR = 1.5;
const SPREAD = 0.47; // preferred distance to the furthest item, as a fraction of height
const COMPRESS = 0.62; // higher packs the far items tighter against the edge
const EDGE = 28; // keep the furthest thumbnail this far inside the reel

/* A critically damped spring. The old linear chase crawled the last few pixels
   and never quite arrived; this carries speed into the move and settles. */
const STIFF = 0.14;
const DAMP = 0.76;
const REST = 0.0004;

const falloff = (d: number) => 1 - Math.exp(-COMPRESS * d);
const scaleAt = (d: number) => 1 / (1 + 1.9 * Math.pow(d, 0.5));
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * The desktop project directory: the phone's depth reel, run down the right
 * side of the screen with the introduction beside it. Whatever is in the middle
 * is large and sharp; everything else shrinks, blurs, greys and bunches toward
 * the top and bottom edges.
 *
 * Nothing is laid out in flow and there is no scroll container. A wheel or a
 * drag moves a target, a spring carries the focus toward it, and each project
 * is placed by its distance from that focus. Driving it directly rather than
 * through native scrolling is what makes the reel endless for free: distance is
 * measured around a circle, so there is no track to run out of and no scroll
 * position to wind back.
 */
export function DeskReel({ projects }: { projects: Project[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const focus = useRef(0);
  const target = useRef(0);
  const vel = useRef(0);
  const frame = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hash } = useRoute();
  const total = projects.length;

  const paint = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const height = el.clientHeight;
    const at = focus.current;

    el.style.setProperty(
      "--dreel-w",
      `${Math.min(el.clientWidth, height * FRAME * FRAME_AR).toFixed(1)}px`
    );

    const first = items.current[0];
    const px = (sel: string) => {
      const el = first?.querySelector(sel);
      return el instanceof HTMLElement ? el.offsetHeight : 0;
    };
    const artH = px(".dreel-frame") || height * 0.32;
    const metaH = px(".dreel-meta");

    /* Half the focused picture, its caption, half the neighbour's own picture
       at its reduced size, then a margin. Both the caption and the neighbour
       term are easy to forget, and each one on its own puts the title on top of
       the next thumbnail. */
    const gap = Math.min(
      artH / 2 + metaH + (artH * scaleAt(1)) / 2 + CLEAR,
      height * GAP_CEILING
    );
    const edge = height / 2 - EDGE;
    const reach = Math.max(gap + 10, Math.min(Math.max(height * SPREAD, gap + 60), edge));
    const room = reach - gap;
    const visible = room > 120 ? 4.5 : room > 60 ? 3.5 : 2.5;

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

      const y =
        Math.sign(d) * (gap * Math.min(away, 1) + room * falloff(Math.max(0, away - 1)));

      node.style.transform = `translate3d(-50%, calc(-50% + ${y.toFixed(2)}px), 0)`;
      node.style.opacity = clamp01(1 / (1 + 0.5 * away)).toFixed(3);
      node.style.zIndex = String(Math.round(100 - away * 10));

      const picture = node.querySelector<HTMLElement>(".dreel-art");
      if (picture) {
        picture.style.transform = `scale(${scaleAt(away).toFixed(4)})`;
        picture.style.filter = `blur(${Math.min(6, 2.4 * away).toFixed(2)}px) grayscale(${clamp01(0.8 * away).toFixed(2)})`;
      }
      /* The caption and the brackets belong to whatever is in the middle, and
         fade out faster than the picture does so they never double up. */
      node.style.setProperty("--meta", clamp01(1 - away * 2.6).toFixed(3));
    });
  }, [total]);

  /** Carry the focus toward the target on a spring, one frame at a time. */
  const run = useCallback(() => {
    const gap = target.current - focus.current;
    vel.current = (vel.current + gap * STIFF) * DAMP;
    focus.current += vel.current;

    if (Math.abs(gap) < REST && Math.abs(vel.current) < REST) {
      focus.current = target.current;
      vel.current = 0;
      frame.current = 0;
      paint();
      return;
    }
    paint();
    frame.current = requestAnimationFrame(run);
  }, [paint]);

  const start = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(run);
  }, [run]);

  const nudge = useCallback(
    (by: number, snap = true) => {
      target.current += by;
      if (prefersReducedMotion()) {
        focus.current = target.current;
        vel.current = 0;
      }
      start();

      /* Come to rest on a project rather than between two. The timer restarts
         on every wheel tick, so the snap happens once the hand stops. */
      if (settle.current) clearTimeout(settle.current);
      if (snap) {
        settle.current = setTimeout(() => {
          target.current = Math.round(target.current);
          start();
        }, 120);
      }
    },
    [start]
  );

  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
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
      if (e.key === "ArrowDown") nudge(1);
      else if (e.key === "ArrowUp") nudge(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      if (frame.current) cancelAnimationFrame(frame.current);
      if (settle.current) clearTimeout(settle.current);
    };
  }, [paint, nudge]);

  /** Dragging the reel, for anyone without a wheel. */
  const drag = useRef<{ y: number; from: number } | null>(null);

  return (
    <div className="dreel">
      <div className="dreel-side">
        <div className="dreel-intro">
          {notes.map((n) => (
            <NoteBody key={n.id} note={n} />
          ))}
        </div>
        {/* Art goes here. Drop the pieces in as children of .dreel-plate and
            they will stack under the introduction. */}
        <div className="dreel-plate" />
      </div>

      <div
        ref={rail}
        className="dreel-rail"
        onWheel={onWheel}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { y: e.clientY, from: target.current };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const el = rail.current;
          if (!d || !el) return;
          target.current = d.from - (e.clientY - d.y) / (el.clientHeight * 0.3);
          start();
        }}
        onPointerUp={() => {
          if (drag.current) nudge(0);
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
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
                <Art img={p.hero} tone={p.tone} alt={p.title} sizes="30vw" playAbove={520} />
              </span>
              <span className="dreel-brackets" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
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
