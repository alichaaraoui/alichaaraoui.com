"use client";

/**
 * Shared-element open: the grid tile the visitor clicked becomes the hero on the
 * project page. The tile's on-screen rect is handed over through this module,
 * and the hero plays it back as a FLIP once the new page mounts.
 *
 * Rects go stale fast (a resize or a reload invalidates them), so a handover is
 * only honoured briefly and only once.
 */

type Handover = { slug: string; rect: DOMRectReadOnly; at: number };

let pending: Handover | null = null;

/*
 * Generous, because in development the first navigation to a route waits on
 * an on-demand compile before the hero ever mounts.
 */
const MAX_AGE_MS = 4000;

export function handOver(slug: string, el: Element) {
  pending = { slug, rect: el.getBoundingClientRect(), at: Date.now() };
}

/**
 * Returns the rect if it belongs to this project and is still fresh.
 *
 * Deliberately does NOT consume it. React's Strict Mode mounts, tears down and
 * remounts every effect in development; a claim that consumed on read handed
 * the rect to the mount that was about to be thrown away and left the surviving
 * one with nothing, so the animation was built, cancelled and never replaced.
 * The handover is dropped by `release()` once an animation actually completes.
 */
export function claim(slug: string): DOMRectReadOnly | null {
  const p = pending;
  if (!p || p.slug !== slug) return null;
  if (Date.now() - p.at > MAX_AGE_MS) {
    pending = null;
    return null;
  }
  return p.rect;
}

/** Drop the handover. Called once the open animation has run to completion. */
export function release() {
  pending = null;
}

/** Reads a CSS time token, which may be written in either ms or s. */
export function cssTime(raw: string, fallback: number) {
  const v = raw.trim();
  const n = Number.parseFloat(v);
  if (Number.isNaN(n)) return fallback;
  return v.endsWith("ms") ? n : v.endsWith("s") ? n * 1000 : fallback;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------------------------------------------------------------------------
 * Leaving the index.
 *
 * A route change unmounts the index instantly, so there is nothing left to fade
 * and the cut to white is abrupt. Deferring the navigation fixes that but makes
 * the fade and the zoom run one after the other. Instead we take a still of the
 * index, lay it over everything, and navigate straight away: the copy fades on
 * its own clock while the real zoom is already under way beneath it.
 * ------------------------------------------------------------------------- */

/** The chosen tile's twin inside the still, hidden once the hero takes over. */
let veilTwin: HTMLElement | null = null;

/**
 * Called by the hero the instant it starts flying. Hiding the twin any earlier
 * leaves a gap — the still has no tile and the hero does not exist yet — which
 * shows as a blink where the image should be.
 */
export function hideVeilTwin() {
  if (veilTwin) veilTwin.style.visibility = "hidden";
  veilTwin = null;
}

export function veilIndex(chosenTile: Element | null) {
  const screen = document.querySelector(".screen");
  if (!screen) return;

  const clone = screen.cloneNode(true) as HTMLElement;
  clone.classList.add("index-veil");
  clone.setAttribute("aria-hidden", "true");
  clone.setAttribute("inert", "");

  // Remembered, not hidden yet — the hero hides it as it starts to fly, so the
  // image is never absent from the screen.
  veilTwin = null;
  if (chosenTile) {
    const index = Array.from(screen.querySelectorAll(".tile")).indexOf(chosenTile);
    veilTwin = clone.querySelectorAll<HTMLElement>(".tile")[index] ?? null;
  }

  document.body.appendChild(clone);

  // cloneNode does not carry scroll offsets, and the strip scrolls sideways.
  const from = screen.querySelectorAll(".strip, .pane");
  const to = clone.querySelectorAll<HTMLElement>(".strip, .pane");
  from.forEach((el, i) => {
    const twin = to[i];
    if (!twin) return;
    twin.scrollLeft = el.scrollLeft;
    twin.scrollTop = el.scrollTop;
  });

  const duration = cssTime(
    getComputedStyle(document.documentElement).getPropertyValue("--leave-dur"),
    700
  );

  const anim = clone.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration,
    easing: "ease-out",
    fill: "forwards",
  });

  let gone = false;
  const drop = () => {
    if (gone) return;
    gone = true;
    veilTwin = null;
    clone.remove();
  };
  anim.finished.then(drop, drop);
  // A backgrounded tab pauses the timeline, so `finished` may never settle and
  // the still would sit over the page forever.
  window.setTimeout(drop, duration + 2000);
}
