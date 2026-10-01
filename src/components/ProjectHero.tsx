"use client";

import { useLayoutEffect, useRef } from "react";
import { Art } from "./Art";
import {
  claim,
  cssTime,
  hideVeilTwin,
  prefersReducedMotion,
  release,
} from "@/lib/transition";
import type { Project } from "@/data/projects";

/**
 * Plays back the grid tile as this page's hero: the art starts life pinned to
 * wherever the tile was on screen and flies into place. The holder keeps the
 * final size all along, so nothing below it shifts while the art is in flight.
 */
export function ProjectHero({ project }: { project: Project }) {
  const holder = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = holder.current;
    const el = art.current;
    if (!box || !el) return;

    const from = claim(project.slug);
    if (!from || prefersReducedMotion()) return;

    const to = box.getBoundingClientRect();

    // Timing lives in CSS so the feel can be tuned without touching this file.
    const root = document.documentElement;
    const css = getComputedStyle(root);
    const duration = cssTime(css.getPropertyValue("--open-dur"), 900);
    const easing =
      css.getPropertyValue("--open-ease").trim() || "cubic-bezier(0.65, 0, 0.35, 1)";

    // Holds the rest of the page back until the image is nearly home.
    root.classList.add("is-opening");

    // The still can drop its copy of this tile now that the real one is flying.
    hideVeilTwin();

    el.style.position = "fixed";
    el.style.zIndex = "40";

    const anim = el.animate(
      [
        {
          left: `${from.left}px`,
          top: `${from.top}px`,
          width: `${from.width}px`,
          height: `${from.height}px`,
        },
        {
          left: `${to.left}px`,
          top: `${to.top}px`,
          width: `${to.width}px`,
          height: `${to.height}px`,
        },
      ],
      { duration, easing, fill: "both" }
    );

    let settled = false;
    /*
     * `completed` separates "the zoom finished" from "this effect is being torn
     * down". Only a real finish retires the handover — a Strict Mode teardown
     * must leave it in place for the remount to pick up, or the animation is
     * lost entirely.
     */
    const settle = (completed: boolean) => {
      if (settled) return;
      settled = true;
      anim.cancel();
      el.style.position = "";
      el.style.zIndex = "";
      root.classList.remove("is-opening");
      if (completed) release();
    };

    anim.finished.then(
      () => settle(true),
      () => settle(false)
    );
    return () => settle(false);
  }, [project.slug]);

  return (
    <div ref={holder} className="project-hero">
      <div ref={art} className="project-hero-art">
        <Art
          img={project.hero}
          tone={project.tone}
          alt={project.title}
          sizes="(min-width: 768px) 75vw, 90vw"
          priority
          // Measuring is useless here: the hero opens pinned at the tile's size.
          quality="full"
        />
      </div>
    </div>
  );
}
