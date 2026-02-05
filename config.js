// config.js
// ALL tunable geometry + behavioral constants live here.
// Codex should edit these values (and only these) during visual tuning.

export const CONFIG = {
  // Fixed playlist order — DO NOT CHANGE.
  PLAYLIST: [
    { type: "video", filename: "hazel.mp4", src: "assets/videos/hazel.mp4" },
    { type: "video", filename: "baggu.mp4", src: "assets/videos/baggu.mp4" },
    { type: "video", filename: "hightouch.mp4", src: "assets/videos/hightouch.mp4" },
    { type: "video", filename: "podcast.mp4", src: "assets/videos/podcast.mp4" },
    { type: "image", filename: "hailey-choi.png", src: "assets/bios/hailey-choi.png" },
    { type: "image", filename: "jamie-mcneill.png", src: "assets/bios/jamie-mcneill.png" },
    { type: "image", filename: "ira-ko.png", src: "assets/bios/ira-ko.png" },
  ],

  // Screen mask — percentage inset relative to tv-container box.
  MASK: {
    insetTopPct: 8,
    insetRightPct: 22,
    insetBottomPct: 10,
    insetLeftPct: 4,
    radiusPct: 3,
  },

  // Bezel hitboxes (percentages relative to tv-container box).
  // These are STARTING points; Codex should visually tune.
  HITBOXES: {
    up: { topPct: 52, rightPct: 1, widthPct: 8, heightPct: 10 },
    down: { topPct: 67, rightPct: 1, widthPct: 8, heightPct: 10 },
    mobileScale: 1.5, // multiplier applied under 768px to width/height only
  },

  // CRT effect
  CRT: {
    durationMs: 180, // must be 150–220
  },

  // Ticker behavior
  TICKER: {
    loopSeconds: 24,
    heightPctOfScreen: 10, // % of screen height
    heightMinPx: 28,
    heightMaxPx: 56,
    bg: "#000000",
    // logo sets
    fullSet: ["pave.png", "hightouch.png", "hazel.png", "amera.png", "speakeasy.png", "portable.png"],
    smallSet: ["pave.png", "hightouch.png", "hazel.png", "portable.png"], // <380px
  },

  // Hotspots — rectangles are defined in % relative to the "content area ABOVE ticker".
  // Coordinates are STARTING approximations; Codex should visually tune.
  HOTSPOTS: {
    "hailey-choi.png": [
      {
        id: "instagram",
        href: "https://instagram.com/jingerhail/",
        rect: { topPct: 74, leftPct: 2, widthPct: 32, heightPct: 8 },
      },
      {
        id: "portfolio",
        href: "https://haileychoi.com",
        rect: { topPct: 74, leftPct: 38, widthPct: 28, heightPct: 8 },
      },
    ],
    "jamie-mcneill.png": [
      {
        id: "linkedin",
        href: "https://linkedin.com/in/jamie-mcneill/",
        rect: { topPct: 72, leftPct: 2, widthPct: 35, heightPct: 8 },
      },
      {
        id: "instagram",
        href: "https://instagram.com/jmcneill6/",
        rect: { topPct: 72, leftPct: 40, widthPct: 30, heightPct: 8 },
      },
      // The stricter Codex spec includes these two extra hotspots:
      {
        id: "milkteeth",
        href: "https://www.youtube.com/watch?v=wtecRgmowFk",
        rect: { topPct: 83, leftPct: 8, widthPct: 28, heightPct: 10 },
      },
      {
        id: "legendary",
        href: "https://www.legendary.com/",
        rect: { topPct: 83, leftPct: 40, widthPct: 28, heightPct: 10 },
      },
    ],
    "ira-ko.png": [
      {
        id: "linkedin",
        href: "https://linkedin.com/in/koira/",
        rect: { topPct: 72, leftPct: 2, widthPct: 28, heightPct: 8 },
      },
      {
        id: "newsletter",
        href: "https://rabbitduck.xyz",
        rect: { topPct: 72, leftPct: 35, widthPct: 30, heightPct: 8 },
      },
      {
        id: "twitter",
        href: "https://twitter.com/irajfko",
        rect: { topPct: 72, leftPct: 70, widthPct: 25, heightPct: 8 },
      },
      {
        id: "producer_founder_spotlights",
        href: "https://www.instagram.com/shapeshift_stories/",
        rect: { topPct: 83, leftPct: 8, widthPct: 65, heightPct: 12 },
      },
    ],
  },
};
