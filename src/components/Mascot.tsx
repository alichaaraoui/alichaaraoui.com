"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/transition";
import { useRoute } from "@/lib/useRoute";

/** What he is doing. Each is one drawing, dissolved into the next. */
const POSES = ["idle", "write", "read"] as const;
type Pose = (typeof POSES)[number];

/* How long the page has to be still before he stops working and sits back. */
const SETTLE = 900;

/* How far down a page he has to be before he gives up taking notes and just
   reads along with you. */
const DEEP = 0.55;

/* The views where the work covers the whole page. He has nowhere to stand in
   those without sitting on top of somebody's project, and a mascot drawn over
   the work reads as a mistake rather than as company. */
const CROWDED = ["grid", "mood"];

/**
 * Ali, in the corner, doing whatever the page is doing.
 *
 * Three drawings of him — at the laptop, writing, reading — dissolved into one
 * another. Scrolling sets him working; stopping sets him back; getting a long
 * way down a page has him reading instead.
 *
 * The reel is listened for separately through the wheel, because the carousel
 * turns on the wheel without the page scrolling at all, and he would otherwise
 * sit frozen through the one view with the most going on.
 */
export function Mascot() {
  const [pose, setPose] = useState<Pose>("idle");
  /* usePathname rather than window.location: the hash store already renders
     empty on the server and matches up on hydration, and reading the path
     straight off window during a render would not. */
  const path = usePathname();
  const { view } = useRoute();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const depth = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 80 ? window.scrollY / max : 0;
    };

    const stir = () => {
      setPose(depth() > DEEP ? "read" : "write");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(
        () => setPose(depth() > DEEP ? "read" : "idle"),
        SETTLE
      );
    };

    window.addEventListener("scroll", stir, { passive: true });
    window.addEventListener("wheel", stir, { passive: true });
    return () => {
      window.removeEventListener("scroll", stir);
      window.removeEventListener("wheel", stir);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  /* On a project page the hash still names whichever view was being browsed,
     so the path is tested too: he belongs on a project page whatever brought
     you there. */
  if (path === "/" && CROWDED.includes(view)) return null;

  return (
    <div className="ali" data-pose={pose} aria-hidden="true">
      {POSES.map((p) => (
        /* Plain img, not next/image: the site is a static export, these are
           already at their final size, and there is no srcset to pick from. */
        // eslint-disable-next-line @next/next/no-img-element
        <img key={p} className="ali-pose" data-p={p} src={`/ali/${p}.webp`} alt="" />
      ))}
    </div>
  );
}
