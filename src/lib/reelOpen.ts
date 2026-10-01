"use client";

import { useEffect, useState } from "react";

const OPEN = "ali:open-reel";
const CLOSE = "ali:close-reel";

/**
 * On a phone the landing is the statement, and the projects are a tap away.
 * Two things make that tap — the button under the statement and the menu's one
 * PROJECTS entry — and they live in different trees (the nav is rendered by the
 * root layout, the grid by the page), so they meet on an event rather than
 * through a provider wrapped around the whole site for one boolean.
 */
export const openReel = () => window.dispatchEvent(new Event(OPEN));
export const closeReel = () => window.dispatchEvent(new Event(CLOSE));

export function useReelOpen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    const hide = () => setOpen(false);
    window.addEventListener(OPEN, show);
    window.addEventListener(CLOSE, hide);
    return () => {
      window.removeEventListener(OPEN, show);
      window.removeEventListener(CLOSE, hide);
    };
  }, []);

  return [open, setOpen] as const;
}
