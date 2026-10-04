"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { play } from "@/lib/audio";
import { useRoute } from "@/lib/useRoute";

export type Section = { id: string; title: string };

export interface AsideProps {
  sections: readonly Section[];
  eyebrow: string;
  blurb: string;
  /** The opening prose, rendered here rather than above the pictures. */
  introHtml?: string;
  href?: string;
  details: readonly { label: string; value: string }[];
}

/**
 * Everything about the project that is not a picture: the way back, what it
 * is, the opening paragraph, where to see it, and the spec. It sits in the
 * left margin and stays there while the pictures scroll past the middle of the
 * screen, which is the whole shape of the page.
 *
 * Active section is "the last one whose top has crossed a line a quarter down
 * the viewport". A band-based observer looks tidier but leaves gaps — scroll to
 * a point where no section is inside the band and the highlight sticks on
 * whatever was last seen.
 */
export function ProjectAside({
  sections,
  eyebrow,
  blurb,
  introHtml,
  href,
  details,
}: AsideProps) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [heroH, setHeroH] = useState(0);
  const { hash } = useRoute();

  useEffect(() => {
    const ids = sections.map((s) => s.id);

    const pick = () => {
      const line = window.innerHeight * 0.25;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - line <= 0) current = id;
      }
      // The last section is often too short to ever cross the line.
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };

    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [sections]);

  /* The slab is not allowed to be taller than the picture beside it, and only
     the picture knows how tall that is — it depends on the image. Scoped
     through .project-grid, because the map in the corner holds a copy of the
     page carrying all the same classes. */
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".project-grid .project-hero");
    if (!hero) return;
    const measure = () => setHeroH(hero.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    /* The observer alone is not enough: a window resize changes the picture's
       height through the grid, and a measurement left over from the old width
       caps this box at the wrong number. */
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <aside className="project-aside reveal">
      <div
        className="aside-box"
        style={heroH ? ({ "--hero-h": `${heroH}px` } as CSSProperties) : undefined}
      >
        <Link
          href={`/${hash}`}
          className="aside-back"
          onClick={() => play("back")}
        >
          <span aria-hidden="true">&#8592;</span> Back to index
        </Link>

        <p className="eyebrow">{eyebrow}</p>
        <p className="project-blurb">{blurb}</p>

        {introHtml && (
          <div
            className="prose aside-intro"
            dangerouslySetInnerHTML={{ __html: introHtml }}
          />
        )}

        {details.length > 0 && (
          <dl className="details aside-details">
            {details.map((d) => (
              <div key={d.label} className="detail-row">
                <dt>{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {href && (
          <p className="aside-visit">
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="visit-button"
            >
              Visit site <span aria-hidden="true">&#8594;</span>
            </a>
          </p>
        )}
      </div>
    </aside>
  );
}
