"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";

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

/* Slow on purpose: the black is meant to be watched climbing the screen, not
   to flick up. Eased so it arrives without a bump — most of the distance is
   covered early and the last stretch settles. */
const RISE = 1.9;
/* Not an expo curve: that covers eighty per cent of the screen in the first
   third of the time and then creeps, which reads as a flick followed by a
   stall. This keeps an even pace most of the way and only softens at the
   top. */
const EASE = [0.33, 0.12, 0.2, 1] as const;

/*
 * When each piece of the chrome changes over, as a fraction of the rise.
 *
 * The sheet comes up from the bottom, so it reaches things in the order they
 * sit on the screen: the mascot in the bottom corner almost at once, the nav
 * at the top only at the end. Giving each its own window is what makes the
 * black look like it is passing OVER them rather than the page cutting colour
 * underneath it.
 */
const ALI_AT: [number, number] = [0.04, 0.18];
const NAV_AT: [number, number] = [0.58, 0.94];
const LOGO_AT: [number, number] = [0.78, 0.9];

const setVar = (name: string, value: string) =>
  document.documentElement.style.setProperty(name, value);

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

  /*
   * One value runs the whole arrival: 0 with the sheet below the window, 1
   * with it fully up. The sheet reads it, and so does the chrome.
   *
   * The nav, the mascot and the wordmark are rendered by the layout, outside
   * this page, so nothing here can style them directly — their colours go out
   * as custom properties on the document and the stylesheet picks them up. It
   * is the same trick as before, except these move every frame instead of
   * switching once the sheet has already landed, which is what made the
   * handover abrupt.
   */
  const rise = useMotionValue(still ? 1 : 0);
  const y = useTransform(rise, [0, 1], ["100%", "0%"]);
  const navPaper = useTransform(rise, NAV_AT, ["#ffffff", "#060606"]);
  const pillPaper = useTransform(rise, NAV_AT, ["#0a0a0a", "#f2f2f2"]);
  const pillInk = useTransform(rise, NAV_AT, ["#ffffff", "#0a0a0a"]);
  /* A wordmark cannot be half inverted without going grey, so it turns over
     quickly, and late — by then the sheet is already behind it. */
  const logoInk = useTransform(rise, LOGO_AT, [0, 1]);
  const aliInk = useTransform(rise, ALI_AT, [0, 1]);

  /* Each derived value publishes itself, rather than one listener on `rise`
     reading them all: a listener on the source runs BEFORE the values derived
     from it recompute, so every property would be a frame behind — invisible
     at sixty frames a second, and badly wrong at two. */
  useMotionValueEvent(navPaper, "change", (v) => setVar("--nav-paper", v));
  useMotionValueEvent(pillPaper, "change", (v) => setVar("--pill-paper", v));
  useMotionValueEvent(pillInk, "change", (v) => setVar("--pill-ink", v));
  useMotionValueEvent(logoInk, "change", (v) => setVar("--logo-ink", String(v)));
  useMotionValueEvent(aliInk, "change", (v) => setVar("--ali-ink", String(v)));

  useEffect(() => {
    const r = document.documentElement;
    r.dataset.about = "";
    r.dataset.locked = "";
    /* Paint the first frame before anything is shown, or the chrome flashes at
       its resting colours for a frame. */
    setVar("--nav-paper", navPaper.get());
    setVar("--pill-paper", pillPaper.get());
    setVar("--pill-ink", pillInk.get());
    setVar("--logo-ink", String(logoInk.get()));
    setVar("--ali-ink", String(aliInk.get()));

    const run = still
      ? null
      : animate(rise, 1, { duration: RISE, ease: EASE });

    return () => {
      run?.stop();
      delete r.dataset.about;
      delete r.dataset.locked;
      for (const v of ["--nav-paper", "--pill-paper", "--pill-ink", "--logo-ink", "--ali-ink"]) {
        r.style.removeProperty(v);
      }
    };
  }, [rise, still, navPaper, pillPaper, pillInk, logoInk, aliInk]);

  return (
    <main className="about">
      <motion.div className="about-sheet" style={{ y }}>
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
