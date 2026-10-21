"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

/* The big lines. His own words, one per line. */
const facts = [
  "I love design.",
  "I love technology.",
  "I am obsessed with",
  "the intersections",
  "between the two.",
];

const experience = [
  { org: "Little Diversified", role: "Technology + Architecture Intern", when: "2024—" },
  { org: "UNC Charlotte UR2PhD", role: "AI / ML Researcher", when: "2026—" },
  { org: "Studio 49", role: "President & Co-Founder", when: "2026—" },
  { org: "Omvra Studios", role: "Software Developer", when: "2025—" },
  { org: "AIAS Charlotte", role: "Events Director", when: "2023—24" },
  { org: "Sublime MediSpa", role: "Creative Director", when: "2022—23" },
];

const shipped: { label: string; note: string; href?: string }[] = [
  { label: "Permit research platform", note: "500+ staff" },
  { label: "Revit plugins", note: "30+ architects" },
  { label: "Differential growth engine", note: "research", href: "/work/differential-growth" },
  { label: "Growth-pattern CVAE", note: "research", href: "/work/differential-growth-cvae" },
  { label: "Otter", note: "hackathon", href: "/work/otter" },
  { label: "Studio 49", note: "studio", href: "/work/studio-49" },
];

const recognition = [
  "AIA Charlotte Advanced Design Award",
  "Dean's List 2022—2026",
  "Computing & Informatics Honors",
  "Early-entry M.S. in AI",
];

const capabilities = [
  "Full-stack web apps",
  "Computational design tools",
  "Generative geometry",
  "Machine learning for form",
  "Revit + Rhino plugins",
  "Interface design",
  "Brand + web design",
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Charlotte time, ticking. Empty until mounted so the server and client agree. */
function useCharlotteTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/New_York",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function AboutRoll() {
  const still = useReducedMotion();
  const time = useCharlotteTime();

  /* The corner Ali is put away: he is already sitting in the middle of this
     page. */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.about = "";
    return () => {
      delete root.dataset.about;
    };
  }, []);

  const rise = (delay: number) =>
    still
      ? {}
      : {
          initial: { y: "105%" },
          animate: { y: 0 },
          transition: { duration: 1.1, delay, ease: EASE },
        };

  const fade = (delay: number) =>
    still
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <main className="about">
      <section className="about-top">
        <motion.div className="about-meta" {...fade(0.1)}>
          <p>
            <span className="about-dim">Based in</span>
            <br />
            Charlotte, NC{time && <span className="about-dim">, {time}</span>}
          </p>
          <p className="about-intro">
            Hey, I&apos;m Ali. I study computer science, AI and architecture at
            UNC Charlotte, and I&apos;m happiest when I get to bring design and
            technology together. I care a lot about the little details and how
            things actually feel to the people using them. Right now I&apos;m
            researching how AI can learn growth patterns, building tools for
            architects at Little and running Studio 49. I graduate in 2027 and
            I&apos;m looking for a team to grow, learn and build great things
            with.
          </p>
        </motion.div>

        <ul className="about-facts">
          {facts.map((f, i) => (
            <li key={f}>
              <motion.span {...rise(0.15 + i * 0.06)}>{f}</motion.span>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-year" aria-label="Class of 2027">
        <span className="about-num">
          <motion.span {...rise(0.25)}>20</motion.span>
        </span>
        <motion.img
          className="about-ali"
          src="/ali/idle.webp"
          alt="Drawing of Ali at a laptop"
          {...fade(0.5)}
        />
        <span className="about-num about-num-right">
          <motion.span {...rise(0.35)}>27</motion.span>
        </span>
        <motion.span className="about-and" {...fade(0.7)}>
          Class of
        </motion.span>
      </section>

      <motion.section className="about-cols" {...fade(0.6)}>
        <div className="about-col">
          <h2>Experience</h2>
          <ul>
            {experience.map((e) => (
              <li key={e.org} className="about-exp">
                <span>{e.org}</span>
                <span className="about-dim">
                  {e.role}{" "}
                  <span className="about-when">({e.when})</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="about-col">
          <h2>Shipped</h2>
          <ul>
            {shipped.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <Link href={s.href} className="about-link">
                    {s.label}
                  </Link>
                ) : (
                  s.label
                )}{" "}
                <span className="about-dim">({s.note})</span>
              </li>
            ))}
          </ul>
          <h2 className="about-h2-gap">Recognition</h2>
          <ul>
            {recognition.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="about-col">
          <h2>Capabilities</h2>
          <ul>
            {capabilities.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="about-h2-gap">
            <Link href="/resume" className="about-link">
              Résumé
            </Link>
          </p>
        </div>

        <p className="about-statement">
          Creative Technologist
          <br />
          Architectural Designer
          <br />
          Software &amp; AI Engineer
        </p>
      </motion.section>
    </main>
  );
}
