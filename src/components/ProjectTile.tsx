"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Art } from "./Art";
import { play } from "@/lib/audio";
import { handOver, prefersReducedMotion, veilIndex } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";
import type { Project } from "@/data/projects";

/**
 * Grow away from the end of the strip, and upward once past the halfway row,
 * so an enlarged tile always stays inside the screen.
 */
function anchors(col: number, row: number, cols: number, rows: number) {
  return {
    x: col > cols - 4 ? "right" : "left",
    y: row > rows / 2 ? "bottom" : "top",
  } as const;
}

export function ProjectTile({
  project,
  col,
  row,
  span,
  cols,
  rows,
}: {
  project: Project;
  col: number;
  row: number;
  /** Columns this tile covers. Varies by slot; see PATTERN in data/projects. */
  span: number;
  cols: number;
  rows: number;
}) {
  const { x, y } = anchors(col, row, cols, rows);
  // Carry the view and filter through, so the nav reads the same on the
  // project page and "back" returns to the screen they left.
  const { hash } = useRoute();
  const href = `/work/${project.slug}/${hash}`;

  const style = {
    "--col": col,
    "--row": row,
    "--tile-cols": span,
    "--ar": project.ratio.toFixed(4),
  } as CSSProperties;

  return (
    <figure className="tile" data-x={x} data-y={y} style={style}>
      <Link
        href={href}
        className="tile-fig"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") play("project");
        }}
        onClick={(e) => {
          play("project");
          // Hand the tile's on-screen rect to the hero on the next page.
          handOver(project.slug, e.currentTarget);

          // Leave modified clicks and middle clicks to the browser.
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
            return;
          }
          if (prefersReducedMotion()) return;

          // Navigation is not held up: the still fades on its own clock while
          // the zoom runs underneath it.
          veilIndex(e.currentTarget.closest(".tile"));
        }}
      >
        <Art
          img={project.hero}
          tone={project.tone}
          alt={project.title}
          // Two to four columns at rest, --grow-w (max 32rem) hovered.
          sizes="(min-width: 768px) 32rem, 70vw"
        />
      </Link>
      <figcaption className="tile-cap text-[9px] uppercase leading-tight tracking-[0.08em]">
        {project.title} <span className="text-neutral-400">/ {project.year}</span>
        <span className="block text-neutral-400">{project.blurb}</span>
      </figcaption>
    </figure>
  );
}
