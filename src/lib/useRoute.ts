"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, DEFAULT_CATEGORY, type Category } from "@/data/projects";

export const VIEWS = ["index", "grid", "list", "mood"] as const;
export type View = (typeof VIEWS)[number];

const isView = (v: string): v is View => (VIEWS as readonly string[]).includes(v);
const isCategory = (c: string): c is Category =>
  (CATEGORIES as readonly string[]).includes(c);

const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

/* The snapshot has to be a stable primitive, so the raw hash is the store and
   the view / category pair is derived from it. */
const readHash = () => window.location.hash;

export function parseRoute(hash: string) {
  const [v, c] = hash.replace(/^#/, "").split("/");
  return {
    view: isView(v) ? v : ("grid" as View),
    category: isCategory(c) ? c : DEFAULT_CATEGORY,
  };
}

export const routeHash = (view: View, category: Category) => `#${view}/${category}`;

/**
 * View and category live in the URL hash as `#view/category`. Project links
 * carry it too, so the nav shows the same state on a project page as it did on
 * the index — which is why the section links scroll by script instead of
 * writing their own hash.
 */
export function useRoute() {
  const hash = useSyncExternalStore(subscribe, readHash, () => "");
  const router = useRouter();
  const route = useMemo(() => parseRoute(hash), [hash]);

  const go = useCallback(
    (next: { view?: View; category?: Category }) => {
      const cur = parseRoute(window.location.hash);
      const target = routeHash(next.view ?? cur.view, next.category ?? cur.category);
      if (window.location.pathname === "/") {
        window.location.hash = target;
      } else {
        // Changing view from a project page means going back to the index.
        router.push(`/${target}`);
      }
    },
    [router]
  );

  return { ...route, hash, go };
}
