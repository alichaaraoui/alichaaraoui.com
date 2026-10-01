import { generated } from "./projects.generated";
import type { Category, Project } from "./types";

export type { Category, GeneratedProject, Img, Project, Section } from "./types";

export const CATEGORIES = ["software", "architecture"] as const;
export const DEFAULT_CATEGORY: Category = "software";

/**
 * Every project, compiled from content/work by scripts/build-content.mjs.
 * Edit the markdown, not this.
 */
export const projects: Project[] = generated;

export function projectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

/**
 * The spec in the margin of a project page. Four lines at most: discipline is
 * already in the eyebrow, and the people and the programme belong in the
 * write-up, where they can be said properly rather than listed.
 */
export function projectDetails(p: Project) {
  return [
    { label: "Year", value: p.year },
    p.role ? { label: "Role", value: p.role } : null,
    p.stack?.length ? { label: "Stack", value: p.stack.join(", ") } : null,
    p.status ? { label: "Status", value: p.status } : null,
  ].filter((d): d is { label: string; value: string } => d !== null);
}

/* ------------------------------------------------------------------ notes -- */

/**
 * A piece of the statement. These no longer take grid boxes — on desktop they
 * are read in a small card that drops over the work, on a phone on the landing
 * screen before the reel.
 */
export interface Note {
  id: string;
  /**
   * An oversized opening line that types itself out, holds, clears and starts
   * again. Only the first note has one — two would fight each other.
   */
  lead?: string;
  /** The rest of the note. Typed out once, each line after the one above it. */
  lines: string[];
  /* In both: *words between asterisks* are set in the italic serif. */
}

/** Read in this order, in the card and on the phone landing alike. */
export const notes: Note[] = [
  {
    id: "hello",
    lead: "Hi. I'm *Ali*.",
    lines: ["Software engineer, designer, and *architect*."],
  },
  {
    id: "make",
    lines: [
      "Welcome to my corner of the internet.",
      "I love designing things that *don't exist yet*, and discovering places that do.",
    ],
  },
  {
    id: "off",
    lines: [
      "Tennis player, movie lover, and *professional online shopper*.",
      "Probably planning my *next trip* right now.",
    ],
  },
];

/* ------------------------------------------------------------------- grid -- */

/** Rows always fit the viewport height. Columns run off the right and scroll. */
export const ROWS = 4;

/** Columns that fill one screen. The strip is a whole number of these. */
export const VISIBLE_COLS = 12;

/**
 * The sparse rhythm, one screenful. Sixteen one-column pictures over four
 * rows, staggered so no two rows line up:
 *
 *   row 1   # . . # . # . . # . . #
 *   row 2   . # . . . . # . . # . .
 *   row 3   # . . # . . . # . . # .
 *   row 4   . . # . . # . . # . . #
 *
 * A picture is one column. Big pictures crowded the screen and left no air
 * between them; the enlargement on hover is what the grid is for.
 *
 * The array order is the order tiles are dealt, which is deliberately not
 * reading order: it hops corner to corner so a short list still covers the
 * width and the height.
 */
const PATTERN: Slot[] = [
  { col: 1, row: 1, span: 1 },
  { col: 10, row: 2, span: 1 },
  { col: 3, row: 4, span: 1 },
  { col: 9, row: 1, span: 1 },
  { col: 4, row: 3, span: 1 },
  { col: 12, row: 4, span: 1 },
  { col: 2, row: 2, span: 1 },
  { col: 8, row: 3, span: 1 },
  { col: 6, row: 1, span: 1 },
  { col: 6, row: 4, span: 1 },
  { col: 11, row: 3, span: 1 },
  { col: 4, row: 1, span: 1 },
  { col: 7, row: 2, span: 1 },
  { col: 1, row: 3, span: 1 },
  { col: 9, row: 4, span: 1 },
  { col: 12, row: 1, span: 1 },
];

export interface Slot {
  col: number;
  row: number;
  span: number;
}

/** How many pictures fit on one screen before the strip grows a second. */
export const PICTURE_SLOTS = PATTERN.length;

/** Where the nth slot sits. The pattern repeats a screen to the right. */
export function slotFor(index: number): Slot {
  const screen = Math.floor(index / PATTERN.length);
  const slot = PATTERN[index % PATTERN.length];
  return { ...slot, col: slot.col + screen * VISIBLE_COLS };
}

export type GridItem = Slot & { key: string; project: Project };

/** Every visible project, each carrying the slot it was dealt. */
export function gridSequence(visible: Project[]): GridItem[] {
  return visible.map((project, i) => ({
    ...slotFor(i),
    key: project.slug,
    project,
  }));
}

/** The strip is a whole number of screens, just long enough to hold the tiles. */
export function columnsFor(items: GridItem[]) {
  const last = items.reduce((m, it) => Math.max(m, it.col + it.span - 1), 1);
  return Math.max(1, Math.ceil(last / VISIBLE_COLS)) * VISIBLE_COLS;
}
