---
title: CVAE Growth Generator
year: 2026
category: software
blurb: a trained growth model running live in the browser
order: 1.5
href: https://alichaaraoui.github.io/cvae-growth/
hero: 00-generator.mp4
cover: cover.webp
card: 00-generator.mp4
role: Browser app, model export
stack: ONNX, onnxruntime-web (WebGPU / WASM), PyTorch, JavaScript
status: Research, ongoing
collaborators: Jay Anupoju (CVAE v4.2)
advisor: Bushra Ferdousi
program: UR2PhD, UNC Charlotte
---

**Jay Anupoju's CVAE v4.2, running entirely in the browser.** Pick a start
shape, set the growth stage and the randomness, and the network draws a new
differential-growth pattern; the strip below keeps the code and plays it from
early to final. No server: the trained weights are exported to ONNX and run
on WebGPU, falling back to WASM.

[Live site ↗](https://alichaaraoui.github.io/cvae-growth/)

![Stage view: the same code drawn from early to final.](01-stage.webp)

![Line view.](02-line.webp)
