/**
 * Main entry point for Shapeshift website
 */

import { CONFIG } from './config.js';

// Test/debug mode detection
const urlParams = new URLSearchParams(window.location.search);
export const isTestMode = urlParams.has('test') && urlParams.get('test') === '1';
export const isDebugMode = isTestMode && urlParams.has('debug') && urlParams.get('debug') === '1';
const marqueeRun = urlParams.has('marquee') && urlParams.get('marquee') === 'run';

// Navigation state
/**
 * Runtime player state.
 * @type {{
 *   activeIndex: number,
 *   totalChannels: number,
 *   videoTimes: Record<number, number>
 * }}
 */
const state = {
  activeIndex: 0,
  totalChannels: 7,
  videoTimes: {}
};

// DOM references
let channels = [];
let videos = [];
let bios = [];
let crtOverlay = null;
let tvPlayer = null;
let hotspotLayer = null;
let mobileLinks = null;
let ticker = null;
let tickerTrack = null;
let crtTimeout = null;
let preloadedAssets = [];
let hitboxUpEl = null;
let hitboxDownEl = null;

const HOTSPOT_MIN_TAP = 44;
const MOBILE_MAX_WIDTH = 768;
const HOTSPOT_LABELS = {
  instagram: 'Instagram',
  portfolio: 'Portfolio',
  linkedin: 'LinkedIn',
  newsletter: 'Newsletter',
  twitter: 'Twitter',
  producer_founder_spotlights: 'Founder Spotlights',
  milkteeth: 'Milkteeth',
  legendary: 'Legendary'
};

const hotspotItems = [];

/**
 * Update window.__PLAYER_STATE__ for testing and debugging
 */
function updatePlayerState() {
  if (!window.__PLAYER_STATE__) {
    window.__PLAYER_STATE__ = {};
  }

  window.__PLAYER_STATE__ = {
    activeIndex: state.activeIndex,
    activeAsset: getAssetName(state.activeIndex),
    preloadedAssets: [...preloadedAssets],
    videoTimes: { ...state.videoTimes }
  };
}

// Initialize player state
updatePlayerState();

function getAssetName(index) {
  const src = CONFIG.PLAYLIST[index]?.src || '';
  return src.split('/').pop() || '';
}

function applyMaskFromConfig() {
  const mask = CONFIG.MASK;
  if (!mask) return;

  const root = document.documentElement;
  root.style.setProperty('--mask-top', `${mask.insetTopPct}%`);
  root.style.setProperty('--mask-right', `${mask.insetRightPct}%`);
  root.style.setProperty('--mask-bottom', `${mask.insetBottomPct}%`);
  root.style.setProperty('--mask-left', `${mask.insetLeftPct}%`);
  root.style.setProperty('--mask-radius', `${mask.radiusPct}%`);

  const crtDuration = CONFIG.CRT?.durationMs;
  if (crtDuration) {
    root.style.setProperty('--crt-duration', `${crtDuration}ms`);
  }

  const ticker = CONFIG.TICKER;
  if (ticker) {
    root.style.setProperty(
      '--ticker-height',
      `clamp(${ticker.heightMinPx}px, ${ticker.heightPctOfScreen}%, ${ticker.heightMaxPx}px)`
    );
  }
}

function syncTvPlayerData(index) {
  if (!tvPlayer) return;
  tvPlayer.dataset.activeIndex = index;
  const assetName = getAssetName(index);
  if (assetName) {
    tvPlayer.dataset.activeAsset = assetName;
  }
}

function isMobileViewport() {
  return window.innerWidth <= MOBILE_MAX_WIDTH;
}

function applyHitboxesFromConfig() {
  const hitboxes = CONFIG.HITBOXES;
  if (!hitboxes) return;
  const scale = isMobileViewport() ? (hitboxes.mobileScale || 1) : 1;

  const applyBox = (el, box) => {
    if (!el || !box) return;
    const widthPct = box.widthPct * scale;
    const heightPct = box.heightPct * scale;
    el.style.top = `${box.topPct}%`;
    if (box.rightPct !== undefined) {
      el.style.right = `${box.rightPct}%`;
      el.style.left = 'auto';
    }
    if (box.leftPct !== undefined) {
      el.style.left = `${box.leftPct}%`;
      el.style.right = 'auto';
    }
    el.style.width = `${widthPct}%`;
    el.style.height = `${heightPct}%`;
  };

  applyBox(hitboxUpEl, hitboxes.up);
  applyBox(hitboxDownEl, hitboxes.down);
}

function getHotspotsForAsset(assetName) {
  return CONFIG.HOTSPOTS?.[assetName] || null;
}

function getHotspotLabel(id) {
  if (HOTSPOT_LABELS[id]) return HOTSPOT_LABELS[id];
  return id
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildHotspots() {
  if (!hotspotLayer) return;
  hotspotLayer.innerHTML = '';
  hotspotItems.length = 0;

  Object.entries(CONFIG.HOTSPOTS || {}).forEach(([assetName, hotspots]) => {
    hotspots.forEach((spot) => {
      const link = document.createElement('a');
      link.className = 'hotspot';
      link.href = spot.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.hotspotId = spot.id;
      link.dataset.hotspotAsset = assetName;
      link.setAttribute('aria-label', getHotspotLabel(spot.id));
      hotspotLayer.appendChild(link);
      hotspotItems.push({ el: link, asset: assetName, rect: spot.rect, layout: null });
    });
  });
}

function resolveVerticalOverlaps(items, height) {
  if (items.length < 2) return;
  const sorted = items.slice().sort((a, b) => a.layout.top - b.layout.top);
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1].layout;
    const current = sorted[i].layout;
    const minTop = prev.top + prev.height + 1;
    if (current.top < minTop) {
      current.top = minTop;
    }
  }

  const last = sorted[sorted.length - 1];
  const overflow = last.layout.top + last.layout.height - height;
  if (overflow > 0) {
    sorted.forEach((item) => {
      item.layout.top = Math.max(0, item.layout.top - overflow);
    });
    for (let i = 1; i < sorted.length; i += 1) {
      const prev = sorted[i - 1].layout;
      const current = sorted[i].layout;
      const minTop = prev.top + prev.height + 1;
      if (current.top < minTop) {
        current.top = minTop;
      }
    }
  }

  sorted.forEach((item) => {
    item.layout.top = Math.min(item.layout.top, Math.max(0, height - item.layout.height));
  });
}

function layoutHotspots() {
  if (!hotspotLayer || hotspotItems.length === 0) return;
  const layerRect = hotspotLayer.getBoundingClientRect();
  if (!layerRect.width || !layerRect.height) return;

  const isMobile = isMobileViewport();
  const width = layerRect.width;
  const height = layerRect.height;
  const perAsset = new Map();

  hotspotItems.forEach((item) => {
    const rect = item.rect;
    const layout = {
      width: (rect.widthPct / 100) * width,
      height: (rect.heightPct / 100) * height,
      left: (rect.leftPct / 100) * width,
      top: (rect.topPct / 100) * height
    };

    if (isMobile) {
      layout.width = Math.max(layout.width, HOTSPOT_MIN_TAP);
      layout.height = Math.max(layout.height, HOTSPOT_MIN_TAP);
    }

    layout.left = Math.max(0, Math.min(layout.left, width - layout.width));
    layout.top = Math.max(0, Math.min(layout.top, height - layout.height));
    item.layout = layout;

    if (!perAsset.has(item.asset)) perAsset.set(item.asset, []);
    perAsset.get(item.asset).push(item);
  });

  perAsset.forEach((items) => {
    resolveVerticalOverlaps(items, height);
  });

  hotspotItems.forEach((item) => {
    if (!item.layout) return;
    item.el.style.width = `${item.layout.width}px`;
    item.el.style.height = `${item.layout.height}px`;
    item.el.style.left = `${item.layout.left}px`;
    item.el.style.top = `${item.layout.top}px`;
  });
}

function updateHotspotVisibility() {
  if (!hotspotLayer) return;
  const assetName = getAssetName(state.activeIndex);
  const hasHotspots = Boolean(getHotspotsForAsset(assetName));

  hotspotLayer.setAttribute('aria-hidden', hasHotspots ? 'false' : 'true');
  hotspotItems.forEach((item) => {
    const isActive = hasHotspots && item.asset === assetName;
    item.el.style.display = isActive ? 'block' : 'none';
    item.el.style.pointerEvents = isActive ? 'auto' : 'none';
    item.el.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    item.el.tabIndex = isActive ? 0 : -1;
  });
}

function updateMobileLinks() {
  if (!mobileLinks) return;
  const assetName = getAssetName(state.activeIndex);
  const hotspots = getHotspotsForAsset(assetName);
  if (!isMobileViewport() || !hotspots) {
    mobileLinks.innerHTML = '';
    mobileLinks.setAttribute('aria-hidden', 'true');
    mobileLinks.removeAttribute('data-active-asset');
    return;
  }

  mobileLinks.innerHTML = '';
  hotspots.forEach((spot) => {
    const link = document.createElement('a');
    link.href = spot.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.hotspotId = spot.id;
    link.textContent = getHotspotLabel(spot.id);
    mobileLinks.appendChild(link);
  });
  mobileLinks.setAttribute('aria-hidden', 'false');
  mobileLinks.dataset.activeAsset = assetName;
}

function resolveLogoSrc(filename) {
  return `assets/logos/${filename}`;
}

function buildTicker() {
  if (!ticker || !tickerTrack || !CONFIG.TICKER) return;
  const isSmall = window.innerWidth < 380;
  const logoSet = isSmall ? CONFIG.TICKER.smallSet : CONFIG.TICKER.fullSet;
  const logoSetName = isSmall ? 'small' : 'full';

  ticker.dataset.logoSet = logoSetName;
  ticker.dataset.loopSeconds = String(CONFIG.TICKER.loopSeconds);
  tickerTrack.style.animationDuration = `${CONFIG.TICKER.loopSeconds}s`;

  tickerTrack.innerHTML = '';
  const logos = logoSet.concat(logoSet);
  logos.forEach((filename) => {
    const img = document.createElement('img');
    img.className = 'ticker-logo';
    img.src = resolveLogoSrc(filename);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    tickerTrack.appendChild(img);
  });
}

/**
 * Update video preload strategy for optimal performance
 */
function updateVideoPreload() {
  preloadedAssets = [];
  videos.forEach((video, index) => {
    const channel = video.closest('.channel');
    if (!channel) return;

    const channelIndex = parseInt(channel.dataset.channel, 10);
    const nextIndex = (state.activeIndex + 1) % state.totalChannels;

    // Preload current fully, next with metadata only, rest none
    const isVideoChannel = CONFIG.PLAYLIST[channelIndex]?.type === 'video';
    if (isVideoChannel && channelIndex === state.activeIndex) {
      video.setAttribute('preload', 'auto');
      const assetName = getAssetName(channelIndex);
      if (assetName) preloadedAssets.push(assetName);
    } else if (isVideoChannel && channelIndex === nextIndex) {
      video.setAttribute('preload', 'metadata');
      const assetName = getAssetName(channelIndex);
      if (assetName) preloadedAssets.push(assetName);
    } else if (isVideoChannel) {
      video.setAttribute('preload', 'none');
    }
  });
}

/**
 * Trigger CRT glitch effect
 */
function triggerCRTGlitch() {
  if (!crtOverlay) return;
  const durationMs = CONFIG.CRT?.durationMs || 180;

  if (crtTimeout) {
    window.clearTimeout(crtTimeout);
    crtTimeout = null;
  }

  crtOverlay.dataset.crtActive = 'true';

  // In test mode, ensure completely deterministic timing
  if (isTestMode) {
    // Clear any existing animation state
    crtOverlay.classList.remove('active');
    crtOverlay.style.animation = 'none';

    // Force reflow to ensure clean state
    void crtOverlay.offsetWidth;

    // Apply deterministic animation with exact timing
    crtOverlay.style.animation = '';
    crtOverlay.classList.add('active');
  } else {
    // Normal mode - standard behavior
    crtOverlay.classList.remove('active');
    void crtOverlay.offsetWidth;
    crtOverlay.classList.add('active');
  }

  crtTimeout = window.setTimeout(() => {
    if (!crtOverlay) return;
    crtOverlay.dataset.crtActive = 'false';
    crtOverlay.classList.remove('active');
  }, durationMs);
}

/**
 * Go to a specific channel
 */
/**
 * Navigate to a specific channel index (wraps).
 * @param {number} index
 */
function goToChannel(index) {
  // Wrap around
  if (index < 0) index = state.totalChannels - 1;
  if (index >= state.totalChannels) index = 0;

  // Pause current video and save time
  const currentChannel = channels[state.activeIndex];
  const currentVideo = currentChannel?.querySelector('video');
  if (currentVideo) {
    state.videoTimes[state.activeIndex] = currentVideo.currentTime;
    currentVideo.pause();
  }

  // Update active state
  channels.forEach((ch, i) => {
    ch.classList.toggle('active', i === index);
  });

  // Resume new video from saved time
  const newChannel = channels[index];
  const newVideo = newChannel?.querySelector('video');
  if (newVideo && !newChannel?.dataset.assetError) {
    // If video hasn't loaded yet (preload was "none"), trigger load first
    const needsLoad = newVideo.readyState === 0;
    newVideo.setAttribute('preload', 'auto');
    if (needsLoad) {
      newVideo.load();
    }
    if (state.videoTimes[index] !== undefined) {
      newVideo.currentTime = state.videoTimes[index];
    }
    newVideo.play().catch(() => {});
  }

  state.activeIndex = index;

  // Optimize video preload strategy
  updateVideoPreload();

  // Update global player state for testing
  updatePlayerState();

  // Trigger CRT glitch effect
  triggerCRTGlitch();

  // Update data attributes
  syncTvPlayerData(index);
  updateHotspotVisibility();
  updateMobileLinks();
}

/**
 * Go to next channel
 */
/**
 * Navigate to the next channel.
 */
function goToNext() {
  goToChannel(state.activeIndex + 1);
}

/**
 * Go to previous channel
 */
/**
 * Navigate to the previous channel.
 */
function goToPrev() {
  goToChannel(state.activeIndex - 1);
}

/**
 * Handle keyboard navigation
 */
/**
 * Handle keyboard navigation.
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
  const activeEl = document.activeElement;
  if (!activeEl) return;
  const tag = activeEl.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || activeEl.isContentEditable) {
    return;
  }

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      goToPrev();
      break;
    case 'ArrowRight':
      e.preventDefault();
      goToNext();
      break;
  }
}

/**
 * Dynamically generate channel elements from CONFIG.PLAYLIST.
 * This allows playlist changes via config.js without touching HTML.
 */
function buildChannels() {
  if (!tvPlayer) return;

  // Clear any existing channels
  tvPlayer.innerHTML = '';

  CONFIG.PLAYLIST.forEach((item, index) => {
    const channel = document.createElement('div');
    channel.className = index === 0 ? 'channel active' : 'channel';
    channel.dataset.channel = index;

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.className = 'channel-video';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      if (item.poster) {
        video.poster = item.poster;
      }
      if (index === 0) {
        video.autoplay = true;
        video.setAttribute('autoplay', '');
        video.preload = 'auto';
      } else {
        video.preload = 'metadata';
      }
      // Use <source> elements so the browser picks the best format
      if (item.srcWebm) {
        const sourceWebm = document.createElement('source');
        sourceWebm.src = item.srcWebm;
        sourceWebm.type = 'video/webm';
        video.appendChild(sourceWebm);
      }
      const sourceMp4 = document.createElement('source');
      sourceMp4.src = item.src;
      sourceMp4.type = 'video/mp4';
      video.appendChild(sourceMp4);
      channel.appendChild(video);
    } else if (item.type === 'image') {
      channel.dataset.bio = item.filename;
      const img = document.createElement('img');
      img.className = 'channel-bio';
      img.src = item.src;
      img.alt = item.filename.replace(/\.\w+$/, '').replace(/-/g, ' ');
      channel.appendChild(img);
    }

    tvPlayer.appendChild(channel);
  });

  // Update data attribute with first asset
  const firstAsset = CONFIG.PLAYLIST[0]?.filename || '';
  tvPlayer.dataset.activeAsset = firstAsset;
}

/**
 * Initialize application.
 * Wrapped in try-catch for graceful error handling.
 */
function init() {
  try {
    // Get tvPlayer first for channel building
    tvPlayer = document.querySelector('[data-tv-player]');

    // Build channels dynamically from config
    buildChannels();

    applyMaskFromConfig();

  // Get all channels (now dynamically created)
  channels = Array.from(document.querySelectorAll('[data-channel]'));
  videos = Array.from(document.querySelectorAll('.channel-video'));
  bios = Array.from(document.querySelectorAll('.channel-bio'));
  crtOverlay = document.querySelector('[data-crt]');
  tvPlayer = document.querySelector('[data-tv-player]');
  hotspotLayer = document.querySelector('[data-hotspots]');
  mobileLinks = document.querySelector('[data-mobile-links]');
  ticker = document.querySelector('[data-ticker]');
  tickerTrack = ticker?.querySelector('.ticker-track') || null;
  state.totalChannels = channels.length;
  syncTvPlayerData(state.activeIndex);

  // Add keyboard listener
  document.addEventListener('keydown', handleKeydown);

  // Add hitbox click listeners
  const hitboxUp = document.querySelector('[data-hitbox="up"]');
  const hitboxDown = document.querySelector('[data-hitbox="down"]');
  hitboxUpEl = hitboxUp;
  hitboxDownEl = hitboxDown;

  applyHitboxesFromConfig();

  if (hitboxUp) {
    hitboxUp.addEventListener('click', goToPrev);
  }
  if (hitboxDown) {
    hitboxDown.addEventListener('click', goToNext);
  }

  // Asset error handling (graceful, non-blocking)
  videos.forEach((video) => {
    video.addEventListener('error', () => {
      const channel = video.closest('.channel');
      if (channel) {
        channel.dataset.assetError = 'video';
      }
    });
  });
  bios.forEach((img) => {
    img.addEventListener('error', () => {
      const channel = img.closest('.channel');
      if (channel) {
        channel.dataset.assetError = 'bio';
      }
      img.style.visibility = 'hidden';
      img.setAttribute('aria-hidden', 'true');
    });
  });

  // Start first video
  const firstChannel = channels[0];
  const firstVideo = firstChannel?.querySelector('video');
  if (firstVideo && !firstChannel?.dataset.assetError) {
    const playPromise = firstVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay blocked - add touch listener to start on first interaction
        const startOnTouch = () => {
          const activeChannel = channels[state.activeIndex];
          const activeVideo = activeChannel?.querySelector('video');
          if (activeVideo) {
            activeVideo.play().catch(() => {});
          }
          document.removeEventListener('touchstart', startOnTouch);
          document.removeEventListener('click', startOnTouch);
        };
        document.addEventListener('touchstart', startOnTouch, { once: true });
        document.addEventListener('click', startOnTouch, { once: true });
      });
    }
  }

  // Initialize video preload optimization
  updateVideoPreload();
  updatePlayerState();

  buildTicker();

  buildHotspots();
  layoutHotspots();
  updateHotspotVisibility();
  updateMobileLinks();

  // Test mode: freeze marquee unless &marquee=run
  if (isTestMode && !marqueeRun && tickerTrack) {
    tickerTrack.style.animation = 'none';
    tickerTrack.style.transform = 'translateX(0)';
  }

  // Expose state for testing
  updatePlayerState();
  window.addEventListener('resize', () => {
    layoutHotspots();
    updateMobileLinks();
    buildTicker();
    applyHitboxesFromConfig();
    if (isTestMode && !marqueeRun && tickerTrack) {
      tickerTrack.style.animation = 'none';
      tickerTrack.style.transform = 'translateX(0)';
    }
  });
  } catch (error) {
    console.error('[Shapeshift] Initialization failed:', error);
    // Expose error state for debugging
    window.__PLAYER_STATE__ = { error: error.message, activeIndex: 0 };
  }
}

document.addEventListener('DOMContentLoaded', init);

export { init, goToChannel, goToNext, goToPrev, state };
