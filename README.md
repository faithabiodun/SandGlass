# Mantle Narrative Intelligence Agent

An AI-powered research platform built for the **Mantle Research Challenge — Track 2**.
It detects, explains, and forecasts the narratives shaping the Mantle ecosystem by
combining AI reasoning with onchain, social, news, and market intelligence — and
presents the result as a stark, editorial **research verdict**.

> Most Track 2 submissions track TVL. This one tracks the **story markets move on
> before the numbers confirm it** — exactly the "spot the trend shaping the market"
> angle Mantle's brief calls a winning approach.

![Report](screenshots/03-report.png)

## What it does

Paste four kinds of signal — **X / social**, **onchain / TVL**, **news & ecosystem**,
and **market / prediction** data — and the agent produces a single research note,
structured top-to-bottom like a broadsheet analyst report:

| # | Section | Purpose |
|---|---|---|
| 01 | **Overview** | Executive summary + four narrative KPIs |
| 02 | **Market Pulse** | Read of each Mantle ecosystem pillar |
| 03 | **Source Intelligence** | Each input distilled into directional signal chips |
| 04 | **Narrative Analysis** | The three-layer narrative (below) |
| 05 | **Evidence Matrix** | Why the AI reached its read, with a confidence score |
| 06 | **Narrative Catalysts** | The timeline that shaped the current read |
| 07 | **The Verdict** | Strategic takeaway + "Why this matters" |

### The three narrative layers
1. **Dominant Narrative** — what the market believes right now.
2. **Sentiment Shift** — what changed and what specifically triggered it.
3. **Forward Position** — what comes next if the narrative holds.

### The four KPIs
**Narrative Strength · Market Sentiment · Narrative Momentum · AI Confidence**

## Mantle ecosystem awareness

The agent is primed to recognize and reference Mantle-specific primitives when the
sources support it: **RWA TVL, Maple Finance / syrupUSDT via Aave, xStocks / tokenized
equities (SpaceX SPCXx), InsightX (AI-native prediction market), QuestFlow, ERC-8004
agent identity, AI Agent Skills, Agent Scaffold, and x402 payments** — positioning
Mantle as the distribution layer for RWAs and the settlement layer for the agent economy.

## Design

A stark, **editorial black-and-white** system: pure black on white, a heavy display
serif (**Fraunces**) for headlines, monospace (**IBM Plex Mono**) for labels, tags and
buttons, a neutral grotesque for body copy, sharp corners, and 1px rules throughout.
Sentiment is encoded with **▲ / ◆ / ▼** glyphs and filled-vs-outline chips rather than
color — the report reads like a printed research note, not an exchange terminal.

## Live

**Frontend (GitHub Pages):** https://faithabiodun.github.io/SandGlass/

The Pages build runs the built-in **Mantle Q1 2026** demo with zero setup, and supports
live analysis with your own key or a hosted backend (below).

## Architecture

```
 Browser ──▶ GitHub Pages (static frontend, index.html)
                  │
                  ├─ Demo mode ............. built-in Mantle Q1 2026 report, no network
                  ├─ Browser key ........... calls the Anthropic API directly
                  └─ Hosted backend ........ POST /api/analyze  ──▶  Anthropic API
                                             (key stays server-side)
```

Because GitHub Pages is static-only, the backend runs as a **serverless function**
(`api/analyze.js`) that holds the Anthropic key and returns the structured 3-layer
report. Deploy it in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/faithabiodun/SandGlass&env=ANTHROPIC_API_KEY&envDescription=Anthropic%20API%20key%20used%20server-side%20to%20call%20Claude)

1. Click **Deploy**, import this repo, and set the `ANTHROPIC_API_KEY` environment variable.
2. Vercel serves the whole app at `https://<your-app>.vercel.app` — live mode works there
   with **no key in the browser** (the frontend auto-uses same-origin `/api/analyze`).
3. To make the *GitHub Pages* build use that backend too, set `BACKEND_URL` near the top
   of `index.html` to `https://<your-app>.vercel.app/api/analyze` and push.

The function is dependency-free (Node 18+ global `fetch`) and CORS-enabled, so it also
runs on any Node host.

## Run it locally

It's a single self-contained `index.html` — no build step, no dependencies.

```bash
open index.html          # macOS — or just double-click the file
# or serve it:
python3 -m http.server   # then visit http://localhost:8000
```

- **Demo mode (no key needed):** click **See a live Mantle example** → **Run Analysis**.
  Runs the built-in **Mantle Q1 2026** dataset (RWA TVL $247.5M / +27.4% QoQ, Maple
  syrupUSDT $90.1M, live SpaceX SPCXx tokenization, InsightX launch) — output always visible.
- **Live mode:** paste your own sources and hit **Run Analysis**. With a backend
  configured, no key is needed; otherwise paste your Anthropic key and the call is made
  directly from your browser. Either way, nothing is stored.

Default model is **Claude Opus 4.8** (Sonnet 5 / Haiku 4.5 selectable), constrained to a
strict JSON contract that forces the three-layer structure and signal chips.

## Screenshots
| Hero | Inputs |
|---|---|
| ![Hero](screenshots/01-hero.png) | ![Inputs](screenshots/02-inputs.png) |
