"use client";

import { useCallback, useRef, type CSSProperties, type WheelEvent } from "react";
import { Art } from "./Art";
import { GridMarkers } from "./GridMarkers";
import { NoteBody } from "./NoteTile";
import { StatementCard } from "./StatementCard";
import { PhoneReel } from "./PhoneReel";
import { PillButton } from "./Pill";
import { ProjectTile } from "./ProjectTile";
import { useIsPhone } from "@/lib/useIsPhone";
import { openReel, useReelOpen } from "@/lib/reelOpen";
import {
  columnsFor,
  gridSequence,
  notes,
  ROWS,
  type Project,
} from "@/data/projects";

const num = (i: number) => String(i + 1).padStart(2, "0");

export function Empty({ category }: { category: string }) {
  return (
    <div className="pane pt-10 text-[10px] uppercase tracking-[0.11em] text-neutral-400">
      *no {category} projects yet
    </div>
  );
}

/**
 * The default view. A sideways strip on desktop; on a phone that makes no sense,
 * so it becomes an introduction you tap past into a depth reel.
 */
export function GridView({ projects }: { projects: Project[] }) {
  const phone = useIsPhone();

  if (phone) return <PhoneGrid projects={projects} />;

  return <DesktopStrip projects={projects} />;
}

/**
 * The phone landing: the statement, and a button into the projects. Tapping it
 * folds the statement away and gives the reel the whole screen, rather than
 * scrolling to it — the reel scrolls internally, and a scrolling page wrapped
 * around a scrolling reel is miserable on a touchscreen.
 */
function PhoneGrid({ projects }: { projects: Project[] }) {
  const [open] = useReelOpen();

  return (
    <div className="phone-grid" data-reel={open ? "open" : "shut"}>
      {notes.length > 0 && (
        <div className="phone-intro" aria-hidden={open}>
          <div className="phone-intro-clip">
            <div className="phone-notes">
              {notes.map((n) => (
                <NoteBody key={n.id} note={n} />
              ))}
            </div>
            <div className="phone-cta">
              <PillButton onClick={openReel}>enter</PillButton>
            </div>
          </div>
        </div>
      )}
      <PhoneReel projects={projects} />
    </div>
  );
}

function DesktopStrip({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const items = gridSequence(projects);
  const cols = columnsFor(items);

  /* A wheel-only mouse has no horizontal axis, so map vertical wheel onto it.
     The page cannot scroll down anyway, so the default action is a no-op. */
  const onWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    if (el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft += e.deltaY;
  }, []);

  return (
    <div className="deskwrap">
      <StatementCard />
      <div ref={ref} onWheel={onWheel} className="strip">
        <div
          className="workgrid"
          style={{ "--cols": cols } as CSSProperties}
        >
        <GridMarkers rows={ROWS} cols={cols} />
        {items.map((item) => (
          <ProjectTile
            key={item.key}
            project={item.project}
            col={item.col}
            row={item.row}
            span={item.span}
            cols={cols}
            rows={ROWS}
          />
        ))}
        </div>
      </div>
    </div>
  );
}

/** A numbered table of contents. No images. */
export function IndexView({ projects }: { projects: Project[] }) {
  return (
    <div className="pane">
      <ol className="mx-auto max-w-3xl pb-8">
        {projects.map((p, i) => (
          <Row key={p.slug} project={p} index={i} />
        ))}
      </ol>
    </div>
  );
}

function Row({ project, index }: { project: Project; index: number }) {
  const body = (
    <>
      <span className="w-8 shrink-0 text-neutral-400">*{num(index)}</span>
      <span className="flex-1 uppercase tracking-[0.08em]">{project.title}</span>
      <span className="hidden flex-1 text-neutral-400 sm:block">{project.blurb}</span>
      <span className="w-24 shrink-0 text-neutral-400">
        {project.categories.join(", ")}
      </span>
      <span className="w-10 shrink-0 text-right text-neutral-400">{project.year}</span>
    </>
  );

  const className =
    "flex items-baseline gap-3 border-b border-[var(--rule)] py-2.5 text-[10px] leading-none transition-colors hover:bg-neutral-50";

  return (
    <li>
      {project.href ? (
        <a href={project.href} target="_blank" rel="noreferrer" className={className}>
          {body}
        </a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  );
}

/** Dense table with a thumbnail per row. */
export function ListView({ projects }: { projects: Project[] }) {
  return (
    <div className="pane">
      <ul className="pb-8">
        {projects.map((p, i) => (
          <li key={p.slug} className="border-b border-[var(--rule)]">
            <div className="flex items-center gap-4 py-2">
              <span className="w-8 shrink-0 text-[10px] text-neutral-400">*{num(i)}</span>
              <div className="relative h-10 w-9 shrink-0 overflow-hidden">
                <Art img={p.hero} tone={p.tone} alt="" sizes="36px" playAbove={120} />
              </div>
              <span className="flex-1 text-[10px] uppercase tracking-[0.08em]">
                {p.title}
              </span>
              <span className="hidden flex-1 text-[10px] text-neutral-400 md:block">
                {p.blurb}
              </span>
              <span className="w-24 shrink-0 text-[10px] text-neutral-400">
                {p.categories.join(", ")}
              </span>
              <span className="w-10 shrink-0 text-right text-[10px] text-neutral-400">
                {p.year}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Images only, tight. */
export function MoodView({ projects }: { projects: Project[] }) {
  return (
    <div className="pane">
      <div className="grid grid-cols-2 gap-2 pb-8 sm:grid-cols-4 md:grid-cols-6">
        {projects.map((p) => (
          <div key={p.slug} className="relative aspect-[6/7] overflow-hidden">
            <Art
              img={p.hero}
              tone={p.tone}
              alt={p.title}
              sizes="(min-width: 768px) 16vw, 45vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
