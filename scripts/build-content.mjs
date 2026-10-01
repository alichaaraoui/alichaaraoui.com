#!/usr/bin/env node
/**
 * The content build.
 *
 * Reads content/work/<slug>/ — a project.md plus its images — and compiles it
 * into src/data/projects.generated.ts, resizing every image into public/work/
 * on the way. Adding a project means making a folder; nothing else.
 *
 * It runs before `dev` and `build`, so the generated file is disposable and is
 * not committed.
 */
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import matter from "gray-matter";
import { marked } from "marked";
import sharp from "sharp";

const run = promisify(execFile);

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "work");
const IMAGE_OUT = path.join(ROOT, "public", "work");
const DATA_OUT = path.join(ROOT, "src", "data", "projects.generated.ts");

/* The ladder the browser picks from. Sources smaller than a rung are left at
   their own size rather than upscaled, and the real width is recorded, so the
   srcset never promises pixels that are not there. */
const WIDTHS = [480, 960, 1600];
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".tif", ".tiff"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"]);

/* Video is transcoded to a single H.264 file — <video> has no srcset, so extra
   widths would never be chosen. The still ladder above it does the responsive
   work before playback starts. */
/*
 * Bump when the encoding logic changes. Freshness is otherwise judged purely on
 * mtime, so an output made by older rules looks up to date and is skipped — how
 * animated stills stayed animated after they were meant to become posters.
 */
const PIPELINE_VERSION = "2";
let pipelineStale = false;

const VIDEO_WIDTH = 1920;
const VIDEO_CRF = 20;

/* <video> has no srcset, so a second, small rendition is emitted and the player
   picks by its own rendered size — downloading megabytes to fill a 109px grid
   tile would be absurd. */
const VIDEO_WIDTH_SMALL = 640;
const VIDEO_CRF_SMALL = 32;


/** Optional frontmatter shorthand for the shape of a tile. */
const ASPECTS = { portrait: 6 / 7, tall: 3 / 4, landscape: 16 / 9, square: 1 };
const DEFAULT_RATIO = 6 / 7;
const DEFAULT_TONE = "from-neutral-200 to-neutral-50";

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const exists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

/** Split the prose on `## ` headings. Anything before the first one is Overview. */
function toSections(body) {
  const out = [];
  let title = null;
  let buf = [];

  const flush = () => {
    const text = buf.join("\n").trim();
    buf = [];
    if (!text && !title) return;
    const heading = title ?? "Overview";
    out.push({
      id: slugify(heading),
      title: heading,
      html: text ? marked.parse(text).trim() : "",
    });
  };

  for (const line of body.split("\n")) {
    const heading = /^##\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      title = heading[1].trim();
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

/**
 * Resize one still into the ladder, and make its blur placeholder.
 *
 * `src` is not always a file the visitor supplied — for a video it is the
 * poster frame pulled out of it — so the source path and the output name are
 * passed separately.
 *
 * Animated sources (GIF, animated WebP) keep their frames and come out as
 * animated WebP, which is typically several times smaller than the GIF. Files
 * are named for the width they actually are, not the rung that was asked for,
 * so the srcset never promises pixels that are not in the file.
 */
async function buildStill(src, base, slug, produced, sourceMtime) {
  const outDir = path.join(IMAGE_OUT, slug);
  await fs.mkdir(outDir, { recursive: true });

  const probe = await sharp(src, { failOn: "none", animated: true }).metadata();
  const frames = probe.pages ?? 1;
  const animated = frames > 1;

  // For an animated file `height` is every frame stacked; pageHeight is a frame.
  const srcW = probe.width;
  const srcH = animated ? (probe.pageHeight ?? probe.height) : probe.height;
  if (!srcW || !srcH) {
    console.warn(`  ! skipped ${slug}/${base} — could not read its size`);
    return null;
  }

  const targets = [...new Set(WIDTHS.map((w) => Math.min(w, srcW)))].sort(
    (a, b) => a - b
  );

  const rungs = [];
  for (const width of targets) {
    const name = `${base}-${width}.webp`;
    const out = path.join(outDir, name);

    // Skip work already done for an unchanged source.
    const fresh =
      !pipelineStale && (await exists(out)) && (await fs.stat(out)).mtimeMs > sourceMtime;
    if (!fresh) {
      // First frame only: motion is carried by the video, not the still.
      await sharp(src, { failOn: "none" })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(out);
    }
    rungs.push({ url: `/work/${slug}/${name}`, width });
    produced.add(name);
  }

  // The placeholder is one still frame, never the whole animation.
  const blur = await sharp(src, { failOn: "none" })
    .resize({ width: 16 })
    .webp({ quality: 40 })
    .toBuffer();

  const largest = rungs[rungs.length - 1];
  const still = {
    src: largest.url,
    srcSet: rungs.map((r) => `${r.url} ${r.width}w`).join(", "),
    width: largest.width,
    height: Math.round((largest.width / srcW) * srcH),
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    frames,
  };

  if (!animated) return still;

  // The stills above are now this clip's poster.
  const { full, small } = await encodeVideo(src, base, slug, produced, sourceMtime, srcW);
  return {
    ...still,
    video: {
      src: full.url,
      small: small.url,
      type: "video/mp4",
      width: full.width,
      height: Math.round((full.width / srcW) * srcH),
      duration: 0,
    },
  };
}

/**
 * Encode the two renditions. Used for real video and for animated stills alike:
 * a GIF in an <img> cannot be told where to start, so anything that moves is
 * turned into video and played under our control.
 */
async function encodeVideo(src, base, slug, produced, sourceMtime, srcWidth) {
  const outDir = path.join(IMAGE_OUT, slug);
  await fs.mkdir(outDir, { recursive: true });

  const one = async (targetWidth, crf, suffix) => {
    const w = Math.min(targetWidth, srcWidth);
    const name = `${base}-${suffix}.mp4`;
    const out = path.join(outDir, name);
    produced.add(name);
    const fresh =
      !pipelineStale && (await exists(out)) && (await fs.stat(out)).mtimeMs > sourceMtime;
    if (!fresh) {
      await run(ffmpegPath, [
        "-y", "-loglevel", "error",
        "-i", src,
        // -2 keeps the height even, which H.264 requires.
        "-vf", `scale=${w}:-2`,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", String(crf),
        "-pix_fmt", "yuv420p",
        "-an",
        "-movflags", "+faststart",
        out,
      ]);
    }
    return { url: `/work/${slug}/${name}`, width: w };
  };

  return {
    full: await one(VIDEO_WIDTH, VIDEO_CRF, String(Math.min(VIDEO_WIDTH, srcWidth))),
    small: await one(VIDEO_WIDTH_SMALL, VIDEO_CRF_SMALL, "sm"),
  };
}

/** Probe a video for its real display size and duration. */
async function probeVideo(src) {
  // -show_streams rather than -show_entries: the side-data section is not a
  // selectable entry in every ffprobe build, and rotation lives in there.
  const { stdout } = await run(ffprobeStatic.path, [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_streams",
    "-show_format",
    "-of", "json",
    src,
  ]);
  const json = JSON.parse(stdout);
  const stream = json.streams?.[0] ?? {};
  const duration = Number(stream.duration ?? json.format?.duration ?? 0);

  // A phone clip is often stored landscape with a rotation flag.
  const spin =
    stream.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ??
    stream.tags?.rotate ??
    0;
  const swap = Math.abs(Number(spin)) % 180 === 90;
  return {
    width: swap ? stream.height : stream.width,
    height: swap ? stream.width : stream.height,
    duration: Number.isFinite(duration) ? Math.round(duration * 10) / 10 : 0,
  };
}

/**
 * Transcode a video and pull a poster frame out of it.
 *
 * Audio is dropped: these play muted and looping — autoplay requires it — so
 * the soundtrack would be bytes nobody ever hears.
 */
async function processVideo(slug, file, produced) {
  const src = path.join(CONTENT_DIR, slug, file);
  const base = path.parse(file).name;
  const outDir = path.join(IMAGE_OUT, slug);
  await fs.mkdir(outDir, { recursive: true });

  let info;
  try {
    info = await probeVideo(src);
  } catch {
    console.warn(`  ! skipped ${slug}/${file} — ffprobe could not read it`);
    return null;
  }
  if (!info.width || !info.height) {
    console.warn(`  ! skipped ${slug}/${file} — no video stream`);
    return null;
  }

  const sourceMtime = (await fs.stat(src)).mtimeMs;
  const width = Math.min(VIDEO_WIDTH, info.width);
  const { full, small } = await encodeVideo(src, base, slug, produced, sourceMtime, info.width);

  // Poster: a frame from a little way in, so it is not a black first frame.
  const at = info.duration > 2 ? Math.min(1, info.duration / 4) : 0;
  const frame = path.join(
    await fs.mkdtemp(path.join(os.tmpdir(), "poster-")),
    "frame.png"
  );
  await run(ffmpegPath, [
    "-y", "-loglevel", "error",
    "-ss", String(at),
    "-i", src,
    "-frames:v", "1",
    frame,
  ]);

  const still = await buildStill(frame, base, slug, produced, sourceMtime);
  await fs.rm(path.dirname(frame), { recursive: true, force: true });
  if (!still) return null;

  return {
    ...still,
    video: {
      src: full.url,
      small: small.url,
      type: "video/mp4",
      width,
      height: Math.round((width / info.width) * info.height),
      duration: info.duration,
    },
  };
}

/** Route a file to the still or the video path. */
async function processMedia(slug, file, produced) {
  const ext = path.extname(file).toLowerCase();
  if (VIDEO_EXT.has(ext)) return processVideo(slug, file, produced);
  const src = path.join(CONTENT_DIR, slug, file);
  const mtime = (await fs.stat(src)).mtimeMs;
  return buildStill(src, path.parse(file).name, slug, produced, mtime);
}

/** Delete anything in an output folder that this run did not just produce. */
async function prune(dir, keep) {
  if (!(await exists(dir))) return;
  for (const name of await fs.readdir(dir)) {
    if (keep.has(name)) continue;
    await fs.rm(path.join(dir, name), { recursive: true, force: true });
    console.log(`  - removed stale ${path.basename(dir)}/${name}`);
  }
}

async function readProject(slug) {
  const dir = path.join(CONTENT_DIR, slug);
  const mdPath = path.join(dir, "project.md");
  if (!(await exists(mdPath))) {
    console.warn(`  ! ${slug} has no project.md — skipped`);
    return null;
  }

  const { data, content } = matter(await fs.readFile(mdPath, "utf8"));
  if (!data.title) {
    console.warn(`  ! ${slug} has no title — skipped`);
    return null;
  }

  const files = (await fs.readdir(dir))
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return SOURCE_EXT.has(ext) || VIDEO_EXT.has(ext);
    })
    .sort();

  const produced = new Set();

  /* An image on a line of its own, `![caption](file.png)`, becomes a captioned
     figure in that spot of the prose instead of a gallery plate. */
  const FIGURE = /^!\[(.*)\]\(([^)]+)\)\s*$/;
  const inline = new Set();
  const lines = [];
  for (const line of content.split("\n")) {
    const m = FIGURE.exec(line.trim());
    if (!m || !files.includes(m[2])) {
      if (m) console.warn(`  ! ${slug}: figure "${m[2]}" is not in the folder`);
      lines.push(line);
      continue;
    }
    const img = await processMedia(slug, m[2], produced);
    if (!img) continue;
    inline.add(m[2]);
    const caption = m[1].trim();
    const alt = caption.replace(/[*_`]/g, "").replace(/"/g, "&quot;");
    // A clip referenced inline should still move; the still is only its poster.
    const body = img.video
      ? `<video src="${img.video.src}" poster="${img.src}" ` +
        `width="${img.video.width}" height="${img.video.height}" ` +
        `muted loop playsinline autoplay preload="metadata" aria-label="${alt}"></video>`
      : `<img src="${img.src}" srcset="${img.srcSet}" ` +
        `sizes="(min-width: 768px) 60vw, 92vw" width="${img.width}" height="${img.height}" ` +
        `alt="${alt}" loading="lazy" decoding="async" ` +
        // Single quotes inside url(): base64 never contains one.
        `style="background-image:url('${img.blur}');background-size:cover;background-position:center">`;
    lines.push(
      "",
      `<figure class="figure">${body}` +
        (caption ? `<figcaption>${marked.parseInline(caption)}</figcaption>` : "") +
        `</figure>`,
      ""
    );
  }
  const body = lines.join("\n");

  const images = [];
  const listed = files.filter((f) => !inline.has(f));
  for (const file of listed) {
    const img = await processMedia(slug, file, produced);
    if (img) images.push(img);
  }
  await prune(path.join(IMAGE_OUT, slug), produced);

  // The hero is the first image unless the frontmatter names another.
  let heroIndex = 0;
  if (data.hero) {
    const wanted = listed.findIndex((f) => f === data.hero);
    if (wanted >= 0) heroIndex = wanted;
    else console.warn(`  ! ${slug}: hero "${data.hero}" is not in the folder`);
  }
  const hero = images[heroIndex] ?? null;
  const gallery = images.filter((_, i) => i !== heroIndex);

  const ratio = hero
    ? hero.width / hero.height
    : (data.aspect && ASPECTS[data.aspect]) || DEFAULT_RATIO;

  return {
    slug,
    title: String(data.title),
    year: String(data.year ?? ""),
    // A project can sit under more than one discipline: `architecture, software`.
    categories: (() => {
      const listed = String(data.category ?? "")
        .split(",")
        .map((c) => c.trim().toLowerCase())
        .filter((c) => c === "software" || c === "architecture");
      const unique = [...new Set(listed)];
      if (unique.length === 0) {
        console.warn(`  ! ${slug}: no valid category — defaulting to architecture`);
        return ["architecture"];
      }
      return unique;
    })(),
    blurb: String(data.blurb ?? ""),
    href: data.href ? String(data.href) : undefined,
    role: data.role ? String(data.role) : undefined,
    stack: data.stack
      ? String(data.stack)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    status: data.status ? String(data.status) : undefined,
    program: data.program ? String(data.program) : undefined,
    advisor: data.advisor ? String(data.advisor) : undefined,
    collaborators: data.collaborators
      ? String(data.collaborators)
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : undefined,
    tone: data.tone ? String(data.tone) : DEFAULT_TONE,
    ratio: Number(ratio.toFixed(4)),
    order: data.order === undefined ? 999 : Number(data.order),
    hero,
    gallery,
    sections: toSections(body),
  };
}

async function main() {
  if (!(await exists(CONTENT_DIR))) {
    console.warn(`content/work does not exist — writing an empty project list`);
    await write([]);
    return;
  }

  const stamp = path.join(IMAGE_OUT, ".pipeline");
  const seen = await fs.readFile(stamp, "utf8").catch(() => "");
  pipelineStale = seen.trim() !== PIPELINE_VERSION;
  if (pipelineStale && seen) {
    console.log("pipeline changed — re-encoding everything");
  }

  const slugs = (await fs.readdir(CONTENT_DIR, { withFileTypes: true }))
    // `_` prefixed folders are templates/scratch, not projects.
    .filter((e) => e.isDirectory() && !/^[._]/.test(e.name))
    .map((e) => e.name)
    .sort();

  console.log(`content: ${slugs.length} project folder(s)`);

  const projects = [];
  for (const slug of slugs) {
    const project = await readProject(slug);
    if (project) {
      projects.push(project);
      const count = project.gallery.length + (project.hero ? 1 : 0);
      const media = [project.hero, ...project.gallery].filter(Boolean);
      const clips = media.filter((i) => i.video).length;
      const moving = media.filter((i) => !i.video && i.frames > 1).length;
      const parts = [];
      if (count) parts.push(`${count} item(s)`);
      if (clips) parts.push(`${clips} video`);
      if (moving) parts.push(`${moving} animated`);
      const shot = parts.length ? parts.join(", ") : "no media";
      console.log(`  · ${slug} — ${shot}`);
    }
  }

  // `order` first, then title, so the grid is deliberate rather than alphabetical.
  // Folders for projects that no longer exist would otherwise ship forever.
  if (await exists(IMAGE_OUT)) {
    const live = new Set(projects.map((p) => p.slug));
    for (const entry of await fs.readdir(IMAGE_OUT, { withFileTypes: true })) {
      if (!entry.isDirectory() || live.has(entry.name)) continue;
      await fs.rm(path.join(IMAGE_OUT, entry.name), { recursive: true, force: true });
      console.log(`  - removed stale folder work/${entry.name}`);
    }
  }

  projects.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  await fs.mkdir(IMAGE_OUT, { recursive: true });
  await fs.writeFile(stamp, PIPELINE_VERSION);
  await write(projects);
  console.log(`wrote ${path.relative(ROOT, DATA_OUT)}`);
}

async function write(projects) {
  const body = `// GENERATED by scripts/build-content.mjs — do not edit, your changes will be lost.
// Source of truth is content/work/<slug>/project.md.
import type { GeneratedProject } from "./types";

export const generated: GeneratedProject[] = ${JSON.stringify(projects, null, 2)};
`;
  await fs.mkdir(path.dirname(DATA_OUT), { recursive: true });
  await fs.writeFile(DATA_OUT, body);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
