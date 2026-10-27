"use client";

import { QuietLink } from "./QuietLink";
import { Art } from "./Art";
import { play } from "@/lib/audio";
import { handOver, prefersReducedMotion, veilIndex } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";
import type { Project } from "@/data/projects";

/**
 * The software side: big cards, two to a row, one on a phone. Each shows the app
 * in use — the frontmatter `card`, else the cover — framed as a window on a soft
 * panel, with the title and year on one line and the blurb under it. Every
 * window is the same 16:10 screen, so record cards at that shape.
 */
export function CardGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="pane cards-pane">
      <ul className="cards">
        {projects.map((p, i) => (
          <Card key={p.slug} project={p} priority={i < 2} />
        ))}
      </ul>
    </div>
  );
}

/** What the window's title bar reads: the live address, else the slug. */
const address = (p: Project) => {
  if (!p.href) return p.slug;
  const url = new URL(p.href);
  return (url.host + url.pathname).replace(/\/$/, "");
};

function Card({ project, priority }: { project: Project; priority: boolean }) {
  // Carry the view and filter through, as ProjectTile does.
  const { hash } = useRoute();
  const href = `/work/${project.slug}/${hash}`;
  const media = project.card ?? project.cover;

  return (
    <li className="card">
      <QuietLink
        to={href}
        className="card-link"
        aria-label={project.title}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          play("project");
          // Pointing at a recording replays it from the start.
          const clip = e.currentTarget.querySelector("video");
          if (clip && clip.readyState > 0) {
            clip.currentTime = 0;
            void clip.play().catch(() => {});
          }
        }}
        onClick={(e) => {
          play("project");
          const art = e.currentTarget.querySelector(".card-art");
          const screen = e.currentTarget.querySelector(".card-screen");
          if (screen) handOver(project.slug, screen);

          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
          }
          if (prefersReducedMotion()) return;
          // The veil hides its copy of this picture once the hero takes off.
          veilIndex(art);
        }}
      >
        <span className="card-panel">
          <span className="card-art">
            <span className="card-bar" aria-hidden="true">
              <span className="card-dots" />
              {address(project)}
            </span>
            <span className="card-screen">
              <Art
                img={media}
                tone={project.tone}
                alt={project.title}
                sizes="(min-width: 768px) 40vw, 80vw"
                priority={priority}
              />
            </span>
          </span>
        </span>
        <span className="card-head">
          <span className="card-title">{project.title}</span>
          <span className="card-year">{project.year}</span>
        </span>
        <span className="card-blurb">{project.blurb}</span>
      </QuietLink>
    </li>
  );
}
