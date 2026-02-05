# Shapeshift Website — Implementation Plan

Execute phases in order. Do NOT skip ahead.
Each phase has a verification checkpoint.

Reference `SPEC.md` for exact requirements and geometry rules.

---

## Phase 0 — Project Setup

Goal: Scaffold loads correctly.

Tasks:
- Create directory structure
- Copy assets into correct folders
- Create index.html, style.css, main.js
- Load Ubuntu Sans Mono
- Background color #4425FC
- No scrollbars

Verification:
- Blank page loads
- No console errors
- Assets in correct paths

---

## Phase 1 — Static Layout

Goal: Logo + tagline + TV frame positioned correctly.

Desktop:
Logo → Tagline → TV

Mobile:
Logo → TV → Tagline

Verification:
- Fits viewport 320px–1920px
- No overflow

---

## Phase 2 — Screen Masking

Goal: TV screen window is clipped correctly.

Tasks:
- Add `.tv-screen`
- Apply clip-path inset config
- Ensure scaling works

Verification:
- Content only visible through CRT opening

---

## Phase 3 — Channel DOM Setup

Goal: All 7 channels exist.

- 4 videos
- 3 bio cards

Channel 0 visible on load.

Verification:
- Only active channel displayed
- Videos fail gracefully if missing

---

## Phase 4 — Navigation Core

Goal: Channel switching works with wraparound.

Inputs:
- ArrowLeft / ArrowRight
- UP/DOWN bezel buttons

Behavior:
- Videos pause + resume correctly
- Time remembered per video

Verification:
- Full cycle works without errors

---

## Phase 5 — CRT Glitch Transition

Goal: Every channel switch flickers (~180ms).

Rules:
- New content swaps FIRST
- Glitch overlays on top
- Never black frame

Verification:
- Rapid switching stable

---

## Phase 6 — Ticker Marquee

Goal: Persistent scrolling logo strip.

Rules:
- Visible on all channels
- Height clamp 28–56px
- Small logo subset under 380px

Verification:
- Seamless loop, decorative only

---

## Phase 7 — Bio Hotspots + Mobile Links

Goal: Bio cards contain invisible clickable regions.

Rules:
- Hotspots only on bio channels
- No overlap
- Mobile shows link buttons below TV

Verification:
- Correct URLs open
- Clicking screen elsewhere does nothing

---

## Phase 8 — Deterministic Test Mode + Playwright

Goal: Repo is automation-safe.

Requirements:
- ?test=1 freezes marquee
- Expose window.__PLAYER_STATE__
- Debug overlay mode

Verification:
- Playwright suite passes headless
- Visual regression stable