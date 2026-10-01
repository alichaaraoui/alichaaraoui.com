# alichaaraoui.com

Portfolio site. Next.js (App Router) + TypeScript + Tailwind v4, exported as a
static site and served from GitHub Pages at `alichaaraoui.com`.

## Develop

```
npm run dev
```

## Build

```
npm run build
```

`prebuild` compiles `content/` first. To rebuild content alone:

```
node scripts/build-content.mjs
```

`next.config.ts` sets `output: "export"`, so the build writes a fully static
site to `out/`. There is no server at runtime — no route handlers, no server
actions, no `next/image` optimization.

## Deploy

`.github/workflows/deploy.yml` builds on every push to `main` and publishes
`out/` to GitHub Pages. In the repo settings, set **Pages → Source** to
**GitHub Actions**. `public/CNAME` holds the custom domain; `public/.nojekyll`
stops Pages from eating the `_next` directory.

## Layout

The document never scrolls: `body` is `overflow: hidden` and the frame is
nav + strip + footer at exactly `100dvh`. The work grid is `ROWS` rows tall —
always sized to fit the viewport — and `COLS` columns wide, so it runs off the
right edge and **scrolls horizontally**. `VISIBLE_COLS` sets how many columns
fill one screen, which is what `--col-w` is derived from.

`*1 … *N` column ticks come from `GridMarkers`. Tile placement comes from
`slotFor()` rather than the data — see **Filtering**.

Hovering a tile grows it by animating its **width** — not a transform. A scaled
layer resamples its text and makes the caption blurry, so the growth is real
layout and the caption stays crisp. `--grow-w` is bounded on both axes
(`min(22rem, 26vw, 30vh)`) so a tile can never leave the screen, and each tile
grows away from the nearest edge: right-anchored in the last four columns,
upward below the halfway row. The caption rides whichever edge is growing.

## Phone

Below 768px the sideways strip makes no sense, so the grid view becomes
`PhoneReel`: a vertical depth carousel where whatever sits at the centre is
large, sharp and bracketed, and everything else recedes — smaller, blurred,
greyed and bunched toward the edges. Notes sit above it, directly under the nav.
(The CSS phone stack under `@media (max-width: 767px)` still dresses the strip;
it covers the pre-hydration frame and no-JS, since `useIsPhone` cannot know the
width during the static render.)

Nothing in the reel is laid out in flow. A tall track supplies the scroll range,
a sticky stage holds the projects, and each one is placed by its distance from
the focus through a saturating curve — that compression is what reads as depth;
even spacing would just look like a list. Two things the geometry has to respect:

- **A measured dead zone.** The first neighbour must clear the focused picture,
  its captions *and* its own half-height, or the counter and title land on top
  of a thumbnail. The picture's height comes from the viewport width while the
  captions are a fixed type size, so these are measured at runtime rather than
  assumed — any constant eventually collides on some phone.
- **Fewer neighbours when short.** Whatever room is left between the dead zone
  and the edge decides how many recede into view: three a side on a tall phone,
  one on a 667px one. Otherwise the far thumbnails run off the screen.

Snap points live in the track, which begins one screen down the scroll content
because the sticky stage occupies that much flow — `--stage-h` shifts them back
onto multiples of the step.

The nav collapses to the wordmark and a **menu** button. The pill groups drop
out of it as an overlay rather than becoming part of the bar, so `--nav-h` holds
whether the menu is open or shut and nothing below it shifts. Picking a view or
filter closes the menu; about and contact hand off to their own panels.

`body` uses `min-height`, not `height`. A sticky child can only stick inside its
parent's box, so pinning body to exactly the viewport let the nav scroll away
once a project page ran past one screen.

## Notes

`notes` in `projects.ts` are short messages that take a grid box instead of a
project. Each has an `at` index — its position in the dealt sequence, so `0` is
the first box — and spans `NOTE_SPAN` columns, clamped so it never runs off the
end of the strip. On a phone every note is pulled to the top of the stack, so it
sits directly under the nav and is read first.

Placing one is not completely free: the rhythm in `PATTERN` leaves a few columns
between boxes in a row, so a wide note late in a row could collide with the next
box. Early slots are safe.

## Filtering

Every view is filtered by discipline, software or architecture, defaulting to
software. View and category both live in the URL hash as `#view/category`, so a
filtered view is linkable and the back button steps through both.

Tiles are not placed by hand. `PATTERN` in `projects.ts` is the sparse rhythm
for one screenful and tiles are dealt into it in array order, so the layout
stays well distributed however many survive the filter; the strip is then only
as many screens long as the visible tiles need. Reordering `projects` reorders
the grid.

## Navigation

The nav is sticky and rendered once by the root layout, so it is the *same DOM
element* on every route — opening a project never rebuilds or moves it, and an open dropdown
survives the navigation. The home page is therefore
`calc(100dvh - var(--nav-h))` rather than a full viewport.

View and filter live in the hash, and project links carry it
(`/work/slug/#grid/architecture`), so the nav reads the same on a project page
and "back" returns to the screen you left. That is also why the section links in
`ProjectAside` scroll by script instead of letting the anchor rewrite the hash.

About and contact are dropdowns out of the nav —
black slabs that overlay the strip, so opening one neither shifts the grid nor
gives the page anything to scroll. Only one is open at a time, and anything
clicked that is neither a panel nor one of the two triggers dismisses it.
Their column spans live in `globals.css` under `.panel[data-align=...]`; the
narrow-screen override must repeat those attribute selectors or it loses on
specificity.

## Project pages

Each project is a static route at `/work/<slug>/`, generated from `projects` by
`generateStaticParams`. Unlike the index, these are ordinary scrolling
documents — the fixed one-viewport frame belongs to `.screen` on the home page,
not to `body`.

**Opening animation.** The index fade (`--leave-dur`) and the hero zoom
(`--open-dur`) start together; the page then fades up (`--rise-dur`) once the
image has landed.

A route change unmounts the index instantly, so there is nothing left to fade
and the cut to white is abrupt — but deferring the navigation makes the fade and
the zoom run one after the other instead of together. `veilIndex()` resolves
this by cloning the index into a fixed overlay (z 35, under the travelling image
at z 40, over the project header at z 30) and navigating immediately: the still
fades on its own clock while the real zoom runs beneath it. The clone copies
scroll offsets, since the strip scrolls sideways, and it drops its copy of the
chosen tile only when the hero actually starts flying — hiding it any earlier
leaves a frame with no image anywhere. A timeout removes the still if the
timeline stalls, which happens in a backgrounded tab.

Clicking a tile hands its on-screen rect to
`lib/transition.ts`; the hero on the project page claims it in a
`useLayoutEffect` and plays a FLIP from that rect into place, so the tile
appears to fly into the page. The handover expires after 1.2s and is single-use,
so a reload or a direct link just renders normally. It is skipped under
`prefers-reduced-motion`.

Timing lives in `globals.css` as `--open-dur` and `--open-ease`, which
`ProjectHero` reads — tune the feel there, not in the component.

While the image travels, only it and the header are on screen: every other
block carries `.reveal`, whose delay is `--rise-delay` (the full zoom duration
when opening from a tile, zero on a direct load) plus its own `--rise-step`.
The hero is never wrapped in a `.reveal` — `rise` uses a transform, and a
transformed ancestor becomes the containing block for `position: fixed`, which
would strand the image mid-zoom.

**Section nav.** `ProjectAside` is a sticky index of `SECTIONS`. The active
section is the last one whose top has crossed a line a quarter down the
viewport — a band-based IntersectionObserver leaves gaps where nothing is inside
the band and the highlight sticks.

**Back.** Leaving the index stores its hash, so `← INDEX` returns to the same
view and filter rather than the default.

## Video playback

A clip plays only when it is both on screen and rendered wider than
`PLAY_ABOVE` (220px) in `Art.tsx`; otherwise its poster stands in. That single
rule is what keeps a resting grid tile (~109px) quiet while a hovered one
(~270px), a focused reel item (342px) and a project hero all come alive —
without ever running a wall of clips at thumbnail size.

It takes two observers, not one: intersection alone misses a tile growing under
the cursor, and size alone would keep clips running off screen. Autoplay can
still be refused — iOS Low Power Mode does — in which case the poster simply
stays, which is why the poster is a real extracted frame rather than a blank.

## Sound

`lib/audio.ts` synthesises three cues with the Web Audio API — no files, no
fetch. `nav` fires on every pill, `project` on tile hover and click, `back` on
leaving a project. Hover is throttled and ignores non-mouse pointers. The
AudioContext is built lazily inside a real interaction, which is what autoplay
policy requires. Sound is on by default and the footer toggle persists to
`localStorage`.

## Content

Projects live in `content/work/`, one folder each:

```
content/work/tessellation/
  project.md      metadata + prose
  01-hero.jpg     images, in filename order
  02-detail.jpg
```

`scripts/build-content.mjs` compiles that folder into
`src/data/projects.generated.ts` and resized images into `public/work/`. It runs
automatically before `dev` and `build`, so **adding a project means making a
folder** — no code to edit. Copy `content/work/_template/` to start; folders
beginning with `_` or `.` are ignored.

- **Frontmatter** (between the `---` lines) feeds the grid, filter and spec
  table. `order` sets the position in the grid; `aspect` only matters while a
  project has no images, since otherwise the tile takes the hero's real shape.
  `category` accepts more than one, comma separated — a project listed as
  `architecture, software` shows under both filters.
- **Prose** below it becomes the page. Each `## Heading` is a section on the
  project page *and* an entry in the left-hand index — they are not hardcoded.
- **Place media in the prose** with `![caption](02-detail.jpg)` on its own line.
  It renders as a captioned figure in that spot and is dropped from the gallery,
  so pictures sit in the section they belong to rather than piling up at the
  bottom. Works for video too — a clip keeps playing rather than freezing on its
  poster.
- **Images** are resized to 480/960/1600 WebP, never upscaled, and each gets a
  tiny inline blur placeholder. Output files are named for the width they
  actually are, so the srcset never promises pixels that are not in the file.
  The first image alphabetically is the hero unless `hero:` names another; the
  rest become the gallery.
- **Animated GIFs keep moving.** They come out as animated WebP, typically
  around 30x smaller than the source. The blur placeholder is a single frame.
- **Videos work too** — drop an `.mp4`/`.mov`/`.webm` in beside the stills.
  ffmpeg (bundled, no system install) transcodes it to one H.264 file at up to
  1280px with faststart, and pulls a poster frame out of it that goes through
  the same still ladder. Audio is dropped: these play muted and looping, because
  autoplay requires it, so a soundtrack would be bytes nobody hears.
- Re-runs skip images whose source has not changed, and delete outputs whose
  source has been renamed or removed — otherwise dead files ship forever.

Both generated outputs are gitignored — they are rebuilt from `content/`.

Everything is placeholder text for now. Also edit:

- `src/data/projects.ts` — the `notes` array (the messages that take a grid box).
- `src/components/AboutPanel.tsx` — bio, experience, tools. Add `public/resume.pdf`.
- `src/components/ContactPanel.tsx` — the addresses and handles you want public.
- `public/logo.png` — the wordmark, trimmed to its ink and keyed to transparency
  (927x96, ~9.66:1). `--logo-h` in `globals.css` sets how tall it renders; the
  width follows. Swap in an SVG if you still have the vector source.
