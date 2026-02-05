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
// Coordinates are STARTING approximations; Codex should visually tune.
export const HOTSPOTS = {};

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
