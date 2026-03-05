// config.js
// ALL tunable geometry + behavioral constants live here.
// Codex should edit these values (and only these) during visual tuning.

// Screen mask — percentage inset relative to tv-container box.
export const MASK = {
  insetTopPct: 8,
  insetRightPct: 20,
  insetBottomPct: 16.5,
  insetLeftPct: 6,
  radiusPct: 5,
};

// Playlist order
export const PLAYLIST = [
  { type: "video", filename: "hazel-pt-2.mp4", src: "assets/videos/hazel-pt-2.mp4", srcWebm: "assets/videos/hazel-pt-2.webm", poster: "assets/videos/posters/hazel-pt-2.jpg" },
  { type: "video", filename: "podcast.mp4", src: "assets/videos/podcast.mp4", srcWebm: "assets/videos/podcast.webm", poster: "assets/videos/posters/podcast.jpg" },
  { type: "video", filename: "hightouch.mp4", src: "assets/videos/hightouch.mp4", srcWebm: "assets/videos/hightouch.webm", poster: "assets/videos/posters/hightouch.jpg" },
  { type: "video", filename: "hazel.mp4", src: "assets/videos/hazel.mp4", srcWebm: "assets/videos/hazel.webm", poster: "assets/videos/posters/hazel.jpg" },
  { type: "video", filename: "amera.mp4", src: "assets/videos/amera.mp4", srcWebm: "assets/videos/amera.webm", poster: "assets/videos/posters/amera.jpg" },
  { type: "image", filename: "hailey-choi.jpg", src: "assets/bios/hailey-choi.jpg" },
  { type: "image", filename: "jamie-mcneill.jpg", src: "assets/bios/jamie-mcneill.jpg" },
  { type: "image", filename: "ira-ko.jpg", src: "assets/bios/ira-ko.jpg" },
];

// Bezel hitboxes (percentages relative to tv-container box).
// These are STARTING points; Codex should visually tune.
export const HITBOXES = {
  up: { topPct: 70, rightPct: 1, widthPct: 10, heightPct: 5 },
  down: { topPct: 80, rightPct: 1, widthPct: 10, heightPct: 5 },
  mobileScale: 1.5, // multiplier applied under 768px to width/height only
};

// CRT effect
export const CRT = {
  durationMs: 180, // must be 150–220
};

// Ticker behavior
export const TICKER = {
  loopSeconds: 24,
  heightPctOfScreen: 8, // % of screen height
  heightMinPx: 24,
  heightMaxPx: 56,
  bg: "#000000",
  // logo sets
  fullSet: [
    "PAVE_WHITE.svg",
    "HIGHTOUCH_WHITE.svg",
    "HAZEL_WHITE.svg",
    "AMERA_WHITE.svg",
    "SPEAKEASY_WHITE.svg",
    "PORTABLE_WHITE.svg",
  ],
  smallSet: [
    "PAVE_WHITE.svg",
    "HIGHTOUCH_WHITE.svg",
    "HAZEL_WHITE.svg",
    "PORTABLE_WHITE.svg",
  ], // <380px
};

// Hotspots — rectangles are defined in % relative to the "content area ABOVE ticker".
// Coordinates are STARTING approximations; visually tune as needed.
export const HOTSPOTS = {
  "hailey-choi.jpg": [
    { id: "instagram", href: "https://instagram.com/jingerhail/", rect: { topPct: 2, leftPct: 48, widthPct: 50, heightPct: 35 } },
    { id: "portfolio", href: "https://haileychoi.com", rect: { topPct: 76, leftPct: 2, widthPct: 36, heightPct: 22 } },
  ],
  "jamie-mcneill.jpg": [
    { id: "linkedin", href: "https://linkedin.com/in/jamie-mcneill/", rect: { topPct: 2, leftPct: 45, widthPct: 52, heightPct: 28 } },
    { id: "instagram", href: "https://instagram.com/jmcneill6/", rect: { topPct: 32, leftPct: 45, widthPct: 52, heightPct: 18 } },
    { id: "legendary", href: "https://legendary.com/", rect: { topPct: 80, leftPct: 3, widthPct: 28, heightPct: 17 } },
    { id: "milkteeth", href: "https://youtube.com/watch?v=wtecRgmowFk", rect: { topPct: 80, leftPct: 66, widthPct: 28, heightPct: 17 } },
  ],
  "ira-ko.jpg": [
    { id: "linkedin", href: "https://linkedin.com/in/koira/", rect: { topPct: 2, leftPct: 45, widthPct: 52, heightPct: 25 } },
    { id: "twitter", href: "https://twitter.com/irajfko", rect: { topPct: 30, leftPct: 45, widthPct: 52, heightPct: 18 } },
    { id: "newsletter", href: "https://rabbitduck.xyz", rect: { topPct: 76, leftPct: 2, widthPct: 33, heightPct: 22 } },
    { id: "producer_founder_spotlights", href: "https://instagram.com/shapeshift_stories/", rect: { topPct: 76, leftPct: 37, widthPct: 45, heightPct: 22 } },
  ],
};

/**
 * Global configuration for geometry + tunables.
 * @type {{
 *   PLAYLIST: Array<{ type: 'video' | 'image', filename: string, src: string, srcWebm?: string, poster?: string }>,
 *   MASK: { insetTopPct: number, insetRightPct: number, insetBottomPct: number, insetLeftPct: number, radiusPct: number },
 *   HITBOXES: { up: { topPct: number, rightPct: number, widthPct: number, heightPct: number }, down: { topPct: number, rightPct: number, widthPct: number, heightPct: number }, mobileScale: number },
 *   CRT: { durationMs: number },
 *   TICKER: { loopSeconds: number, heightPctOfScreen: number, heightMinPx: number, heightMaxPx: number, bg: string, fullSet: string[], smallSet: string[] },
 *   HOTSPOTS: Record<string, Array<{ id: string, href: string, rect: { topPct: number, leftPct: number, widthPct: number, heightPct: number } }>>
 * }}
 */
export const CONFIG = {
  PLAYLIST,
  MASK,
  HITBOXES,
  CRT,
  TICKER,
  HOTSPOTS,
};
