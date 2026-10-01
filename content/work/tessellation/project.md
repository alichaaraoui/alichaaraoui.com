---
title: Tessellation
year: 2025
category: architecture, software
blurb: procedural stone study
order: 3
tone: from-indigo-300 to-orange-100
role: Design and code
stack: Blender, Geometry Nodes, Python
status: Study, 2025
---

<!-- [DRAFT: verify this matches your intent, edit freely] -->

A study of the sanzon-seki, the three-stone arrangement at the center of the
karesansui garden, rebuilt as a procedural system. Each stone is one mesh
resolved at many densities; the surrounding sand is a single field of
concentric rings that resolves itself around whatever is placed in it. The
piece is a loop that walks a stone from a smooth, weathered read down to a
faceted, low-poly one and back, so the same silhouette holds while the
surface changes underneath it.

## Approach

The stones start from a coarse convex hull and are refined through
subdivision, noise displacement, and a light Voronoi fracture pass on the
shadow side. A single parameter drives the tessellation density across the
loop, so the three rocks stay in sync while reading as distinct forms. The
sand pattern is not raked by hand; it is a distance field around the base of
each stone, thresholded into rings and offset to give the drag of a rake. The
composition itself follows the traditional asymmetric triad: a heavy
foreground stone, a taller middle stone, and a low third stone that keeps
the eye from settling.

## Notes

The point is not the render. It is that the same rules produce every frame:
the density curve, the ring spacing, the placement grammar. Tessellation as
mesh operation and tessellation as ground pattern are the same idea worked
at two scales, which is what made the piece worth finishing rather than
tuning forever.
