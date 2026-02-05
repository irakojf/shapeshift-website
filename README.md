# Shapeshift TV Website

Single-page static site. No build step.

## Quick Start
1. Open `src/index.html` in a browser.
2. Optionally, run a static server from the repo root:
   - `python3 -m http.server 8000`
   - Visit `http://localhost:8000/src/`

## Project Layout
- `src/index.html` HTML entry
- `src/css/style.css` styles
- `src/js/main.js` behavior
- `src/js/config.js` geometry + tunables
- `assets/` shared media assets

## Notes
- The page is designed to fit a single viewport (no scrolling).
- Videos may be missing locally; the site should fail gracefully.
