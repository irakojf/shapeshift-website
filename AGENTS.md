# Shapeshift TV Website — Agent Rules & Engineering Contract

## Overview

This repository contains the Shapeshift website: a single-page responsive hero experience featuring:

- A CRT TV bezel with a masked “screen”
- A playlist of videos + static bio images
- Keyboard + bezel button navigation (UP/DOWN)
- A subtle CRT channel-change transition
- A persistent bottom ticker tape logo marquee
- Clickable hotspots on bio images

This file defines how all agents (Codex, contributors, automation) must work in this codebase.

---

## Core Principles

### Spec-First Implementation
Do not invent UI, copy, or interactions.
Implement exactly what is described in `SPEC.md`.

### Performance Over Complexity
Favor lightweight DOM + CSS transforms.
No unnecessary runtime dependencies.

### Config-Driven Geometry
All tunable rectangles must live in ONE config file:

- Screen mask inset + radius
- UP/DOWN hitbox rectangles
- Hotspot rectangles
- Ticker parameters
- Playlist order

Never scatter geometry across components.

### Deterministic Testing Required
All animations must be controllable in test mode.
Visual regression must be stable and repeatable.

---

## Project Requirements (Must Not Change)

### Visual Baseline
- Background: `#4425FC`
- Font: Ubuntu Sans Mono
- Layout matches provided desktop/mobile screenshots
- No scrolling

---

## Playlist Order (Fixed)

Circular index order:

0. hazel.mp4  
1. baggu.mp4  
2. hightouch.mp4  
3. podcast.mp4  
4. hailey-choi.png  
5. jamie-mcneill.png  
6. ira-ko.png  

Wrap rules:

- Previous from 0 → 6  
- Next from 6 → 0  

---

## Interaction Contract

### Keyboard
- Left Arrow → previous
- Right Arrow → next

Must NOT navigate when focus is inside:

- input
- textarea
- [contenteditable]

---

### Bezel Hitboxes

Two invisible rectangular hit areas:

- UP → previous
- DOWN → next

Mobile hitboxes may enlarge but must never overlap.

Required DOM hooks:

```html
[data-hitbox="up"]
[data-hitbox="down"]

Screen Click Rules

Clicking inside the TV screen (not on hotspots) does nothing.

No click-to-advance behavior.

Video Playback Rules

All videos must:

Autoplay when active

Be muted always

Play inline on mobile

Loop while active

Pause + store playback time when inactive

Resume from stored time when revisited

Preload policy:

Preload only current + next asset

Never preload all assets

CRT Channel Change Effect

On every asset change:

Trigger subtle CRT flicker/glitch

Duration: ~180ms (150–220ms)

Applies to screen-only (content + ticker)

Never affects bezel

Never fades to black

Required hook:

[data-crt-active="true"]

Ticker Tape Marquee

Always visible inside the screen window:

Continuous leftward marquee

Full loop ~24s

Decorative only (not clickable)

Background: #000

Height: 10% of screen, clamped 28–56px

Logo sets:

Full (≥380px):

Pave, Hightouch, Hazel, Amera, Speakeasy, Portable

Small (<380px):

Pave, Hightouch, Hazel, Portable

Required DOM hook:

[data-ticker]

Bio Image Hotspots

Enabled only on:

ira-ko.png

hailey-choi.png

jamie-mcneill.png

Hotspots must:

Be invisible rectangles

Open links in new tab

Use noopener noreferrer

Minimum tap size ~44px mobile

Never overlap

Required hook:

<a data-hotspot-id="...">

Deterministic Test Mode (Required)

Enable via:

?test=1


In test mode:

CRT glitch deterministic

Marquee frozen at translateX=0 unless &marquee=run

Internal state exposed:

window.__PLAYER_STATE__ = {
  activeIndex,
  activeAsset,
  preloadedAssets,
  videoTimes
};


Debug overlay:

?test=1&debug=1


Draw outlines for:

Screen mask

Ticker bounds

Hitboxes

Hotspots

Never appears in production.

Definition of Done

A change is complete when:

All Playwright tests pass

Visual snapshots match expected layouts

Test mode + debug overlay work correctly

No geometry overlaps exist

Performance remains smooth on mobile

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
