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

---

## 2026-03 Feature: QuickBooks Compliance Documentation for cpapacket

Date: March 2026
Trigger: QuickBooks production API approval requires public-facing compliance pages (legal URLs, support contact, integration description) before Intuit will issue production credentials for the `cpapacket` internal reporting tool.

### Goals & Non-Goals

**Must-have:**
- All URLs required by Intuit for production app submission live and publicly accessible over HTTPS
- Landing page, Privacy Policy, Terms/EULA, Connect, and Disconnect pages
- Consistent "private internal reporting tool" framing across all pages
- Support email (`accounting@shapeshift.so`) visible on every page
- Reviewer can understand the integration's purpose in under 30 seconds

**Nice-to-have:**
- `noindex` meta tags to reduce unnecessary search visibility
- Reusable pattern for future internal app compliance pages under the same namespace
- Lightweight shared shell/footer template across all compliance pages

**Explicitly out-of-scope:**
- Any browser-facing `cpapacket` functionality or dashboard
- OAuth backend or authentication on the website itself
- Redesigning the root `shapeshift.so` homepage
- Analytics, tracking, or lead-generation forms
- Converting the site to React/Next/Vite or any build toolchain
- Making `cpapacket` a public SaaS product

### Proposed Changes / New Feature: cpapacket Compliance Site

**High-level description:**
Add a static compliance website at `apps.shapeshift.so/cpapacket` with five pages (landing, privacy, terms, connect, disconnect) that satisfy Intuit's production app review requirements. All pages are plain HTML/CSS, no JS, no build step — matching the existing repo philosophy.

**Why now:**
Intuit production app review will not issue production API credentials without publicly accessible legal, support, and integration description URLs. This blocks `cpapacket` from moving out of sandbox.

**Architectural impact:**
- New subdomain: `apps.shapeshift.so` (DNS + SSL provisioning required)
- New directory tree under `src/cpapacket/` with `index.html` files per route
- Optional `compliance.css` for legal page typography (does not touch existing `style.css`)
- No breaking changes to the existing TV player site
- No new runtime dependencies

**Route structure:**
| Field | URL |
|---|---|
| Host domain | `apps.shapeshift.so` |
| Landing page | `https://apps.shapeshift.so/cpapacket` |
| Launch / Connect URL | `https://apps.shapeshift.so/cpapacket/connect` |
| Disconnect URL | `https://apps.shapeshift.so/cpapacket/disconnect` |
| Privacy Policy | `https://apps.shapeshift.so/cpapacket/privacy` |
| Terms / EULA | `https://apps.shapeshift.so/cpapacket/terms` |

**UX considerations:**
- Readability over spectacle — legal text needs high-contrast, readable typography (not the TV-centric hero layout)
- Mobile-friendly: narrow content container, no horizontal scroll, tappable support email
- Restrained branding: enough to look legitimate, not so much it looks like marketing
- Accessibility: semantic headings, keyboard-navigable links, no JS dependency

**Test strategy:**
- Manual functional checks: all five routes load independently, all links resolve, no 404s
- Content validation: support email identical on all pages, "QuickBooks Online" consistently spelled, "private internal" language present, no accidental AI/payments/marketplace language
- Mobile QA: iPhone Safari + Chrome Android viewport checks
- Automated (optional): HTML linting, link checker, Lighthouse accessibility/performance pass

### Epics

| Epic | Scope | Priority |
|---|---|---|
| E1 | Site foundation: route structure under `/cpapacket`, DNS/SSL for `apps.shapeshift.so` | P0 |
| E2 | Landing page with integration overview, data access/usage, auth summary, support contact | P0 |
| E3 | Privacy Policy page | P0 |
| E4 | Terms / EULA page | P0 |
| E5 | Connect page (Launch URL + Connect/Reconnect URL) | P0 |
| E6 | Disconnect page | P0 |
| E7 | Shared layout: header/footer shell, `compliance.css`, consistent branding | P0 |
| E8 | SEO/metadata: titles, descriptions, canonicals, optional `noindex` | P1 |
| E9 | QA: link validation, copy consistency, reviewer readiness smoke test | P0 |

### Architectural Decisions

- **ADR-1: Path-based routing** (`apps.shapeshift.so/cpapacket/...`) instead of `cpapacket.shapeshift.so` — cleaner namespace for future integrations, avoids confusion with root marketing site
- **ADR-2: Static and serverless** — pages are informational only; no backend avoids deploy complexity and auth surface area
- **ADR-3: Do not reuse TV hero layout** — legal text requires readability; reviewer friction increases if pages look like art projects
- **ADR-4: Optimize for reviewer scan speed** — every page self-explanatory in the first viewport, support contact always visible
- **ADR-5: Shared content shell** — common header/footer pattern across all pages for consistency and lower maintenance

### Risks & Mitigations

- **Risk:** Reviewer lands on wrong page and is confused
  Mitigation: Both landing page and connect page are self-explanatory with cross-links
- **Risk:** Copy accidentally implies public distribution or multi-tenant usage
  Mitigation: Repeatedly use "private internal reporting tool" phrasing; content validation checklist
- **Risk:** Privacy policy conflicts with actual app data handling behavior
  Mitigation: Match wording to real token/data handling; review against QuickBooks questionnaire answers
- **Risk:** Static nested routes fail on hosting platform
  Mitigation: Test deployed URLs directly before submission; use `index.html` per directory
- **Risk:** Homepage JS/CSS leaks into compliance pages
  Mitigation: Compliance pages are structurally isolated; optional dedicated `compliance.css`
- **Risk:** Support email `accounting@shapeshift.so` is unmonitored
  Mitigation: Confirm alias exists and is monitored before submission

### Assumptions

- `apps.shapeshift.so` can be provisioned with valid SSL on current hosting
- `accounting@shapeshift.so` exists and is monitored
- Existing site assets (logo) can be reused
- Compliance site does not need backend OAuth handling
- Path-based static routing works on the hosting platform (Vercel)

### Estimated Effort & Dependencies

**Phases:**
- Phase 0: Provision `apps.shapeshift.so` (DNS, SSL, hosting config)
- Phase 1: Foundation — route structure, shared shell, compliance styles
- Phase 2: Content pages — landing, privacy, terms, connect, disconnect
- Phase 3: Metadata & hardening — titles, descriptions, canonicals, robots
- Phase 4: Submission readiness — deployed smoke test, paste URLs into Intuit form

**Blocks:** Nothing in the existing TV player site; this is a parallel workstream.
**Blocked by:** DNS/SSL provisioning for `apps.shapeshift.so`

### Content Reference

All page copy (landing, privacy, terms, connect, disconnect) is fully drafted in the feature spec document. See `feature_quickbooks_documentaiton_cpapacket.md` Appendix A for final copy.

### Submission Alignment Checklist

Before submitting to Intuit, verify:
- Host domain is `apps.shapeshift.so`
- Launch URL is `/cpapacket/connect`
- Connect/Reconnect URL is `/cpapacket/connect`
- Disconnect URL is `/cpapacket/disconnect`
- Privacy URL is `/cpapacket/privacy`
- Terms URL is `/cpapacket/terms`
- Support email appears on every page
- Pages publicly load over HTTPS
- Copy consistently says: private, internal, QuickBooks Online, reporting only, no payments, no public marketplace distribution

### Next Actions

- Refine this section with dueling-model critique
- Confirm DNS/hosting strategy for `apps.shapeshift.so` on Vercel
- Confirm `accounting@shapeshift.so` is a live, monitored alias
- Convert epics to beads
- Begin Phase 0 (provisioning) in parallel with Phase 1 (foundation)