"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CSSProperties, WheelEvent as ReactWheelEvent } from "react";
import Link from "next/link";
import { NoteBody } from "./NoteTile";
import { play } from "@/lib/audio";
import { handOver, prefersReducedMotion, veilIndex } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";
import { notes, type Project } from "@/data/projects";

/** Wheel distance that advances the reel by one project. */
const STEP = 190;

/*
 * Shape of the spiral, taken off the reference frame by frame rather than
 * guessed: the pictures are wound round an axis pointing INTO the screen, so
 * each step turns a little further round the ring, drifts outward from the
 * middle and drops further back. Perspective then pulls the far ones in toward
 * a vanishing point and shrinks them, which is what gives the spiral no end.
 *
 * The earlier version laid them along a band on a sphere. Nothing about that
 * can work: the climb and the turn pull against each other, and across a search
 * of the whole constant space there is no setting that clears nine pictures
 * inside a laptop screen.
 */
const TURN = 0.85; // radians round the ring per project — ~1.3 turns on screen
/* The ring has to be wide enough that neighbours clear each other round it:
   the chord between two of them is 2·RHO0·sin(TURN/2) picture widths, and that
   has to beat one whole picture. It is why the pictures are smaller here than
   in the reference — at the reference's size they cannot help but collide. */
const RHO0 = 1.75; // ring radius at the front, in picture widths
const GROW = 0.02; // how much the ring opens out per project
const PITCH = 0.85; // how far back each project drops, in picture widths
const DEPTH = 1100; // perspective distance in px — lower is a wider-angle lens
const NEAR = 0.9; // projects drawn in FRONT of the focused one
const FAR = 9; // and behind it, by which point they are nearly dark

/* Each panel is built from this many vertical strips, each turned a little
   further than the last, so it reads as a sheet of paper bowing in the air
   rather than a flat card. CSS cannot bend a single element in 3D; this is the
   way to fake it. */
const SLICES = 9;
const BEND = 2.4; // degrees of turn between neighbouring strips

/* The list is laid round the spiral this many times. It has to cover NEAR+FAR
   with room to spare, or the band runs out before it reaches the vanishing
   point and the spiral visibly ends. */
const REPEATS = 3;

/* The spiral never rests. A step takes about eight seconds at 60fps, slow
   enough to read as drift rather than as a carousel advancing. */
const DRIFT = 0.0021;

/* A fixed, repeatable nudge per panel, so the ring is not mechanically even.
   Deterministic, so it cannot differ between the server render and the
   browser. */
const wobble = (i: number) => Math.sin(i * 12.9898) * 0.5 + 0.5;
const WOB = 0.05; // radians of extra turn round the ring
const SPILL = 0.05; // picture widths of extra radius
const ROLL = 0.05; // radians of tilt in the picture's own plane

/* The focused picture is sized off the rail's HEIGHT, not its column width: at
   full column width it ate the rail and left the spiral nowhere to turn. */
const FRAME = 0.18;
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
  const held = useRef(false);
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

    const span = total * REPEATS;

    items.current.forEach((node, i) => {
      if (!node) return;
      /* Distance measured round the whole laid-out ring, so whichever copy of a
         project is nearest the front is the one drawn. The window is lopsided
         on purpose: a couple of projects stand in front of the focused one, and
         everything else winds away behind it. */
      let d = (((i - at) % span) + span) % span;
      if (d > span - NEAR) d -= span;

      if (d > FAR) {
        node.style.opacity = "0";
        node.style.visibility = "hidden";
        return;
      }
      node.style.visibility = "visible";

      const w = wobble(i) - 0.5;
      const turn = d * TURN + w * WOB;
      const radius = (RHO0 + d * GROW + w * SPILL) * frameW;

      const x = radius * Math.cos(turn);
      const y = radius * Math.sin(turn);
      const z = -d * PITCH * frameW;

      node.style.transform =
        `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), ${z.toFixed(2)}px)` +
        ` rotateZ(${(turn * 0.12 + w * 2 * ROLL).toFixed(4)}rad)`;

      /* Into the dark rather than off a cliff: the spiral has no end, it just
         stops being lit. */
      const away = Math.max(0, d) / FAR;
      node.style.opacity = clamp01(1.02 - Math.pow(away, 1.35)).toFixed(3);
      node.style.zIndex = String(1000 - Math.round(d * 20));

      /* The caption belongs to whatever is at the front. */
      node.style.setProperty("--meta", clamp01(1 - Math.abs(d) * 2.6).toFixed(3));
    });
  }, [total]);

  /*
   * Carry the focus toward the target on a spring, and move the target on by a
   * hair every frame. The loop never ends — the spiral is always turning, and a
   * wheel or a drag just shoves it along faster.
   */
  const run = useCallback(() => {
    /* Something that moves forever and was never asked to is exactly what the
       reduced-motion preference is about, so the drift stops for it. The reel
       still answers a wheel or a drag. */
    if (!held.current && !prefersReducedMotion()) target.current += DRIFT;
    const gap = target.current - focus.current;
    vel.current = (vel.current + gap * STIFF) * DAMP;
    focus.current += vel.current;
    paint();
    frame.current = requestAnimationFrame(run);
  }, [paint]);

  const start = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(run);
  }, [run]);

  /* No snapping: the spiral is never meant to come to rest on a project. */
  const nudge = useCallback(
    (by: number) => {
      target.current += by;
      if (prefersReducedMotion()) {
        focus.current = target.current;
        vel.current = 0;
      }
      start();
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
    /* Lay the spiral out once up front, then hand it to the loop. Leaving the
       first placement to the loop means a tab that is not being painted shows
       every panel stacked at the centre until it is looked at. */
    paint();
    start();
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
      /* Zeroing this matters: start() skips when it is set, so leaving a
         cancelled id behind means no loop is ever begun again. React's double
         mount in development hits that on the very first render. */
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [paint, nudge, start]);

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
        <div className="dreel-plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mini-ali.png" alt="" />
        </div>
      </div>

      <div
        ref={rail}
        className="dreel-rail"
        onWheel={onWheel}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          held.current = true;
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
          held.current = false;
          drag.current = null;
        }}
        onPointerCancel={() => {
          held.current = false;
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
                if (d > span - NEAR) d -= span;
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
              <span
                /* Six of the projects have no picture at all. Without this they
                   all come out as the same dark plate, and the spiral reads as
                   mostly empty — the tone is the fallback the rest of the site
                   already uses for them. */
                className={
                  p.hero
                    ? "dreel-frame"
                    : `dreel-frame dreel-plain bg-gradient-to-br ${p.tone}`
                }
                style={
                  {
                    "--src": p.hero ? `url(${p.hero.src})` : undefined,
                    "--n": SLICES,
                    "--bend": `${BEND}deg`,
                  } as CSSProperties
                }
              >
                {Array.from({ length: SLICES }, (_, k) => (
                  <span
                    key={k}
                    className="dreel-slice"
                    style={{ "--k": k } as CSSProperties}
                  />
                ))}
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
