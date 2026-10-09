"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PillButton } from "./Pill";
import { AboutPanel } from "./AboutPanel";
import { ContactPanel } from "./ContactPanel";
import type { PanelName } from "./Panel";
import { useIsPhone } from "@/lib/useIsPhone";
import { closeReel, openReel, useReelOpen } from "@/lib/reelOpen";
import { useRoute, VIEWS } from "@/lib/useRoute";
import { CATEGORIES } from "@/data/projects";

type Open = PanelName | "menu" | null;

/**
 * Rendered once by the root layout, so it is the same element on every route —
 * opening a project never moves, rebuilds or re-styles it.
 *
 * On a phone the bar is just the wordmark and a menu button; the pill groups
 * live in a panel that drops out of it, so the bar keeps a fixed height and
 * `--nav-h` stays true whether the menu is open or shut.
 */
export function Nav() {
  const { view, category, go } = useRoute();
  const phone = useIsPhone();
  const pathname = usePathname();
  const [entered] = useReelOpen();
  const [open, setOpen] = useState<Open>(null);

  /* The phone landing is a doorway: the statement and one button. Until that
     button is pressed there is nothing to navigate, so the bar carries the
     wordmark and nothing else. Only on the landing — a project page opened
     directly still needs its menu. */
  const gated = phone && pathname === "/" && !entered;

  /* And the toggle belongs to the reel, which is the only thing it changes.
     A project page has nothing to filter, so it does not carry one. */
  const onReel = phone && pathname === "/" && entered;

  /* The header is shorter without the discipline strip, and the page below it
     sizes itself off --nav-h. Set where that variable lives rather than
     threading the state down to it. */
  useEffect(() => {
    const root = document.documentElement;
    if (gated) root.dataset.gate = "";
    else delete root.dataset.gate;
    return () => {
      delete root.dataset.gate;
    };
  }, [gated]);

  // Anything clicked that is neither a panel, an open menu, nor one of the
  // triggers dismisses whatever is open. The triggers handle their own toggling.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest("[data-panel], [data-panel-trigger]")) return;
      if (open === "menu" && target?.closest("[data-menu]")) return;
      setOpen(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  const toggle = (name: Open) => setOpen((cur) => (cur === name ? null : name));

  /* Choosing a view or filter also puts away whatever was open — on a phone
     that is the menu itself, on desktop a stray about/contact panel. */
  const choose = (next: Parameters<typeof go>[0]) => {
    go(next);
    setOpen(null);
  };

  /* Which discipline you are looking at is not a preference to be buried in a
     menu — on a phone it is the only way to change what is on the screen, so
     it sits in the open under the bar rather than two taps away. */
  const filter = (
    <nav
      className="nav-filter flex items-center gap-1"
      aria-label="Filter by discipline"
    >
      {CATEGORIES.map((c) => (
        <PillButton
          key={c}
          active={category === c}
          onClick={() => choose({ category: c })}
        >
          {c}
        </PillButton>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-30 shrink-0 bg-background">
      {/* Frosts the page behind the menu. A sibling of the bar, not a child:
          nested inside it, its z-index would resolve within the bar's own
          stacking context and paint over the wordmark and CLOSE. */}
      <div
        className="nav-scrim"
        data-open={open === "menu"}
        aria-hidden="true"
        /* Inline, not CSS: the stylesheet pipeline rewrites backdrop-filter to
           the -webkit- prefix alone, which current Chrome no longer supports,
           so the declaration compiled away to nothing. */
        style={{ backdropFilter: "blur(22px) saturate(140%)" }}
      />

      <div className="navbar">
        <div className="nav-logo flex items-center">
          {/* On a phone this is also the way back out of the reel to the
              statement, since the route does not change between them. */}
          <Link
            href="/"
            className="hover:opacity-60"
            onClick={() => {
              setOpen(null);
              closeReel();
            }}
          >
            <Image
              src="/logo.png"
              alt="Ali Chaaraoui"
              width={927}
              height={96}
              priority
              className="site-logo"
            />
          </Link>
        </div>

        <div className="nav-menu-toggle" hidden={gated}>
          <PillButton
            active={open === "menu"}
            expanded={open === "menu"}
            onClick={() => toggle("menu")}
          >
            {/* One glyph for both states: the plus turns a quarter turn into a
                cross rather than swapping for a different character. */}
            <span className="sr-only">{open === "menu" ? "Close menu" : "Menu"}</span>
            <span className="nav-plus" aria-hidden="true">
              +
            </span>
          </PillButton>
        </div>

        <div className="nav-groups" data-menu="" data-open={open === "menu"}>
          <div className="nav-groups-clip">
            <div className="nav-groups-inner">
              <nav className="nav-views flex items-center gap-1" aria-label="View">
                {/* The index is a desktop layout. A phone has one way to see
                    the work — the reel — so it gets one entry. */}
                {phone ? (
                  <PillButton
                    onClick={() => {
                      choose({ view: "grid" });
                      openReel();
                    }}
                  >
                    projects
                  </PillButton>
                ) : (
                  VIEWS.map((v) => (
                    <PillButton
                      key={v}
                      active={view === v}
                      onClick={() => choose({ view: v })}
                    >
                      {v}
                    </PillButton>
                  ))
                )}
              </nav>

              {!phone && filter}

              <div className="nav-about flex items-center">
                <PillButton
                  active={open === "about"}
                  expanded={open === "about"}
                  onClick={() => toggle("about")}
                >
                  about
                </PillButton>
              </div>

              <div className="nav-contact flex items-center">
                <PillButton
                  active={open === "contact"}
                  expanded={open === "contact"}
                  onClick={() => toggle("contact")}
                >
                  contact
                </PillButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      {onReel && <div className="nav-strip">{filter}</div>}

      <AboutPanel open={open === "about"} />
      <ContactPanel open={open === "contact"} />
    </header>
  );
}
