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

## Test / Debug Mode

Append query parameters to enable deterministic testing:

| URL | Behavior |
|-----|----------|
| `?test=1` | Freezes ticker marquee, exposes `window.__PLAYER_STATE__` |
| `?test=1&debug=1` | Same as above + enables debug overlay |
| `?test=1&marquee=run` | Test mode with marquee animation running |

### `window.__PLAYER_STATE__`

Available in test mode for Playwright or console inspection:

```js
{
  activeIndex: 0,        // Current channel index (0-7)
  activeAsset: "hazel-pt-2.mp4",  // Filename of active asset
  preloadedAssets: [...], // List of preloaded asset filenames
  videoTimes: { 0: 12.5 } // Saved playback positions per channel
}
```

### Data Attributes for Selectors

| Selector | Element |
|----------|---------|
| `[data-screen]` | TV screen container |
| `[data-tv-player]` | Player with channels |
| `[data-channel="N"]` | Individual channel (0-7) |
| `[data-ticker]` | Ticker marquee |
| `[data-crt]` | CRT glitch overlay |
| `[data-hitbox="up"]` | Previous channel button |
| `[data-hitbox="down"]` | Next channel button |
| `[data-hotspot-id="..."]` | Bio hotspot link |
| `[data-mobile-links]` | Mobile link buttons |

## Notes
- The page is designed to fit a single viewport (no scrolling).
- Videos may be missing locally; the site should fail gracefully.
