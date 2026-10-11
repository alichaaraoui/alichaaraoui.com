"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

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

/** Pixels a second. Slow enough to read without hurrying. */
const SPEED = 26;

/**
 * The about page: black, and read from the bottom up.
 *
 * The page does not scroll. The writing is one block translated up the screen
 * by Framer Motion, from just under the bottom edge to just past the top, on a
 * linear tween — a transform the compositor can run on its own, which is why
 * it is smooth where driving the window's scroll a pixel at a time was not.
 *
 * It loops, because a roll that ends on a page you cannot scroll leaves you
 * staring at nothing with no way back to the top.
 */
export function AboutRoll() {
  const roll = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  /* Both ends of the journey, measured rather than guessed. `start` is the
     bottom edge of the window the writing passes through — not 100vh, which is
     a nav bar lower and leaves the screen empty for several seconds before the
     first line arrives. `end` is the writing's own height, so the last line
     clears the top. The two added together are what set the duration;
     conflating them with either one runs it a whole screen too fast. */
  const [{ start, end }, setRun] = useState({ start: 0, end: 0 });
  const still = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      const h = roll.current?.offsetHeight ?? 0;
      setRun({ start: stage.current?.offsetHeight ?? 0, end: h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (roll.current) ro.observe(roll.current);
    if (stage.current) ro.observe(stage.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    /* The nav, the footer and the mascot are rendered by the layout, outside
       this page, so the page cannot colour them itself — the flag on the
       document is what lets the stylesheet reach them. It also locks the
       scroll, because there is nothing here to scroll. */
    document.documentElement.dataset.dark = "";
    return () => {
      delete document.documentElement.dataset.dark;
    };
  }, []);

  const body = (
    <div className="about-roll" ref={roll}>
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
  );

  /* Nothing moves for a reader who asked for nothing to move: the same writing,
     laid out to be read as a page. */
  if (still) {
    return (
      <main className="about about-static">
        <div className="about-stage about-stage-still" ref={stage}>{body}</div>
      </main>
    );
  }

  return (
    <main className="about">
      <div className="about-stage" ref={stage}>
        <motion.div
          className="about-track"
          /* Both ends named outright. Animating to a single value would loop
             from wherever Framer thinks it started, which after a resize is
             not the bottom of the window. */
          animate={start ? { y: [start, -end] } : { y: "100vh" }}
          transition={{
            duration: (start + end) / SPEED,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          {body}
        </motion.div>
      </div>
    </main>
  );
}
