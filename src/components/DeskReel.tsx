"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { CSSProperties, WheelEvent as ReactWheelEvent } from "react";
import Link from "next/link";
import { Art } from "./Art";
import { play } from "@/lib/audio";
import { handOver, prefersReducedMotion, veilIndex } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";
import type { Project } from "@/data/projects";

/** Wheel distance that advances the carousel by one project. */
const STEP = 190;

/*
 * The scale curve, which is the whole effect. Whatever is in the middle is at
 * full size; its neighbours drop straight to a fraction of it and then fall
 * away by a constant ratio each step out. The cliff between the middle and the
 * first neighbour is deliberate — an even taper reads as a row of thumbnails,
 * and the jump is what makes the middle one the subject.
 */
const DROP = 0.38; // the first neighbour, as a fraction of the middle one
const FALL = 0.8; // and each step further out, as a fraction of the last

/* Gap between neighbouring cards, in the smaller card's widths, so the rhythm
   holds as they shrink. The middle one is given more room than the rest. */
const GAP = 0.14;
const GAP_MID = 0.26;

/* Cards further out than this are not drawn. Eleven across is what fills a
   laptop; the rest would be sub-pixel anyway. */
const VISIBLE = 5.5;

/* The list is laid out this many times over, so the row runs off both edges
   rather than ending. */
const REPEATS = 3;

/* The middle card, against the rail. Width leads, because the row is a
   horizontal rhythm; anything too tall for the rail is pulled back by its own
   height afterwards. */
const CARD_W = 0.44;
const CARD_H = 0.7; // leaves the caption and the title their own room

/* A critically damped spring. A linear chase crawls the last few pixels and
   never quite arrives; this carries speed into the move and settles. */
const STIFF = 0.16;
const DAMP = 0.74;
const REST = 0.0006;

/* After a scroll or a drag stops, the row settles on whichever project is
   nearest the middle. Without it the carousel comes to rest between two. */
const SETTLE = 170;

/* Left alone, the row keeps moving on its own: a step every twelve seconds or
   so, slow enough to read as drift rather than as a carousel advancing. The
   wait is long enough that it does not start up again the moment a scroll
   stops — settling on a project and sitting there for a beat is the point. */
const IDLE_AFTER = 2600;
/* Projects per SECOND, not per frame. Per frame it would run at double speed
   on a 120Hz laptop and crawl on anything throttled. */
const DRIFT = 0.085;
/* A tab left in the background wakes up with one enormous gap; clamping it
   stops the row lurching forward the moment it is looked at again. */
const MAX_DT = 0.1;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/* Whatever is in the middle is at full size; its neighbours drop straight to a
   fraction of it and then fall away by a constant ratio each step out. */
const scaleOf = (away: number) =>
  away <= 1 ? 1 - (1 - DROP) * away : DROP * Math.pow(FALL, away - 1);

/* Slots laid out either side of the middle. One more than is ever drawn, so a
   card never asks for a seat the walk has not reached. */
const REACH = Math.ceil(VISIBLE) + 1;

/**
 * The desktop project directory: one row of projects, the middle one large and
 * the rest falling away to either side.
 *
 * Nothing is laid out in flow. A wheel or a drag moves a target, a spring
 * carries the focus toward it, and each project is placed by its distance from
 * that focus. Driving it directly rather than through native scrolling is what
 * makes the row endless for free: distance is measured around a circle, so
 * there is no track to run out of and no scroll position to wind back.
 *
 * Positions are accumulated outward from the middle rather than computed from
 * a formula, because the cards are different widths — each project keeps its
 * own shape instead of being cropped into a common frame — and only a running
 * total keeps the gaps between them even.
 */
export function DeskReel({ projects }: { projects: Project[] }) {
  const rail = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const focus = useRef(0);
  const target = useRef(0);
  const vel = useRef(0);
  const frame = useRef(0);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drifting = useRef(false);
  const last = useRef(0);
  const held = useRef(false);
  const { hash } = useRoute();
  const total = projects.length;

  /* The same projects laid round the row REPEATS times. One pass and the row
     visibly ends; three and there is always something past the edge. */
  /* A project with no picture is a plain tone plate, so its shape is nobody's
     decision — give it the row's own landscape rhythm rather than letting a
     placeholder's aspect drive the layout. */
  const shapeOf = useCallback(
    (p: Project) => (p.hero ? p.ratio || 1.5 : 1.5),
    []
  );

  /* How wide a card can be before the tallest project runs off the top and
     bottom of the rail — but floored, because one very tall project should not
     shrink the entire row to fit itself. Anything taller than the floor is
     narrowed on its own below instead. */
  const tallest = useMemo(
    () => Math.max(0.9, Math.min(...projects.map(shapeOf))),
    [projects, shapeOf]
  );

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
    const at = focus.current;
    const span = total * REPEATS;

    /* The middle card at full size. Width leads, because the row is a
       horizontal rhythm; the height cap is what keeps a tall project off the
       nav and the footer. */
    const maxH = el.clientHeight * CARD_H;
    const baseW = Math.min(el.clientWidth * CARD_W, maxH * tallest);

    /* Every card is the same width unless its own shape would make it too
       tall, in which case the height binds and it comes out narrower. Nothing
       is cropped to fit a common frame. */
    const widthOf = (k: number) => {
      const p = projects[((Math.round(k) % total) + total) % total];
      return Math.min(baseW, maxH * shapeOf(p)) * scaleOf(Math.abs(k - at));
    };

    /* Gap between a pair, in the smaller card's widths so the rhythm holds as
       they shrink. The pair straddling the middle is given more air, eased in
       rather than switched, or the row would jolt as the focus crosses. */
    const gapOf = (a: number, b: number) => {
      const near = Math.min(Math.abs(a - at), Math.abs(b - at));
      const k = near >= 1 ? GAP : GAP_MID + (GAP - GAP_MID) * near;
      return k * Math.min(widthOf(a), widthOf(b));
    };

    /*
     * Lay the row out by walking outward from the middle, adding half of this
     * card, a gap, and half of the next. Walking it — rather than giving each
     * card an offset from a formula — is what lets the cards be different
     * widths and still sit an even distance apart.
     *
     * Everything here is a continuous function of the focus, the widths
     * included, so the row slides rather than snapping between layouts as the
     * cards change places.
     */
    const seat = Math.floor(at);
    const centre = new Map<number, number>([[seat, 0]]);
    let run = 0;
    for (let k = seat + 1; k <= seat + REACH; k++) {
      run += widthOf(k - 1) / 2 + gapOf(k - 1, k) + widthOf(k) / 2;
      centre.set(k, run);
    }
    run = 0;
    for (let k = seat - 1; k >= seat - REACH; k--) {
      run -= widthOf(k + 1) / 2 + gapOf(k, k + 1) + widthOf(k) / 2;
      centre.set(k, run);
    }
    /* The middle of the screen sits between the two cards the focus is
       between, so that landing on a project puts it exactly in the middle. */
    const f = at - seat;
    const origin =
      (centre.get(seat) ?? 0) * (1 - f) + (centre.get(seat + 1) ?? 0) * f;

    items.current.forEach((node, i) => {
      if (!node) return;
      /* Distance measured around the whole laid-out row, so whichever copy of
         a project is nearest the middle is the one drawn. */
      let d = (((i - at) % span) + span) % span;
      if (d > span / 2) d -= span;
      const away = Math.abs(d);
      const slot = centre.get(Math.round(at + d));

      if (away > VISIBLE || slot === undefined) {
        node.style.opacity = "0";
        node.style.visibility = "hidden";
        return;
      }
      node.style.visibility = "visible";
      node.style.width = `${widthOf(at + d).toFixed(2)}px`;
      node.style.transform = `translate(calc(-50% + ${(slot - origin).toFixed(2)}px), -50%)`;
      node.style.opacity = clamp01(1.08 - Math.pow(away / VISIBLE, 1.6)).toFixed(3);
      node.style.zIndex = String(100 - Math.round(away * 10));

      /* The caption and the brackets belong to whatever is in the middle, and
         fade faster than the picture so they never double up. */
      node.style.setProperty("--meta", clamp01(1 - away * 2.4).toFixed(3));
    });
  }, [projects, shapeOf, tallest, total]);

  /* Carry the focus toward the target on a spring, nudging the target along by
     a hair while the row is drifting. The loop stops once it has arrived and
     nothing is driving it — a carousel sitting still should cost nothing. */
  /* The loop holds itself through a ref. A callback that names itself inside
     its own body closes over the first one it was ever given, and so never
     sees a later paint. */
  const loop = useRef<() => void>(() => {});
  const run = useCallback(() => {
    const now = performance.now();
    const dt = Math.min(MAX_DT, (now - last.current) / 1000);
    last.current = now;
    if (drifting.current && !held.current) target.current += DRIFT * dt;
    const gap = target.current - focus.current;
    vel.current = (vel.current + gap * STIFF) * DAMP;
    focus.current += vel.current;
    paint();
    if (
      !drifting.current &&
      Math.abs(gap) < REST &&
      Math.abs(vel.current) < REST
    ) {
      focus.current = target.current;
      vel.current = 0;
      paint();
      frame.current = 0;
      return;
    }
    frame.current = requestAnimationFrame(() => loop.current());
  }, [paint]);

  /* In an effect, not during the render: assigning to a ref while rendering is
     a tear waiting to happen if React ever throws the render away. */
  useEffect(() => {
    loop.current = run;
  }, [run]);

  const start = useCallback(() => {
    /* Zeroing the id on the way out matters as much as this guard: leaving a
       cancelled one behind means no loop is ever begun again, which React's
       double mount in development hits on the very first render. */
    if (frame.current) return;
    last.current = performance.now();
    frame.current = requestAnimationFrame(() => loop.current());
  }, []);

  const snap = useCallback(() => {
    target.current = Math.round(target.current);
    start();
  }, [start]);

  /* Any touch of the reel stops the drift and puts the clock back to zero.
     Something that moves forever and was never asked to is exactly what the
     reduced-motion preference is about, so for that it never starts. */
  const rouse = useCallback(() => {
    drifting.current = false;
    if (idle.current) clearTimeout(idle.current);
    if (prefersReducedMotion()) return;
    idle.current = setTimeout(() => {
      drifting.current = true;
      start();
    }, IDLE_AFTER);
  }, [start]);

  const nudge = useCallback(
    (by: number, thenSnap: boolean) => {
      rouse();
      target.current += by;
      if (prefersReducedMotion()) {
        target.current = Math.round(target.current);
        focus.current = target.current;
        vel.current = 0;
      }
      if (settle.current) clearTimeout(settle.current);
      if (thenSnap) settle.current = setTimeout(snap, SETTLE);
      start();
    },
    [rouse, snap, start]
  );

  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLDivElement>) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      nudge(delta / STEP, true);
    },
    [nudge]
  );

  useEffect(() => {
    /* Lay the row out once up front, then hand it to the loop. Leaving the
       first placement to the loop means a tab that is not being painted shows
       every card stacked in the middle until it is looked at. */
    paint();
    rouse();
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nudge(1, false);
      else if (e.key === "ArrowLeft") nudge(-1, false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      if (settle.current) clearTimeout(settle.current);
      if (idle.current) clearTimeout(idle.current);
      drifting.current = false;
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [paint, nudge, rouse]);

  /** Dragging the row, for anyone without a wheel. */
  const drag = useRef<{ x: number; from: number } | null>(null);

  return (
    <div
      ref={rail}
      className="dreel"
      onWheel={onWheel}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        held.current = true;
        rouse();
        drag.current = { x: e.clientX, from: target.current };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        const el = rail.current;
        if (!d || !el) return;
        target.current = d.from - (e.clientX - d.x) / (el.clientWidth * 0.22);
        start();
      }}
      onPointerUp={() => {
        held.current = false;
        if (drag.current) {
          rouse();
          snap();
        }
        drag.current = null;
      }}
      onPointerCancel={() => {
        held.current = false;
        drag.current = null;
      }}
    >
      <div className="dreel-row">
        {ring.map(({ p, key }, i) => (
          <Link
            key={key}
            href={`/work/${p.slug}/${hash}`}
            className="dreel-item"
            /* Art fills its box absolutely, so the box has to carry the shape.
               Giving it the project's OWN ratio is also what keeps object-fit
               from cropping anything. */
            style={{ "--ar": String(shapeOf(p)) } as CSSProperties}
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
                nudge(d, false);
                return;
              }
              play("project");
              handOver(
                p.slug,
                e.currentTarget.querySelector(".dreel-art") ?? e.currentTarget
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
            <span className="dreel-sub">{p.blurb}</span>

            <span className="dreel-frame">
              <span className="dreel-art">
                <Art
                  img={p.hero}
                  tone={p.tone}
                  alt={p.title}
                  sizes="40vw"
                  playAbove={260}
                />
              </span>
              <span className="dreel-brackets" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </span>
            </span>

            <span className="dreel-title">{p.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
