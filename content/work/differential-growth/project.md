---
title: Differential Growth
year: 2026
category: software
blurb: a curve that grows until it has to fold
order: 1

hero: 01-growth.mp4
href: https://alichaaraoui.github.io/DifferentialGrowth/

role: Algorithm, interface
stack: JavaScript, Canvas, Python, NumPy
status: Research, ongoing
collaborators: Jay Anupoju
advisor: Bushra Ferdousi
program: UR2PhD, UNC Charlotte
---

<!-- [DRAFT: written from the notebook and the app — verify it and put it in your own voice] -->

A curve made of nodes joined in order. Two rules do all the work, and the folds
are what the curve does when it is forced to get longer inside a space that is
not getting bigger. The same process shapes cabbage leaves, coral, the lining of
the gut and the folds of the cortex.

## The two rules

**Subdivision** inserts a new node in the middle of any edge that stretches past
a threshold. **Repulsion** pushes every node away from any other node that comes
too close — not just its neighbours, but any node that has folded round next to
it, which is what stops the curve passing through itself.

Subdivision supplies material. Repulsion stretches the edges back past the
threshold, so subdivision fires again. That feedback is the growth. Everything
else — attraction holding neighbours together, alignment rounding off corners,
a small random jitter — changes what the folds look like, not whether they
appear.

## Isolating each rule

The rules switch on one at a time, from a starting shape simple enough to check
by hand. Four nodes on a circle of radius 5 gives a square with sides of exactly
5√2, so subdivision is predicted to go 4 → 8 → 16 → 32 with edges halving each
pass. It does, and then it stops — which proves the code is right without
looking at a single picture.

**Subdivision alone changes nothing about the shape.** A midpoint of a straight
edge lies on that edge, so the curve densifies and freezes, geometrically
identical in every frame. Adding repulsion is the moment it becomes growth.

## What the stages actually showed

Adding attraction and alignment stopped the growth dead at 32 nodes. The obvious
reading was symmetry: a regular polygon under symmetric forces stays a regular
polygon, so nothing breaks the tie.

**That reading was wrong.** Running the same code from a deliberately lopsided
quadrilateral froze at 32 too. Measuring the edges explained it: repulsion and
attraction settle at an edge length of about 0.94, just under the 1.0 split
threshold, so subdivision never fires. It is a threshold effect, not a symmetry
lock — and jitter's real job is not breaking symmetry once, but re-crossing that
threshold on every single step.

## The interface

Everything is live. Rules switch off individually, the numbered stages restart
from identical conditions so any difference is attributable to the rule you
changed, and shapes can be drawn straight onto the canvas.

![Working through the controls: seeding, the force sliders, switching a rule off, the build stages, and drawing a shape by hand.](02-interface.mp4)

**Open curves are handled as a separate case.** A line or an arc has endpoints,
which attract toward their single neighbour and are skipped by alignment — an
endpoint has no midpoint to align to. An open curve grows outward from its tips
instead of ruffling inward.

## Making it fast

Repulsion compares every node against every other, which is O(n²) and starts to
crawl around a thousand nodes. Bucketing the nodes into a spatial hash keyed on
the repulsion radius means each node only tests the nine cells around it, which
is close to O(n) for the near-uniform spacing subdivision produces.

**Measured in Chrome: 1 frame per second before, 60 after, at twelve thousand
nodes.** Most of that was not the algorithm — it was building the hash with
string keys, one allocation per lookup, nine lookups per node per step.

## Structure

The simulation is a single file with no dependency on the browser, so the same
code runs headlessly to generate datasets and drives the canvas in the app.
Forces return displacements rather than moving nodes, so every force reads the
same unchanged snapshot and the result cannot depend on the order the nodes
happen to be stored in.
