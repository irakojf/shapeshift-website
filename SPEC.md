# Shapeshift TV Website — Engineering Spec

## Project Overview

Build a single-page, single-viewport website for **Shapeshift**, a video production company.

The entire site is one screen:

- A retro CRT TV bezel
- A masked “screen” window showing a carousel of channels
- Videos + team bio cards
- Keyboard + bezel button navigation
- CRT glitch transition
- Persistent ticker marquee
- Clickable hotspots on bios

No scroll sections. No nav bar. No footer. No extra UI.

This is a **static site**:

- No framework
- No build step
- Single `index.html`
- Linked CSS + deferred JS
- Maximum performance

---

---

# 0. File Structure

shapeshift/
├── index.html
├── style.css
├── main.js
├── config.js # ALL geometry + tunables live here
└── assets/
├── tv-frame.png
├── logo.webp # placeholder allowed
├── videos/
│ ├── hazel.mp4
│ ├── baggu.mp4
│ ├── hightouch.mp4
│ └── podcast.mp4
├── bios/
│ ├── hailey-choi.png
│ ├── jamie-mcneill.png
│ └── ira-ko.png
└── logos/
├── pave.png
├── hightouch.png
├── hazel.png
├── amera.png
├── speakeasy.png
└── portable.png


---

## Asset Notes

Video files are NOT included in uploads.  
Site must reference them anyway and fail gracefully if missing.

Assets provided:

- TV bezel PNG
- Bio PNGs
- Logo ticker PNGs

---

---

# 1. Global UI Requirements (Testable)

## 1.1 Page Styling

- Background: `#4425FC`
- Font: Ubuntu Sans Mono
- Text color: white
- No scrolling
- Everything fits one viewport

CSS baseline:

```css
html, body {
  margin: 0;
  padding: 0;
  background: #4425FC;
  height: 100%;
  overflow: hidden;
  font-family: "Ubuntu Sans Mono", monospace;
  color: #fff;
}
Testable Assertions
Background color == rgb(68, 37, 252)

Font-family includes Ubuntu Sans Mono

No overflow: scrollWidth == clientWidth

1.2 Tagline
Text must match exactly:

Videos that drive growth
Desktop: above TV
Mobile: below TV

Testable:

Desktop: tagline Y < TV Y

Mobile: tagline Y > TV Y

2. TV Player Model (Testable)
2.1 Playlist Order (Fixed)
Circular index order:

hazel.mp4

baggu.mp4

hightouch.mp4

podcast.mp4

hailey-choi.png

jamie-mcneill.png

ira-ko.png

Wrap rules:

Prev from 0 → 6

Next from 6 → 0

Expose attributes:

<div id="tvPlayer"
     data-active-index="0"
     data-active-asset="hazel.mp4">
On load:

activeIndex = 0

asset = hazel.mp4

3. Inputs (Testable)
3.1 Keyboard
Left Arrow → previous

Right Arrow → next

Must NOT work if focus is inside:

input

textarea

select

[contenteditable]

Testable:

Keydown changes index normally

Keydown does nothing when input focused

3.2 UP/DOWN Bezel Hitboxes
Two invisible hit areas:

UP → prev

DOWN → next

Required DOM hooks:

<button data-hitbox="up"></button>
<button data-hitbox="down"></button>
Mobile hitboxes may enlarge but must not overlap.

Testable:

Click up decrements index

Click down increments index

Rectangles do not intersect on mobile

3.3 Screen Click Rules
Clicking inside the screen but not on a hotspot does nothing.

Required hook:

<div class="tv-screen" data-screen>
Testable:

Clicking screen background does NOT change index

4. Screen Compositing + Mask (Testable)
4.1 Layer Structure
TV stack (bottom → top):

Active content (video/image)

Ticker marquee

Hotspot overlays

CRT glitch overlay

Bezel PNG frame

UP/DOWN hitboxes

Required DOM:

<img data-tv-bezel>
<div data-screen>
  <div data-screen-content>
  <div data-ticker>
  <div data-crt>
</div>
4.2 Mask Geometry (Config-Driven)
Screen mask must be tunable via config:

export const MASK = {
  insetTopPct: 8,
  insetRightPct: 22,
  insetBottomPct: 10,
  insetLeftPct: 4,
  radiusPct: 3,
};
CSS:

.tv-screen {
  clip-path: inset(
    8% 22% 10% 4%
    round 3%
  );
}
Mask values must never be scattered.

4.3 Fit Rule
All assets must render as cover:

Videos: object-fit: cover

Images: object-fit: cover

Never letterbox.

Testable:

CSS property == cover

5. Video Playback Contract (Testable)
5.1 Autoplay + Muted
All videos must:

autoplay when active

muted always

playsinline

loop

Testable:

video.muted === true

video.paused === false after activation

5.2 Pause + Resume Time Memory
When leaving a video:

pause it

store currentTime

When returning:

resume from stored time

Expose state:

window.__PLAYER_STATE__.videoTimes
Testable:

Set currentTime=5

Navigate away

Stored time ≈ 5

Navigate back

Resumes near 5

5.3 Preload Policy
Only preload:

current asset

next asset

Expose:

window.__PLAYER_STATE__.preloadedAssets
Testable:

Always exactly 2 assets preloaded

6. CRT Channel Change Effect (Testable)
Trigger on every channel change.

Requirements:

Duration: 150–220ms (target 180ms)

Subtle flicker

Screen-only (never bezel)

No fade to black

Hook:

<div data-crt data-crt-active="true">
Testable:

Attribute becomes true on nav

Clears after duration

Bezel never affected

7. Ticker Tape Marquee (Testable)
7.1 Always Visible
Ticker exists on all channels.

Hook:

<div data-ticker>
7.2 Layout Rules
Anchored bottom of screen

Background #000

Height = 10% of screen

Clamp: 28–56px

Testable:

backgroundColor == rgb(0,0,0)

height within clamp

7.3 Behavior
Continuous leftward scroll

Full loop ≈ 24s

Decorative only (no anchors)

No pause on hover

Expose:

<div data-ticker data-loop-seconds="24">
7.4 Small Screen Logo Subset
If viewport < 380px:

Pave

Hightouch

Hazel

Portable

Else full set:

Pave

Hightouch

Hazel

Amera

Speakeasy

Portable

Expose:

data-logo-set="small|full"
8. Interactive Hotspots (Testable)
Enabled only on bio channels:

ira-ko.png

hailey-choi.png

jamie-mcneill.png

Hotspots must:

Be invisible <a> rectangles

target="_blank"

rel="noopener noreferrer"

Minimum tap size 44px mobile

Never overlap

Clicking elsewhere does nothing

Required:

<a data-hotspot-id="linkedin" href="..." target="_blank"></a>
8.1 Hotspot URLs
ira-ko.png (4)
LinkedIn → https://linkedin.com/in/koira/

Newsletter → https://rabbitduck.xyz

Twitter → https://twitter.com/irajfko

Founder Spotlights → https://instagram.com/shapeshift_stories/

hailey-choi.png (2)
Instagram → https://instagram.com/jingerhail/

Portfolio → https://haileychoi.com

jamie-mcneill.png (4)
LinkedIn → https://linkedin.com/in/jamie-mcneill/

Instagram → https://instagram.com/jmcneill6/

Milkteeth → https://youtube.com/watch?v=wtecRgmowFk

Legendary → https://legendary.com/

9. Deterministic Test Mode (Required)
Enable via:

?test=1
In test mode:

CRT deterministic

Marquee frozen at translateX=0 unless &marquee=run

Internal state exposed:

window.__PLAYER_STATE__ = {
  activeIndex,
  activeAsset,
  preloadedAssets,
  videoTimes
};
Debug Overlay
Enable:

?test=1&debug=1
Draw outlines for:

Screen mask

Ticker bounds

Hitboxes

Hotspots

Never visible in production.

10. Automated Testing Requirements
Playwright suite must cover:

Initial state index 0

Wrap navigation

Keyboard focus gating

UP/DOWN hitbox clicks

Screen click no-op

Video pause/resume persistence

Preload correctness

Hotspot URL validation

Ticker logo subset switching

CRT timing + bezel exclusion

All screenshots must run in ?test=1 with marquee frozen.

End of Spec