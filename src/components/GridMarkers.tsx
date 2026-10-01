import type { CSSProperties } from "react";

/** The `*1 … *N` column ticks, one set per row — typographic scaffolding only. */
export function GridMarkers({ rows, cols }: { rows: number; cols: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <span
            key={`${r}-${c}`}
            aria-hidden="true"
            className="marker"
            style={{ "--col": c + 1, "--row": r + 1 } as CSSProperties}
          >
            *<span className="ml-[1px]">{c + 1}</span>
          </span>
        ))
      )}
    </>
  );
}
