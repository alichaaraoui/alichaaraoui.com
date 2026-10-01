"use client";

import { useSyncExternalStore } from "react";
import { isMuted, setMuted, subscribeMuted } from "@/lib/audio";

/** Sound is on by default, but it must always be switchable off. */
export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={!muted}
      className="text-[9px] uppercase tracking-[0.1em] text-neutral-400 hover:text-foreground"
    >
      sound {muted ? "off" : "on"}
    </button>
  );
}
