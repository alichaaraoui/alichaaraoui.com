"use client";

import { useEffect, useState } from "react";
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

/* Long enough to be a move rather than a cut, and eased so it arrives without
   a bump: almost all of the distance is covered early and the last stretch
   settles. */
const RISE = 1.05;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The about page: a black sheet that rises from the bottom of the window.
 *
 * The sheet is what moves. The writing is laid out on it and comes up with it,
 * rather than travelling across it — so the page arrives as one object and
 * then holds still. Nothing scrolls: it is one screen, and the stylesheet
 * locks the document while this page is mounted.
 */
export function AboutRoll() {
  const still = useReducedMotion();
  /* Raised when the sheet has arrived, not when the page mounts. The nav, the
     footer and the mascot are rendered by the layout, outside this page, so
     only a flag on the document can reach them — and darkening them up front
     would paint the page black before the sheet got there, which is the one
     thing that would make the rise invisible. */
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.locked = "";
    return () => {
      delete document.documentElement.dataset.locked;
      delete document.documentElement.dataset.dark;
    };
  }, []);

  useEffect(() => {
    if (landed || still) document.documentElement.dataset.dark = "";
  }, [landed, still]);

  return (
    <main className="about">
      <motion.div
        className="about-sheet"
        initial={still ? false : { y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: still ? 0 : RISE, ease: EASE }}
        onAnimationComplete={() => setLanded(true)}
      >
        <div className="about-inner">
          <div className="about-col">
            <p className="about-lead">
              I am reading Computer Science and Architecture at UNC Charlotte,
              finishing in 2027. Most of what I build sits where those two meet
              — generative geometry, tools that take a drawing problem and give
              it a loop to run in, and the interfaces people actually use
              afterwards. Looking for software and computational design work.
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
          </div>

          <div className="about-col about-col-side">
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
          </div>
        </div>
      </motion.div>
    </main>
  );
}
