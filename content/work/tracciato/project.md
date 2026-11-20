---
title: Tracciato
year: 2026
category: architecture, software
blurb: objects generated from borromini's geometric method
order: 0.5
href: https://alichaaraoui.github.io/tracciato/
hero: 00-loop.mp4
cover: cover.gif
card: 00-loop.mp4
role: Research, code, 3D and web
stack: Python, Shapely, Blender, PyTorch (CycleGAN), three.js
status: Research, ongoing
---

**A plan is not drawn, it is constructed.** Borromini started every plan from
a simple figure, two triangles or two squares, and set out walls, niches,
pilasters and the dome from its lines. Tracciato, Italian for those
setting-out lines, turns that procedure into code: 48 objects generated from
his method, and 24 hybrids from a neural network that crosses Roman plans
with sections. Ongoing research.

[Live site ↗](https://alichaaraoui.github.io/tracciato/)

## 1. Plans

Each plan starts from **one regular figure or two overlapping copies**:
Sant'Ivo's two triangles, two squares, a pentagon, a hexagon. Every side of
the core then gets an **apse, a deep niche, a bulging wall, a concave star
point or a straight wall**; some plans gain corner columns, some are
**stretched into an oval**, as at San Carlo.

![All 48 plans, top view: grey lines are the construction, black is the wall.](11-plans.webp)

## 2. Objects

The plan is carried upward along **720 rays**, so every level keeps the
figure: walls, **pilasters where the construction lines meet**, an
entablature, then a **Sant'Ivo** or **San Carlo** dome and a lantern with its
own smaller figure.

![All 48 objects, isometric.](12-objects-iso.webp)

![Plan, isometric, underside and section.](05-spread.webp)

![Glossy black with white edges, plans cut at floor level.](06-spread-sections.webp)

## 3. Hybrids

A **CycleGAN** trained on unpaired Roman plans and sections. Each form is a
plan's footprint intersected with two sections: the network's own
(**translated**) or two real ones from unrelated buildings (**clashed**). An
early run: the network mostly echoed its input.

![Translated: the network's own sections.](13-hybrids-translated.webp)

![Clashed: two real sections from unrelated buildings.](14-hybrids-clashed.webp)

![The 12 drawings the hybrids came from.](15-hybrid-plans.webp)

## 4. Grammar

A second generator built from the sources: a **staged grammar** after Stiny
and Mitchell, with each rule cited to Hill, Connors, Smyth-Pinney and
Morrogh. It re-derives **San Carlo** and **Sant'Ivo**, then goes past them:
figures **interlocked into chains** as Guarini did, and **transforms** of
the Sant'Ivo figure. Vaults come from the same figures as the plan.

![Plan, isometric, underside and section.](07-spread-grammar.webp)

![All 48 grammar objects, isometric.](16-grammar-iso.webp)

## 5. The site

All 120 forms in a live viewer: the plan and a generated description beside
each, height and depth cuts, and a view that eases back after you let go.

![The object view.](10-objects.webp)
