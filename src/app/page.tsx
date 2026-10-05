"use client";

import { useMemo } from "react";
import { Footer } from "@/components/Footer";
import {
  Empty,
  GridView,
  IndexView,
  ListView,
  MoodView,
  ReelView,
} from "@/components/views";
import { useIsPhone } from "@/lib/useIsPhone";
import { useRoute } from "@/lib/useRoute";
import { projects } from "@/data/projects";

export default function Home() {
  const { view, category } = useRoute();
  /* A phone gets the reel whatever the hash says: index, list and mood are
     desktop layouts, and the menu no longer offers them. */
  const phone = useIsPhone();

  const visible = useMemo(
    () => projects.filter((p) => p.categories.includes(category)),
    [category]
  );

  return (
    <div className="screen">
      <main className="min-h-0 flex-1">
        {visible.length === 0 ? (
          <Empty category={category} />
        ) : (
          <>
            {(phone || view === "grid") && <GridView projects={visible} />}
            {!phone && view === "index" && <IndexView projects={visible} />}
            {!phone && view === "list" && <ListView projects={visible} />}
            {!phone && view === "mood" && <MoodView projects={visible} />}
            {!phone && view === "reel" && <ReelView projects={visible} />}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
