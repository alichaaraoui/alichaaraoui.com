---
title: Differential Growth CVAE
year: 2026
category: software
blurb: learning growth patterns with a convolutional vae
order: 2
stack: Python, TensorFlow, Keras, NumPy
status: Research, ongoing
collaborators: Jay Anupoju
advisor: Bushra Ferdousi
program: UR2PhD, UNC Charlotte

# role: add yours
---

<!-- [DRAFT: written from your notebook, verify it and edit freely] -->

**Teaching a neural network what differential growth looks like**, so it
can redraw these patterns, invent new ones, and recognize ones it has
never seen.

## Data

**10 simulation runs**: 8 for training, 2 held back for testing. Each
image is cleaned to **black and white at 128 px**, then **rotated and
flipped 8 ways**, turning 187 training images into **1,496**.

![Raw simulator frame (left) and the cleaned version the model sees (right).](03-preprocessing.png)

![load_image: grayscale, invert, crop, shrink, threshold.](code-02-load-image.png)

![One image in all 8 rotations and flips.](02-augmentation.png)

![The split and augmentation code.](code-04-augmentation.png)

## Model

A **convolutional variational autoencoder**: one half **squeezes an image
into 16 numbers**, the other **draws it back**. Those 16 numbers are a
position on a **map of patterns**, and picking a random point on the map
**invents a new one**.

![The model in code, with its layer summary.](code-05-model.png)

## Experiments

**15 experiments, each changing one thing.** The texture only came back
once we added a **"look-alike" loss** that judges images the way a
pre-trained vision network (VGG16) sees them.

![One image redrawn across the experiments. Top: B1, B2, C3. Bottom: D1, D2, E2.](07-stage-progression.png)

## Result

**The winner, D2, is the only model that makes whole, textured shapes.**

| Model | Textured | Whole shapes |
|---|---|---|
| C3: tidy map, no look-alike | no | yes |
| D1: look-alike, loose map | yes | mostly |
| **D2: both** | **yes** | **yes** |

![D2's output. Top: training patterns redrawn. Below: new patterns it invented.](05-final-model.png)

It also **recognized the unseen 6-point star 4 out of 4 times**. The
random polygon, unlike anything in training, stayed far from every match.
**Next step: more runs.**

![The two unseen runs. Top: real. Bottom: the model's redraw.](06-unseen-runs.png)
