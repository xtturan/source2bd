---
name: taste-audit-v2
description: Audits and fixes web UI visual taste — typography, hierarchy, restraint, spacing rhythm, color economy, surface/material systems, motion, and responsive/dark-mode integrity. Verifies against a real rendered screenshot, then ships the fixes. Triggers on taste, polish, refinement, "make it premium", "feels generic", "looks AI-made", or any design-quality review.
---

# Taste Audit v2

Taste is what's removed. v2 adds three things over a plain checklist: **evidence
first** (audit the rendered pixels, not the source), **fix, don't just flag**,
and **verify** the fix in a second render.

## Loop

1. **Capture.** Screenshot every surface in scope with Playwright at 1280w and
   390w. Never audit from source alone — CSS lies, rendering doesn't.
2. **Audit.** Walk sections 1–9 below against the captures.
3. **Fix.** Apply the highest-severity findings at the token layer first
   (`src/styles.css`), component layer second, page layer last. A fix repeated
   in three components is a missing token.
4. **Verify.** Re-render and diff. Report only what the second render confirms.

## 1. Typography

- Type scale ≤ 6 sizes per page; ≤ 3 weights per family.
- Line-height by role: display 0.95–1.1, body 1.5–1.7, UI labels 1.2–1.3.
- Measure 45–75ch for prose. 100ch+ on desktop is a fail.
- Tracking inverse to size: display −0.02 to −0.04em, all-caps micro-labels
  +0.05 to +0.1em, body 0.
- `tabular-nums` on any column of digits, price, or timer.
- Optical alignment: hanging punctuation and flush-left ragged-right for prose;
  never justified text on the web.
- Banned fingerprint: default Inter/Poppins/Roboto paired with a purple→indigo
  gradient on white.

## 2. Hierarchy

- One H1. The visually largest element is the most important element.
- ~1.4–1.6× size jump between levels. Everything at 16–24px = no hierarchy.
- Exactly one primary action per surface. 3+ equal CTAs = zero CTAs.
- Squint test: intended reading order legible in under one second.

## 3. Restraint

- Every decoration must do work. Orbs, sparkles, glow rings, particle fields:
  default verdict is cut.
- ≤ 2 motion ideas per surface.
- One radius system (e.g. 4/8/16); siblings never mix `rounded-md` with
  `rounded-full` arbitrarily.
- ≤ 3 elevation levels site-wide, defined as tokens. A component inventing its
  own shadow is a finding.
- Gradients: zero, or one reused token. Never per-component improvisation.

## 4. Spacing rhythm

- 4/8px base unit; flag arbitrary values (`mt-[13px]`, `py-7`).
- Section rhythm follows a scale (48/64/96/128), not ad-hoc `mt-10`/`mt-14`.
- Hug vs. fill decided explicitly, not inherited by accident.
- Optical padding beats mathematical padding: icon-left buttons need less
  leading padding than trailing.

## 5. Color economy

- ≤ 5 hues + one neutral ramp.
- Semantic tokens only. Any `text-white`, `bg-black`, `bg-[#0f0f0f]` in a
  component is `taste-critical`.
- WCAG AA minimum for body text; AAA preferred. `text-muted-foreground/50` on a
  dark ground is a fail.
- Accent appears on < 10% of pixels. Everywhere = nowhere.

## 6. Surface & material (new in v2)

A premium UI reads as a *material system*, not a set of boxes.

- Pick one material language and hold it: flat-ink, matte glass, paper, or
  soft-depth. Mixing glassmorphism with hard drop-shadow cards is a finding.
- Borders are hairlines derived from the foreground color at low alpha
  (`border-navy/8`), not opaque grey (`#e5e7eb`).
- Translucent surfaces need a ground worth blurring: a gradient wash, image, or
  tinted background. Glass over flat white is wasted blur.
- Add an inset top hairline (`inset 0 1px 0 rgb(255 255 255 / .6)`) on raised
  light surfaces — this is what reads as "expensive".
- Kill plastic sheen with a fine grain/noise overlay at ≤ 6% opacity.
- Never hand-write `-webkit-backdrop-filter`; the build adds prefixes and a
  manual one silently deletes the standard property.

## 7. Motion

- Durations: micro 120–180ms, surface transitions 200–320ms. Nothing over 500ms
  unless it's a deliberate hero moment.
- Easing: `cubic-bezier(.2,.8,.2,1)` for entrances, linear only for spinners.
- Animate `transform` and `opacity` only. Animating `width`/`top`/`box-shadow`
  is jank.
- Respect `prefers-reduced-motion`. Missing = `taste-critical`.
- Hover effects must have a visible focus-visible equivalent.

## 8. Responsive & state integrity (new in v2)

- Audit 390w as a first-class surface, not a squeezed desktop.
- Display type must reflow: a 72px headline at 390w is a fail.
- Check every state, not just the happy one: loading skeleton, empty, error,
  long-string overflow, and 3-line-title wrap.
- Fixed bottom bars/docks must not cover the last interactive element — verify
  bottom padding.
- Dark mode is audited separately; inverted tokens that lose contrast or make
  glass invisible are findings.

## 9. The "would a designer ship this" test

- Is anything here because it was *easy* (default utility) rather than *right*?
- Would it survive a Linear / Vercel / Stripe design review?
- What's the one thing you'd cut first? There is always one. Cut it.

## Output format

Group by surface. Each finding:

- **Violation** — which rule
- **Where** — file + line
- **Fix** — one sentence, concrete
- **Severity** — `taste-critical` (reads generic/AI or breaks a11y),
  `taste-warning` (inconsistent system), `taste-polish` (could be sharper)

Close with **Cut list**: the 3 things removed, and **Token deltas**: variables
added or changed. If you only flagged and did not fix, say so explicitly.
