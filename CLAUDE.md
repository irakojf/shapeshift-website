# Shapeshift Website

Interactive TV player website for Shapeshift video production studio.

## Project Structure

```
src/
├── index.html          # Main HTML entry point
├── css/style.css       # All styles (mobile-first responsive)
├── js/
│   ├── main.js         # App logic, navigation, channel switching
│   └── config.js       # All tunable constants (mask, hotspots, etc.)
└── assets/
    ├── videos/         # Channel video content
    ├── bios/           # Team bio images
    ├── logos/          # Ticker logos
    └── images/         # TV frame, logo
```

## Development

```bash
cd src && python3 -m http.server 8000
```

Open http://localhost:8000

## Configuration

All visual tuning is in `src/js/config.js`:

- **MASK** - Screen positioning within TV bezel (inset percentages)
- **HITBOXES** - Navigation button click areas
- **HOTSPOTS** - Clickable regions on bio cards
- **TICKER** - Logo marquee settings
- **CRT** - Glitch transition timing

## Deployment

Hosted on Vercel with root directory set to `src/`. Domain: shapeshift.so

## Git Commits

Do NOT include `Co-Authored-By: Claude` lines in commit messages.
