"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { play } from "@/lib/audio";

/*
 * The real article. Scoped through .project-grid because the miniature is a
 * copy of it, carrying the same class — and the map is rendered ahead of the
 * page, so an unscoped lookup finds the copy and clones the clone.
 */
const BODY = ".project-grid .project-body";

/** The map never gets wider or taller than this. */
const MAX_W = 46;
const MAX_W_PHONE = 24;
const MAX_H = 0.66;
const MAX_H_PHONE = 0.58;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/**
 * Strips a cloned copy of the page down to something safe to park in the
 * corner: no duplicate ids for the section links to trip over, no second copy
 * of every video decoding off-screen, and none of the entrance animation state
 * that would leave half of it invisible.
 */
function flatten(node: HTMLElement) {
  for (const el of [node, ...node.querySelectorAll<HTMLElement>("*")]) {
    el.removeAttribute("id");
    el.removeAttribute("style");
    el.classList.remove("reveal");
    if (el instanceof HTMLImageElement) el.loading = "eager";
  }

  for (const video of [...node.querySelectorAll("video")]) {
    const still = document.createElement("img");
    still.src = video.getAttribute("poster") ?? "";
    still.alt = "";
    video.replaceWith(still);
  }
}

/**
 * A miniature of the whole project down the edge of it, with a rectangle
 * marking what is on screen. Drag the rectangle — or anywhere on the map — and
 * the page goes exactly there; scroll the page and the rectangle follows.
 *
 * The miniature is a real, scaled copy of the page rather than a list of its
 * pictures, so it looks like the thing it stands for: the text blocks, the
 * plates and the spaces between them are all where they actually are.
 */
export function ProjectRail() {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const geom = useRef({ scale: 0, pageTop: 0 });
  const [ready, setReady] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [view, setView] = useState({ top: 0 });

  /** Build the miniature, and size it to fit the corner it lives in. */
  const build = useCallback(() => {
    const body = document.querySelector<HTMLElement>(BODY);
    const box = stage.current;
    const outer = frame.current;
    if (!body || !box || !outer) return;

    const phone = window.matchMedia("(max-width: 767px)").matches;
    const maxW = phone ? MAX_W_PHONE : MAX_W;
    const maxH = window.innerHeight * (phone ? MAX_H_PHONE : MAX_H);

    const w = body.offsetWidth;
    const h = body.offsetHeight;
    if (w === 0 || h === 0) return;

    // Whichever bound bites first, so the whole page is always in view.
    const scale = Math.min(maxW / w, maxH / h);

    const copy = body.cloneNode(true) as HTMLElement;
    flatten(copy);
    copy.style.width = `${w}px`;
    copy.style.transform = `scale(${scale})`;
    copy.style.transformOrigin = "top left";
    box.replaceChildren(copy);

    outer.style.width = `${Math.round(w * scale)}px`;
    outer.style.height = `${Math.round(h * scale)}px`;

    geom.current = {
      scale,
      pageTop: body.getBoundingClientRect().top + window.scrollY,
    };
    setReady(true);
  }, []);

  useEffect(() => {
    build();
    /* The page keeps growing as its pictures arrive, and a map built against
       the wrong height points at the wrong places. */
    const body = document.querySelector<HTMLElement>(BODY);
    const ro = new ResizeObserver(build);
    if (body) ro.observe(body);
    window.addEventListener("resize", build);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", build);
    };
  }, [build]);

  /** The rectangle: where the screen is, drawn at the map's scale. */
  const follow = useCallback(() => {
    const { scale, pageTop } = geom.current;
    if (!scale) return;
    // The middle of the screen, in map pixels. The bar is centred on it.
    setView({ top: (window.scrollY + window.innerHeight / 2 - pageTop) * scale });
  }, []);

  useEffect(() => {
    follow();
    window.addEventListener("scroll", follow, { passive: true });
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow);
      window.removeEventListener("resize", follow);
    };
  }, [follow, ready]);

  /** Put the middle of the screen wherever on the map the pointer is. */
  const scrub = useCallback((clientY: number) => {
    const outer = frame.current;
    const { scale, pageTop } = geom.current;
    if (!outer || !scale) return;
    const box = outer.getBoundingClientRect();
    const onPage = pageTop + (clientY - box.top) / scale;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: clamp(onPage - window.innerHeight / 2, 0, max),
      behavior: "instant",
    });
  }, []);

  return (
    <div
      ref={frame}
      className="project-rail"
      data-ready={ready ? "" : undefined}
      data-scrubbing={scrubbing ? "" : undefined}
      aria-hidden="true"
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        // Captured, so the drag survives the pointer leaving the map.
        e.currentTarget.setPointerCapture(e.pointerId);
        setScrubbing(true);
        play("nav");
        scrub(e.clientY);
      }}
      onPointerMove={(e) => scrubbing && scrub(e.clientY)}
      onPointerUp={() => setScrubbing(false)}
      onPointerCancel={() => setScrubbing(false)}
    >
      <div className="rail-stage" ref={stage} />
      <div className="rail-view" style={{ top: `${view.top}px` }} />
    </div>
  );
}
