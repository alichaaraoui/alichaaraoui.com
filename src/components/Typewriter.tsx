"use client";

import { useEffect, useMemo, useState } from "react";
import { prefersReducedMotion } from "@/lib/transition";

interface Seg {
  text: string;
  em: boolean;
}

/**
 * `*words like this*` are set in the italic serif; everything else takes the
 * light sans. The emphasis is the point of the type treatment, so it lives in
 * the sentence rather than in a separate field.
 */
export function segments(source: string): Seg[] {
  return source
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((part) =>
      part.length > 2 && part.startsWith("*") && part.endsWith("*")
        ? { text: part.slice(1, -1), em: true }
        : { text: part, em: false }
    );
}

/** The sentence as read aloud, markers stripped. */
export const plain = (source: string) =>
  segments(source)
    .map((s) => s.text)
    .join("");

/**
 * Text that writes itself out a character at a time, across the emphasis runs.
 *
 * The full string is always in the markup, in a screen-reader copy — the
 * animated span is decoration, so a crawler, a reader or a reduced-motion
 * visitor gets the sentence rather than whatever fraction of it was on screen.
 */
export function Typewriter({
  text,
  loop = false,
  /** Milliseconds per character while writing. */
  speed = 42,
  /** Milliseconds per character while clearing. Looping only. */
  erase = 22,
  /** How long the finished line sits before it clears. Looping only. */
  hold = 5000,
  /** How long the empty line sits before it starts again. Looping only. */
  rest = 550,
  /** Stagger, so a stack of lines writes itself top to bottom. */
  delay = 0,
  className,
}: {
  text: string;
  loop?: boolean;
  speed?: number;
  erase?: number;
  hold?: number;
  rest?: number;
  delay?: number;
  className?: string;
}) {
  const segs = useMemo(() => segments(text), [text]);
  const full = useMemo(() => segs.map((s) => s.text).join(""), [segs]);

  /* Starts empty on the server and the client alike. Filling it in on mount
     instead would render the whole line for one frame before wiping it. */
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(full.length);
      setRunning(false);
      return;
    }

    let timer = 0;
    let n = 0;
    let dir = 1;

    const tick = () => {
      n += dir;
      setShown(n);

      if (dir === 1 && n >= full.length) {
        // A line that does not loop is finished here, caret and all.
        if (!loop) return setRunning(false);
        dir = -1;
        timer = window.setTimeout(tick, hold);
        return;
      }
      if (dir === -1 && n <= 0) {
        dir = 1;
        timer = window.setTimeout(tick, rest);
        return;
      }
      timer = window.setTimeout(tick, dir === 1 ? speed : erase);
    };

    timer = window.setTimeout(tick, delay);
    return () => window.clearTimeout(timer);
  }, [full, loop, speed, erase, hold, rest, delay]);

  // Walk the runs, handing each one whatever is left of the visible count.
  let before = 0;
  const written = segs.map((seg, i) => {
    const take = Math.min(seg.text.length, Math.max(0, shown - before));
    before += seg.text.length;
    if (take === 0) return null;
    const part = seg.text.slice(0, take);
    return seg.em ? (
      <em key={i} className="note-em">
        {part}
      </em>
    ) : (
      <span key={i}>{part}</span>
    );
  });

  return (
    <span className={className}>
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {written}
        {running && <i className="tw-caret" />}
      </span>
    </span>
  );
}
