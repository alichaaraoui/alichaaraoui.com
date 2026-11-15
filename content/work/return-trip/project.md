---
title: Return Trip
year: 2026
category: software
blurb: an ai agent that fills the trip home
order: -0.5
href: https://alichaaraoui.com/return-trip/
hero: 00-walkthrough.mp4
cover: cover.png
card: 01-loops.mp4
role: Frontend, maps and the planning layer
stack: React, MapLibre, deck.gl, Flask, GPT-4o, Meridian TMS API
status: Eranova Hackathon, 2026
collaborators: Ryan Teachman, Asher Wallen
---

**Freight in a broker's system only flows one way, so trucks drive home
empty.** Return Trip sits on top of Meridian, the brokerage's TMS, finds
freight for the trip back, prices it, and puts it into Meridian with a person
in control.

[Live demo ↗](/return-trip/) ·
[Code ↗](https://github.com/alichaaraoui/return-trip/tree/demo)

## The problem

In Meridian's own data: 160 loads, 93,395 empty miles, about $186,790 spent
driving trucks with nothing in them. Dallas takes in 37 loads and ships none.
Replaying every truckload since January showed that chaining loads a broker
already has saves only 0.7% of empty miles, because 15 routes carry 99% of the
empty driving. So the product became finding new freight for those routes.

## Loops from real loads

![a truck already on a load, chained into open loads on real roads](01-loops.mp4)

A loop is only built from loads that exist: same equipment, no food after
hazmat without a washout, at most two days waiting and 300 miles empty, and
only if it actually cuts empty miles. Routes come from OpenStreetMap; red is
the empty drive that's left. Each loop carries a carrier score from every
finished load, and where it ranks for the new load.

## Where trucks come home empty

![the 15 routes, with what the empty trips cost and who could ship them](02-find-freight.mp4)

## The carrier and the driver

![a full week per truck that ends at home](03-dispatch.mp4)

The dispatcher accepts a week for a truck, and it lands on that driver's phone:
today's load, every stop with its window and dock rules, one button for the
next step.

![the driver app](04-driver.mp4)

## The manufacturer

![each plant as a hub, with where every open load is](05-hubs.mp4)

Arcs out to every customer, trucks sitting where they last called in, and an
answer to "where is my order?" from Meridian's tracking log.

## Email and the agent

![price requests and empty trucks turned into priced quotes and drafted replies](06-inbox.mp4)

Asher's pipeline reads each email, matches a truck that can legally make the
pickup, and drafts the quote and the reply. Ryan's GPT-4o agent looks things
up in Meridian and proposes the writes.

## Trust

![every step, what was approved, and the quote it created in Meridian](07-activity.mp4)

Nothing is written without a rule allowing it. Approve mode waits for a person;
Auto runs only low-risk actions inside daily caps; Invisible runs quietly but
still logs every step.

![the three modes](08-modes.mp4)

## The online demo

The live demo runs from a snapshot of the real backend, so it works with no
server: approving or switching modes only changes your browser tab, and
nothing is sent to Meridian. Meridian's own site is no longer open to us, so
the quote page beside Activity is a recreation, filled with the quotes Return
Trip actually created in the sandbox.
