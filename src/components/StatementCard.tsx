"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { NoteBody } from "./NoteTile";
import { play } from "@/lib/audio";
import { notes } from "@/data/projects";

/*
 * Where the card can land, as a fraction of the strip. Hand-picked rather than
 * uniformly random: a truly random point puts it under the nav or half off the
 * side often enough to look broken. Each is jittered, so it is never quite the
 * same twice.
 */
const SPOTS = [
  { x: 0.06, y: 0.1 },
  { x: 0.52, y: 0.14 },
  { x: 0.3, y: 0.42 },
  { x: 0.58, y: 0.46 },
  { x: 0.09, y: 0.44 },
  { x: 0.4, y: 0.06 },
];

/** Keep this much daylight between the card and the edges of the strip. */
const EDGE = 16;
const JITTER = 0.035;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/**
 * The introduction, as a black slab dropped over the work rather than as boxes
 * in the grid — the same ground as the about and contact panels, so it reads as
 * part of the nav's language. Dismissible, since once it has been read it is in
 * the way, and draggable, so it can be pushed off whatever it covers.
 *
 * The spot is chosen on mount, not during render: a random value picked while
 * rendering differs between the server and the browser, and React throws out
 * the whole tree over it. The card is then measured and clamped inside the
 * strip, because a fraction of the viewport knows nothing about how tall the
 * card turned out to be, and on a short screen that put it through the footer.
 */
export function StatementCard() {
  const ref = useRef<HTMLElement>(null);
  const spot = useRef(SPOTS[0]);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const [held, setHeld] = useState(false);
  const [shut, setShut] = useState(false);

  /** Keeps the card inside its parent, whatever size either of them is. */
  const bounds = useCallback(() => {
    const el = ref.current;
    const box = el?.parentElement?.getBoundingClientRect();
    if (!el || !box) return null;
    const card = el.getBoundingClientRect();
    return {
      box,
      maxX: Math.max(EDGE, box.width - card.width - EDGE),
      maxY: Math.max(EDGE, box.height - card.height - EDGE),
    };
  }, []);

  const place = useCallback(() => {
    const b = bounds();
    if (!b) return;
    setAt({
      x: clamp(spot.current.x * b.box.width, EDGE, b.maxX),
      y: clamp(spot.current.y * b.box.height, EDGE, b.maxY),
    });
  }, [bounds]);

  useLayoutEffect(() => {
    const jitter = () => (Math.random() * 2 - 1) * JITTER;
    const chosen = SPOTS[Math.floor(Math.random() * SPOTS.length)];
    spot.current = { x: chosen.x + jitter(), y: chosen.y + jitter() };
    place();
  }, [place]);

  useEffect(() => {
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [place]);

  useEffect(() => {
    if (shut) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShut(true);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shut]);

  // Dragging is tracked on the window, so the pointer may leave the title bar
  // — and released there too, or a fast drag ends with the card still stuck.
  useEffect(() => {
    if (!held) return;

    const move = (e: PointerEvent) => {
      const b = bounds();
      const d = drag.current;
      if (!b || !d) return;
      setAt({
        x: clamp(e.clientX - b.box.left - d.dx, EDGE, b.maxX),
        y: clamp(e.clientY - b.box.top - d.dy, EDGE, b.maxY),
      });
    };
    const drop = () => setHeld(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", drop);
    window.addEventListener("pointercancel", drop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", drop);
      window.removeEventListener("pointercancel", drop);
    };
  }, [held, bounds]);

  /* The whole box is the handle — there is no title bar to grab. */
  const grab = (e: ReactPointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.button !== 0) return;
    const card = el.getBoundingClientRect();
    drag.current = { dx: e.clientX - card.left, dy: e.clientY - card.top };
    setHeld(true);
  };

  if (shut || notes.length === 0) return null;

  // Rendered but not painted until it has been measured and placed.
  const style = at
    ? ({ "--card-x": `${at.x}px`, "--card-y": `${at.y}px` } as CSSProperties)
    : undefined;

  return (
    <aside
      ref={ref}
      className="card"
      data-placed={at ? "" : undefined}
      data-held={held ? "" : undefined}
      style={style}
      aria-label="About Ali"
      onPointerDown={grab}
    >
      <button
        type="button"
        className="card-shut"
        aria-label="Close"
        /* The box starts a drag on pointerdown, which would otherwise begin one
           under the button and swallow the click. */
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          play("nav");
          setShut(true);
        }}
      >
        close
      </button>

      {notes.map((n) => (
        <NoteBody key={n.id} note={n} />
      ))}
    </aside>
  );
}
