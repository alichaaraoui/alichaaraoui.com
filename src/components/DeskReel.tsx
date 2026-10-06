"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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
 * Shape of the helix. Projects sit on a cylinder that climbs as it turns, so
 * stepping through the list both rotates the drum and rises along it — the
 * combination is what reads as a spiral rather than a carousel or a stack.
 */
const ARC = 0.62; // radians of turn per project
const RISE = 0.34; // climb per project, as a fraction of the picture's height
const RADIUS = 0.85; // widest radius, as a fraction of the picture's width
const TILT = 0.55; // how much each picture turns with the drum; 1 is fully tangent
const DEPTH = 1150; // perspective distance in px — lower is a wider-angle lens

/*
 * A cylinder closes on itself: turn far enough and the projects come back round
 * to the front, which stops the spiral ever feeling deep. So the helix tapers
 * instead — each step a little smaller and a little further back, converging on
 * a vanishing point it never reaches.
 */
const TAPER = 0.84; // how much the radius and the climb shrink per step back
const RECEDE = 100; // px further into the screen per step back

/* The list is laid round the helix this many times, so there is always
   something in the far distance rather than an abrupt end to the spiral. */
const REPEATS = 2;

/* The focused picture is sized off the rail's HEIGHT, not its column width: at
   full column width it ate the rail and left the spiral nowhere to turn. */
const FRAME = 0.44; // focused picture height, as a fraction of the rail
const FRAME_AR = 1.5;

/* A critically damped spring. A linear chase crawls the last few pixels and
   never quite arrives; this carries speed into the move and settles. */
const STIFF = 0.14;
const DAMP = 0.76;
const REST = 0.0004;

/* Perspective does the shrinking now, so there is no scale curve to tune. */
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

  /* The same projects laid round the helix REPEATS times. One pass round and
     the spiral simply stops; two and there is always something further back. */
  const ring = useMemo(
    () =>
      Array.from({ length: total * REPEATS }, (_, k) => ({
        p: projects[k % total],
        key: `${projects[k % total].slug}-${Math.floor(k / total)}`,
      })),
    [projects, total]
  );

  const paint = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const height = el.clientHeight;
    const at = focus.current;

    const frameW = Math.min(el.clientWidth * 0.42, height * FRAME * FRAME_AR);
    el.style.setProperty("--dreel-w", `${frameW.toFixed(1)}px`);
    el.style.setProperty("--dreel-depth", `${DEPTH}px`);

    const frameH = frameW / FRAME_AR;
    const radius = frameW * RADIUS;
    const rise = frameH * RISE;
    const span = total * REPEATS;

    const visible = Math.min(9, span / 2);

    items.current.forEach((node, i) => {
      if (!node) return;
      /* Distance measured around the whole laid-out ring, so whichever copy of
         a project is nearest the front is the one drawn. */
      let d = (((i - at) % span) + span) % span;
      if (d > span / 2) d -= span;
      const away = Math.abs(d);

      if (away > visible) {
        node.style.opacity = "0";
        node.style.visibility = "hidden";
        return;
      }
      node.style.visibility = "visible";

      const angle = d * ARC;
      const taper = Math.pow(TAPER, away);
      const x = radius * taper * Math.sin(angle);
      /* The climb converges: each step adds less than the one before, so the far
         end gathers toward a point instead of marching off the screen. */
      const y = Math.sign(d) * rise * ((1 - taper) / (1 - TAPER));
      // Straight back, never round to the front again.
      const z = -away * RECEDE;

      /* Both the turn and the size taper with distance. Without that the angle
         keeps winding — far enough back a picture has turned a full circle and
         faces the camera again at nearly full width, which reads as the spiral
         coming apart rather than receding. */
      node.style.transform =
        `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px)` +
        ` rotateY(${(-angle * TILT * taper).toFixed(4)}rad) scale(${taper.toFixed(4)})`;
      /* Thins out over the whole visible run rather than falling away in the
         first couple of steps — the far end should fade, not switch off. */
      node.style.opacity = clamp01(1 - away / (visible + 2.5)).toFixed(3);

      const picture = node.querySelector<HTMLElement>(".dreel-art");
      if (picture) {
        picture.style.filter = `blur(${Math.min(6, 0.85 * away).toFixed(2)}px) grayscale(${clamp01(0.42 * away).toFixed(2)})`;
      }

      /* The caption and the brackets belong to whatever is at the front, and
         fade faster than the picture so they never double up. */
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
    [start],
  );

  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      const delta =
        Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      nudge(delta / STEP);
    },
    [nudge],
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
        <div className="dreel-drum">
          {ring.map(({ p, key }, i) => (
            <Link
              key={key}
              href={`/work/${p.slug}/${hash}`}
              className="dreel-item"
              ref={(el) => {
                items.current[i] = el;
              }}
              onClick={(e) => {
                /* Clicking something off to the side brings it to the middle;
                 only the project already in the middle opens. */
                const span = total * REPEATS;
                let d = (((i - focus.current) % span) + span) % span;
                if (d > span / 2) d -= span;
                if (Math.abs(d) > 0.5) {
                  e.preventDefault();
                  play("nav");
                  nudge(d);
                  return;
                }
                play("project");
                handOver(
                  p.slug,
                  e.currentTarget.querySelector(".dreel-art") ??
                    e.currentTarget,
                );
                if (
                  e.button !== 0 ||
                  e.metaKey ||
                  e.ctrlKey ||
                  e.shiftKey ||
                  e.altKey
                )
                  return;
                if (prefersReducedMotion()) return;
                veilIndex(null);
              }}
            >
              <span className="dreel-frame">
                <span className="dreel-art">
                  <Art
                    img={p.hero}
                    tone={p.tone}
                    alt={p.title}
                    sizes="30vw"
                    playAbove={520}
                  />
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
                  {String(i + 1).padStart(2, "0")}/
                  {String(total).padStart(2, "0")}
                </span>
                <span className="dreel-title">{p.title}</span>
                <span className="dreel-sub">{p.blurb}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
