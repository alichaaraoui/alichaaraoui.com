---
title: Otter
year: 2026
category: software
blurb: an ai back office for advisors
order: 0
href: https://main.d1ci8xrur0a8sr.amplifyapp.com
hero: 01-dashboard.mp4
role: Financials, approvals, Ask
stack: Python, Lambda, Step Functions, DynamoDB, Bedrock
status: LPL Financial Hackathon, 2026
collaborators: Harsh Makadia, Jay Anupoju, Akshaya Monimaran, Advika Kandikonda
---

**A small advisory practice keeps its books in a filing cabinet and a
spreadsheet.** Otter does it instead, and shows its working.

## Signing up

![the landing page, and the way in](08-signup.png)

## Reading a document

![an invoice read, classified and turned into fields](03-intake.mp4)

Textract pulls the fields; Claude Sonnet classifies the document and
normalises what comes back. Nothing is posted until a person confirms it.

## Approvals

![a bill routed, reviewed side by side, approved](04-approvals.mp4)

Each practice writes its own rules. Nobody can approve a bill they uploaded.

## Reconciling a payout

![an LPL payout statement matched against the fee schedule](05-payout.mp4)

Line by line against the fee schedule, with whatever failed to tie out
surfaced rather than buried.

## Ask your books

![a plain-English answer with its sources attached](06-ask.mp4)

Claude Opus answers over the ledger and the documents, and every answer
carries the journal entry and the document behind it.

## On AWS

![one serverless stack](07-aws.png)

Twenty-three Lambda functions on Python 3.12, a single DynamoDB table for the
ledger, documents written once into S3 with Object Lock, and two Step
Functions workflows — one that reads every upload, one that waits for a human.
[Open the diagram full size ↗](/otter-aws-architecture.png)

## The pitch

![the ad we cut for the hackathon](02-ad.mp4)
