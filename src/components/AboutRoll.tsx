"use client";

import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/transition";

const experience = [
  { year: "2025—", role: "Software Developer", org: "Omvra Studios" },
  { year: "2024—", role: "Architecture + Software Intern", org: "Little Diversified" },
  { year: "2023—24", role: "Events Director", org: "AIAS Charlotte" },
  { year: "2022—23", role: "Creative Director & Developer", org: "Sublime MediSpa" },
];

const tools = [
  "TypeScript / React",
  "Python / FastAPI",
  "PostgreSQL",
  "Rhino / Grasshopper",
  "Blender",
  "Power Platform",
];

/** Pixels a second. Slow enough to read, quick enough not to be a hostage. */
const SPEED = 34;

/** How long after you stop touching it before it takes itself up again. */
const RESUME = 2200;

/**
 * The about page: black, and read from the bottom up.
 *
 * The writing starts a whole screen below the top, so the page opens on
 * nothing, and then carries itself upward — credits, not a document. Any wheel,
 * key or touch takes it off you and hands it back a couple of seconds after you
 * stop; at the end it simply stops rather than looping back.
 *
 * It drives the window's own scroll rather than translating a track, so the
 * scrollbar, the keyboard and a trackpad all keep meaning what they mean.
 */
export function AboutRoll() {
  const frame = useRef(0);
  const last = useRef(0);
  const held = useRef(0); // when the reader last intervened
  const carry = useRef(0); // sub-pixel remainder, or slow speeds never move

  const loop = useRef<() => void>(() => {});
  const run = useCallback(() => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - last.current) / 1000);
    last.current = now;

    const end = document.documentElement.scrollHeight - window.innerHeight;
    if (now - held.current > RESUME && window.scrollY < end - 1) {
      carry.current += SPEED * dt;
      const step = Math.floor(carry.current);
      if (step >= 1) {
        carry.current -= step;
        /* An absolute target, and instant: a relative scrollBy inherits the
           page's smooth behaviour and the steps cancel one another out. */
        window.scrollTo({ top: window.scrollY + step, behavior: "instant" });
      }
    }
    frame.current = requestAnimationFrame(() => loop.current());
  }, []);

  useEffect(() => {
    loop.current = run;
  }, [run]);

  useEffect(() => {
    /* The nav, the footer and the mascot live outside this page, so the page
       cannot colour them itself — the flag on the document is what lets the
       stylesheet reach them. */
    document.documentElement.dataset.dark = "";
    window.scrollTo(0, 0);

    if (prefersReducedMotion()) return () => {
      delete document.documentElement.dataset.dark;
    };

    const stall = () => {
      held.current = performance.now();
    };
    for (const e of ["wheel", "touchstart", "keydown", "pointerdown"] as const) {
      window.addEventListener(e, stall, { passive: true });
    }

    last.current = performance.now();
    frame.current = requestAnimationFrame(() => loop.current());

    return () => {
      delete document.documentElement.dataset.dark;
      for (const e of ["wheel", "touchstart", "keydown", "pointerdown"] as const) {
        window.removeEventListener(e, stall);
      }
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, []);

  return (
    <main className="about">
      <div className="about-roll">
        <p className="about-lead">
          I am reading Computer Science and Architecture at UNC Charlotte,
          finishing in 2027. Most of what I build sits where those two meet —
          generative geometry, tools that take a drawing problem and give it a
          loop to run in, and the interfaces people actually use afterwards.
          Looking for software and computational design work.
        </p>

        <section className="about-block">
          <h2>Experience</h2>
          {experience.map((e) => (
            <div key={e.year} className="about-row">
              <span className="about-when">{e.year}</span>
              <span className="about-what">{e.role}</span>
              <span className="about-where">{e.org}</span>
            </div>
          ))}
        </section>

        <section className="about-block">
          <h2>Tools</h2>
          <ul className="about-list">
            {tools.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="about-block">
          <h2>Education</h2>
          <p className="about-plain">
            UNC Charlotte
            <br />
            B.S. Computer Science
            <br />
            B.A. Architecture
            <br />
            2022—2027
          </p>
        </section>

        <section className="about-block">
          <h2>Résumé</h2>
          <p className="about-plain">
            <a href="/resume">Read it →</a>
          </p>
        </section>

        <p className="about-end">Ali Chaaraoui</p>
      </div>
    </main>
  );
}
