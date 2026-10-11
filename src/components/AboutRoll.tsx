"use client";

import { useEffect, useRef } from "react";
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

const CHROME_VARS = ["--nav-paper", "--pill-paper", "--pill-ink", "--logo-ink", "--ali-ink"];

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Where a value sits inside its own window of the climb. */
const at = (p: number, [a, b]: [number, number]) => clamp01((p - a) / (b - a));

/** Straight mix between two #rrggbb, as an rgb() string. */
const mix = (from: string, to: string, t: number) => {
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = hex(from);
  const [r2, g2, b2] = hex(to);
  const c = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
};

/** Paint the chrome for a given point in the climb. */
function paintChrome(p: number) {
  const nav = at(p, NAV_AT);
  setVar("--nav-paper", mix("#ffffff", "#060606", nav));
  setVar("--pill-paper", mix("#0a0a0a", "#f2f2f2", nav));
  setVar("--pill-ink", mix("#ffffff", "#0a0a0a", nav));
  setVar("--logo-ink", String(at(p, LOGO_AT)));
  setVar("--ali-ink", String(at(p, ALI_AT)));
}

export function AboutRoll() {
  const still = useReducedMotion();
  const sheet = useRef<HTMLDivElement>(null);

  /*
   * The chrome follows where the black actually IS, measured every frame off
   * the sheet itself, rather than off a value the animation is supposed to be
   * driving. The nav, the wordmark and the mascot are rendered by the layout,
   * outside this page, so nothing here can style them directly — their
   * colours go out as custom properties and the stylesheet spends them.
   *
   * Reading the element was not the first approach. Driving a motion value
   * imperatively and deriving the colours from it works in development and
   * silently does nothing in the production bundle: the sheet sat off the
   * bottom of the screen and the only black on the page was the body behind
   * it. Measuring cannot drift from what is on screen, because it is what is
   * on screen.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.about = "";
    root.dataset.locked = "";
    paintChrome(still ? 1 : 0);
    if (still) return () => {
      delete root.dataset.about;
      delete root.dataset.locked;
      for (const v of CHROME_VARS) root.style.removeProperty(v);
    };

    let frame = 0;
    const follow = () => {
      const el = sheet.current;
      if (el) {
        const top = el.getBoundingClientRect().top;
        paintChrome(clamp01(1 - top / Math.max(1, window.innerHeight)));
      }
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);

    return () => {
      cancelAnimationFrame(frame);
      delete root.dataset.about;
      delete root.dataset.locked;
      for (const v of CHROME_VARS) root.style.removeProperty(v);
    };
  }, [still]);

  return (
    <main className="about">
      <motion.div
        ref={sheet}
        className="about-sheet"
        /* Declarative, not an imperative animate() on a motion value: the
           latter does not run once the bundle is built. */
        initial={still ? false : { y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: still ? 0 : RISE, ease: EASE }}
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
