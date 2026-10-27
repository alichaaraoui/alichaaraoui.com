import { generatedArchive } from "./archive.generated";
import { projects } from "./projects";
import type { GeneratedArchiveItem } from "./types";

export type ArchiveItem = GeneratedArchiveItem;

/** The finished projects stand in the archive too, so they are not filed twice. */
const works: ArchiveItem[] = projects.map((p) => ({
  id: `works/${p.slug}`,
  kind: "works",
  title: p.title,
  year: p.year,
  tags: p.categories,
  note: p.blurb ? `<p>${p.blurb}</p>` : "",
  href: `/work/${p.slug}/`,
  img: p.cover,
  ratio: p.cover ? p.coverRatio : 0,
  order: p.order,
}));

/**
 * Everything on /archive: content/archive/<kind>/ compiled by
 * scripts/build-content.mjs, plus the projects. Newest first, so the kinds are
 * shuffled together the way they were made rather than filed in drawers.
 */
export const archive: ArchiveItem[] = [...generatedArchive, ...works].sort(
  (a, b) =>
    (Number(b.year) || 0) - (Number(a.year) || 0) ||
    a.order - b.order ||
    a.id.localeCompare(b.id)
);

/** Kinds in the order of how much is in them. */
export const ARCHIVE_KINDS = [...new Set(archive.map((i) => i.kind))].sort(
  (a, b) =>
    archive.filter((i) => i.kind === b).length -
      archive.filter((i) => i.kind === a).length || a.localeCompare(b)
);

export const ARCHIVE_TAGS = [...new Set(archive.flatMap((i) => i.tags))].sort();
