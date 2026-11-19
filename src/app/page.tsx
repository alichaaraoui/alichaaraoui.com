"use client";

import { useMemo } from "react";
import { CardGrid } from "@/components/CardGrid";
import { Footer } from "@/components/Footer";
import {
  Empty,
  GridView,
  IndexView,
  ReelView,
} from "@/components/views";
import { useIsPhone } from "@/lib/useIsPhone";
import { useRoute } from "@/lib/useRoute";
import { projects } from "@/data/projects";

export default function Home() {
  const { view, category } = useRoute();
  /* A phone gets the reel whatever the hash says: the index is a desktop
     layout, and the menu no longer offers it. */
  const phone = useIsPhone();

  const visible = useMemo(
    () => projects.filter((p) => p.categories.includes(category)),
    [category]
  );

  return (
    <div className="screen">
      <main className="min-h-0 flex-1">
        {!phone && view === "grid" ? (
          /* The grid is the overview: every project, architecture and
             software together, whichever discipline is selected. */
          <GridView projects={projects} />
        ) : visible.length === 0 ? (
          <Empty category={category} />
        ) : category === "software" ? (
          /* Software reads as a plain grid of cards whatever the view says,
             on a phone too — the views stay an architecture thing. */
          <CardGrid projects={visible} />
        ) : (
          <>
            {phone && <GridView projects={visible} />}
            {!phone && view === "index" && <IndexView projects={visible} />}
            {!phone && view === "reel" && <ReelView projects={visible} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
