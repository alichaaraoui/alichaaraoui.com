"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Art } from "./Art";
import { play } from "@/lib/audio";
import { archive, ARCHIVE_KINDS, ARCHIVE_TAGS, type ArchiveItem } from "@/data/archive";

/* Filters live in the hash as `#kind/tag`, like the index's `#view/category`,
   so a filtered board is linkable and back steps through it. */
const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => window.location.hash;

function parse(hash: string) {
  const [k, t] = hash.replace(/^#/, "").split("/").map(decodeURIComponent);
  return {
    kind: ARCHIVE_KINDS.includes(k) ? k : null,
    tag: t && ARCHIVE_TAGS.includes(t) ? t : null,
  };
}

/* How many columns a width holds — a pin stays about 230px wide, like Pinterest. */
const columnsFor = (w: number) =>
  w < 768 ? 2 : Math.max(3, Math.min(8, Math.floor(w / 240)));

const subscribeResize = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const readColumns = () => columnsFor(window.innerWidth);

/**
 * Pins go to whichever column is shortest so far, so the feed reads left to
 * right, newest first — CSS columns would run the newest down the first column
 * instead. Heights are estimated from each picture's known shape (in column
 * widths), which is all the balancing needs; nothing is measured.
 */
function deal(items: ArchiveItem[], cols: number) {
  const columns: { item: ArchiveItem; index: number }[][] = Array.from(
    { length: cols },
    () => []
  );
  const heights = new Array(cols).fill(0);
  items.forEach((item, index) => {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push({ item, index });
    heights[shortest] += (item.ratio ? 1 / item.ratio : 0.6) + 0.15;
  });
  return columns;
}

/**
 * The library: every idea, sketch and finished work in one feed, newest first,
 * filtered by kind (the folder it was filed in) or by tag.
 *
 * A pinboard rather than the index's grid — pictures keep their own shapes and
 * stack in columns. A work opens its project page; anything else opens in a
 * viewer over the feed.
 */
export function ArchiveBoard() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const cols = useSyncExternalStore(subscribeResize, readColumns, () => 5);
  const { kind, tag } = parse(hash);
  const [open, setOpen] = useState<number | null>(null);

  const go = (next: { kind?: string | null; tag?: string | null }) => {
    play("nav");
    const k = next.kind === undefined ? kind : next.kind;
    const t = next.tag === undefined ? tag : next.tag;
    window.location.hash = `${k ?? "all"}/${t ? encodeURIComponent(t) : ""}`;
  };

  const visible = useMemo(
    () =>
      archive.filter(
        (i) => (!kind || i.kind === kind) && (!tag || i.tags.includes(tag))
      ),
    [kind, tag]
  );

  const columns = useMemo(() => deal(visible, cols), [visible, cols]);

  /* Only the tags that would still find something under the chosen kind. */
  const tags = useMemo(
    () =>
      ARCHIVE_TAGS.filter((t) =>
        archive.some((i) => (!kind || i.kind === kind) && i.tags.includes(t))
      ),
    [kind]
  );

  return (
    <div className="archive">
      <h1 className="sr-only">Archive</h1>

      <Boards>
        <Board active={!kind && !tag} onClick={() => go({ kind: null, tag: null })}>
          All
        </Board>
        {ARCHIVE_KINDS.map((k) => (
          <Board
            key={k}
            active={kind === k && !tag}
            onClick={() => go({ kind: k, tag: null })}
          >
            {k}
          </Board>
        ))}
        {tags.map((t) => (
          <Board
            key={t}
            active={tag === t}
            onClick={() => go({ tag: tag === t ? null : t })}
          >
            #{t}
          </Board>
        ))}
      </Boards>

      {visible.length === 0 ? (
        <p className="archive-empty">Nothing filed under that yet.</p>
      ) : (
        // Keyed on the filter so the pins deal in again when it changes.
        <div
          className="archive-board"
          key={`${kind}/${tag}`}
          style={{ "--cols": cols } as CSSProperties}
        >
          {columns.map((column, c) => (
            <ul key={c} className="archive-col">
              {column.map(({ item, index }) => (
                <Card
                  key={item.id}
                  item={item}
                  index={index}
                  onOpen={() => setOpen(index)}
                />
              ))}
            </ul>
          ))}
        </div>
      )}

      {open !== null && visible[open] && (
        <Viewer
          items={visible}
          index={open}
          onMove={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

/**
 * The row of boards across the top: kinds, then tags, as plain words with the
 * chosen one underlined. It scrolls sideways once there are more than fit, and
 * the arrow appears only while there is more to see.
 */
function Boards({ children }: { children: React.ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const check = () =>
      setMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="archive-boards">
      <nav ref={row} className="archive-boards-row" aria-label="Filter the archive">
        {children}
      </nav>
      {more && (
        <button
          type="button"
          className="archive-boards-more"
          aria-label="More filters"
          onClick={() =>
            row.current?.scrollBy({ left: row.current.clientWidth * 0.6, behavior: "smooth" })
          }
        >
          ›
        </button>
      )}
    </div>
  );
}

function Board({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className="archive-board-tab"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Card({
  item,
  index,
  onOpen,
}: {
  item: ArchiveItem;
  index: number;
  onOpen: () => void;
}) {
  const style = {
    "--i": Math.min(index, 30),
    "--ar": item.ratio || undefined,
  } as CSSProperties;

  const face = item.img ? (
    <span className="archive-art">
      <Art
        img={item.img}
        tone="from-neutral-200 to-neutral-50"
        alt={item.title}
        sizes="(min-width: 768px) 260px, 50vw"
      />
    </span>
  ) : (
    <span className="archive-text">
      <span className="archive-text-title">{item.title}</span>
      {item.note && (
        <span
          className="archive-text-note"
          dangerouslySetInnerHTML={{ __html: item.note }}
        />
      )}
    </span>
  );

  const hover = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") play("project");
  };

  return (
    <li className="archive-card" data-kind={item.kind} style={style}>
      {item.href ? (
        <Link
          href={item.href}
          className="archive-face"
          onPointerEnter={hover}
          onClick={() => play("project")}
        >
          {face}
        </Link>
      ) : (
        <button
          type="button"
          className="archive-face"
          onPointerEnter={hover}
          onClick={() => {
            play("project");
            onOpen();
          }}
        >
          {face}
        </button>
      )}
      {/* One line, like a pin: the title. Kind, year and tags wait in the
          viewer. A written idea already carries its title on the card. */}
      {item.img && <div className="archive-cap">{item.title}</div>}
    </li>
  );
}

/** A black slab over the board, like the nav's panels. Arrows step, Esc closes. */
function Viewer({
  items,
  index,
  onMove,
  onClose,
}: {
  items: ArchiveItem[];
  index: number;
  onMove: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const step = useCallback(
    (by: number) => {
      play("nav");
      onMove((index + by + items.length) % items.length);
    },
    [index, items.length, onMove]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, step]);

  return (
    <div
      className="archive-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="archive-viewer-bar">
        <span>
          {index + 1} / {items.length}
        </span>
        <span className="flex gap-3">
          <button type="button" onClick={() => step(-1)} aria-label="Previous">
            ←
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next">
            →
          </button>
          <button type="button" onClick={onClose}>
            close
          </button>
        </span>
      </div>

      <div className="archive-viewer-body" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {item.img ? (
          <span
            className="archive-viewer-art"
            style={{ "--ar": item.ratio } as CSSProperties}
          >
            <Art
              key={item.id}
              img={item.img}
              tone="from-neutral-800 to-neutral-900"
              alt={item.title}
              sizes="90vw"
              quality="full"
              priority
            />
          </span>
        ) : (
          <div className="archive-viewer-text">
            {item.note && <div dangerouslySetInnerHTML={{ __html: item.note }} />}
          </div>
        )}
      </div>

      <div className="archive-viewer-cap">
        <span>{item.title}</span>
        <span className="archive-dim">
          {[item.kind, item.year, ...item.tags.map((t) => `#${t}`)]
            .filter(Boolean)
            .join(" / ")}
        </span>
        {item.img && item.note && (
          <div
            className="archive-viewer-note"
            dangerouslySetInnerHTML={{ __html: item.note }}
          />
        )}
      </div>
    </div>
  );
}
