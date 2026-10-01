"use client";

import type { ReactNode } from "react";
import { play } from "@/lib/audio";

/* `pill` is a styling hook, not a Tailwind class: the phone menu restyles these
   as full-width bars, and a descendant selector beats a utility on specificity. */
const base =
  "pill inline-block px-[7px] py-[3px] text-[12px] font-medium uppercase leading-none tracking-[0.1em] transition-colors";

const tone = (active: boolean) =>
  active
    ? "bg-neutral-400 text-white"
    : "bg-foreground text-white hover:bg-neutral-600";

/** A nav pill. `expanded` marks it as a disclosure for the panel it controls. */
export function PillButton({
  children,
  active = false,
  expanded,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  expanded?: boolean;
  onClick: () => void;
}) {
  const isDisclosure = expanded !== undefined;
  return (
    <button
      type="button"
      onClick={() => {
        play("nav");
        onClick();
      }}
      aria-pressed={isDisclosure ? undefined : active}
      aria-expanded={expanded}
      data-panel-trigger={isDisclosure ? "" : undefined}
      className={`${base} ${tone(active)}`}
    >
      {children}
    </button>
  );
}
