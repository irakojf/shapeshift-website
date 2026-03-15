// @ts-check
import { test, expect } from '@playwright/test';

const TEST_URL = '/?test=1';

async function waitForStableUI(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(
    () => Boolean(window.__PLAYER_STATE__ && Number.isInteger(window.__PLAYER_STATE__.activeIndex)),
    undefined,
    { timeout: 5000 }
  );
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(250);
}

async function freezeActiveVideo(page) {
  await page.evaluate(() => {
    const activeVideo = document.querySelector('.channel.active video');
    if (!activeVideo) return;
    try {
      activeVideo.pause();
      if (activeVideo.readyState >= 1) {
        activeVideo.currentTime = 0;
      }
    } catch {
      // Ignore media timing exceptions in headless CI
    }
  });
  await page.waitForTimeout(100);
}

async function goToChannel(page, targetIndex) {
  await page.waitForFunction(
    () => Boolean(window.__PLAYER_STATE__ && Number.isInteger(window.__PLAYER_STATE__.activeIndex)),
    undefined,
    { timeout: 5000 }
  );
  const current = await page.evaluate(() => window.__PLAYER_STATE__.activeIndex);
  const hops = (targetIndex - current + 8) % 8;
  for (let i = 0; i < hops; i++) {
    const expected = (current + i + 1) % 8;
    await page.locator('[data-hitbox="down"]').click({ force: true });
    await page.waitForFunction(
      idx => window.__PLAYER_STATE__.activeIndex === idx,
      expected,
      { timeout: 2000 }
    );
  }
  await page.waitForTimeout(350);
}

test.describe('Initial State', () => {
  test('loads with correct background, font, and no scroll', async ({ page }) => {
    await page.goto(TEST_URL);
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(68, 37, 252)');
    await expect(body).toHaveCSS('font-family', /Ubuntu Sans Mono/);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });

  test('channel 0 is active on load', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForFunction(() => window.__PLAYER_STATE__?.activeAsset);
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(0);
    expect(state.activeAsset).toBe('hazel-pt-2.mp4');
  });

  test('tagline shows correct text', async ({ page }) => {
    await page.goto(TEST_URL);
    await expect(page.locator('.tagline')).toHaveText('Stories and software for artists and craftsmen');
  });
});

test.describe('Navigation Wraparound', () => {
  test('ArrowRight advances channel', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForFunction(() => window.__PLAYER_STATE__?.activeAsset);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => window.__PLAYER_STATE__?.activeIndex === 1);
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(1);
  });

  test('ArrowLeft from 0 wraps to last channel', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.keyboard.press('ArrowLeft');
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(7);
  });

  test('ArrowRight from last wraps to 0', async ({ page }) => {
    await page.goto(TEST_URL);
    // Navigate to last channel
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('ArrowRight');
    }
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(0);
  });

  test('hitbox up navigates to previous', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.keyboard.press('ArrowRight'); // go to 1
    await page.locator('[data-hitbox="up"]').click({ force: true });
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(0);
  });

  test('hitbox down navigates to next', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.locator('[data-hitbox="down"]').click({ force: true });
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(1);
  });
});

test.describe('Focus Guard', () => {
  test('keyboard nav does nothing when input is focused', async ({ page }) => {
    await page.goto(TEST_URL);
    // Add an input and focus it
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'test-input';
      document.body.appendChild(input);
      input.focus();
    });
    await page.keyboard.press('ArrowRight');
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(0);
  });

  test('keyboard nav does nothing when textarea is focused', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.evaluate(() => {
      const ta = document.createElement('textarea');
      document.body.appendChild(ta);
      ta.focus();
    });
    await page.keyboard.press('ArrowRight');
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(0);
  });
});

test.describe('Screen Click', () => {
  test('clicking screen does NOT change channel', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.locator('[data-screen]').click();
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state.activeIndex).toBe(0);
  });
});

test.describe('CRT Glitch', () => {
  test('CRT overlay activates on channel switch', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.keyboard.press('ArrowRight');
    const crtActive = await page.locator('[data-crt]').getAttribute('data-crt-active');
    expect(crtActive).toBe('true');
  });

  test('CRT overlay clears after duration', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.__TEST_HELPERS__);
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => window.__TEST_HELPERS__?.state());
    await page.evaluate(() => window.__TEST_HELPERS__.advanceTime(180));
    const crtActive = await page.locator('[data-crt]').getAttribute('data-crt-active');
    expect(crtActive).toBe('false');
  });

  test('test helper exposes deterministic timer state', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.keyboard.press('ArrowRight');
    const state = await page.evaluate(() => {
      const helpers = window.__TEST_HELPERS__;
      if (!helpers) return null;
      return helpers.state();
    });
    expect(state).toEqual(expect.objectContaining({
      pendingCount: expect.any(Number),
      currentTimeMs: expect.any(Number),
    }));
    expect(state.pendingCount).toBeGreaterThan(0);
  });

  test('TV bezel is never affected by CRT', async ({ page }) => {
    await page.goto(TEST_URL);
    const bezel = page.locator('[data-tv-bezel]');
    await expect(bezel).toHaveCSS('pointer-events', 'none');
  });
});

test.describe('Ticker Marquee', () => {
  test('ticker is visible and has correct background', async ({ page }) => {
    await page.goto(TEST_URL);
    const ticker = page.locator('[data-ticker]');
    await expect(ticker).toBeVisible();
    await expect(ticker).toHaveCSS('background-color', 'rgb(0, 0, 0)');
  });

  test('ticker is frozen in test mode', async ({ page }) => {
    await page.goto(TEST_URL);
    const transform = await page.locator('.ticker-track').evaluate(
      el => getComputedStyle(el).transform
    );
    // In test mode, animation is none so transform should be none/matrix(1,0,0,1,0,0)
    expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true);
  });

  test('ticker runs with ?test=1&marquee=run', async ({ page }) => {
    await page.goto('/?test=1&marquee=run');
    const animation = await page.locator('.ticker-track').evaluate(
      el => getComputedStyle(el).animationName
    );
    expect(animation).toBe('ticker-scroll');
  });

  test('uses full logo set on normal viewport', async ({ page }) => {
    await page.goto(TEST_URL);
    const logoSet = await page.locator('[data-ticker]').getAttribute('data-logo-set');
    expect(logoSet).toBe('full');
  });
});

test.describe('Hotspots', () => {
  test('hotspots exist for bio channels', async ({ page }) => {
    await page.goto(TEST_URL);
    // Navigate to hailey-choi (channel 5)
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
    }
    const hotspots = page.locator('[data-hotspot-asset="hailey-choi.jpg"]');
    await expect(hotspots).toHaveCount(2);
  });

  test('hotspots have correct URLs for ira-ko', async ({ page }) => {
    await page.goto(TEST_URL);
    // Navigate to ira-ko (channel 7)
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('ArrowRight');
    }
    const linkedin = page.locator('[data-hotspot-id="linkedin"][data-hotspot-asset="ira-ko.jpg"]');
    await expect(linkedin).toHaveAttribute('href', 'https://linkedin.com/in/koira/');
    await expect(linkedin).toHaveAttribute('target', '_blank');
    await expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('hotspots hidden on video channels', async ({ page }) => {
    await page.goto(TEST_URL);
    // On channel 0 (video), hotspot layer should be hidden
    const ariaHidden = await page.locator('[data-hotspots]').getAttribute('aria-hidden');
    expect(ariaHidden).toBe('true');
  });
});

test.describe('Channel Structure', () => {
  test('has 8 channels total', async ({ page }) => {
    await page.goto(TEST_URL);
    const channels = page.locator('[data-channel]');
    await expect(channels).toHaveCount(8);
  });

  test('only active channel is visible', async ({ page }) => {
    await page.goto(TEST_URL);
    const activeChannels = page.locator('.channel.active');
    await expect(activeChannels).toHaveCount(1);
  });

  test('videos have correct attributes', async ({ page }) => {
    await page.goto(TEST_URL);
    const firstVideo = page.locator('.channel.active video');
    await expect(firstVideo).toHaveAttribute('muted', '');
    const isMuted = await firstVideo.evaluate(v => v.muted);
    expect(isMuted).toBe(true);
  });
});

test.describe('Video Time Persistence', () => {
  test('videoTimes map exists in player state', async ({ page }) => {
    await page.goto(TEST_URL);
    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(state).toHaveProperty('videoTimes');
    expect(typeof state.videoTimes).toBe('object');
  });

  test('navigating away from video saves time to state', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForFunction(() => window.__PLAYER_STATE__?.activeAsset);

    // Wait for first video to be minimally ready
    const ready = await page.evaluate(async () => {
      const v = document.querySelector('.channel.active video');
      if (!v) return false;
      // Give it up to 5s to reach readyState >= 2
      for (let i = 0; i < 50; i++) {
        if (v.readyState >= 2) return true;
        await new Promise(r => setTimeout(r, 100));
      }
      return false;
    });

    if (!ready) {
      // Video not playable in this environment — test videoTimes structure only
      await page.keyboard.press('ArrowRight');
      const state = await page.evaluate(() => window.__PLAYER_STATE__);
      expect(state).toHaveProperty('videoTimes');
      return;
    }

    // Seek to a duration-safe target and wait until currentTime actually moves
    await page.evaluate(async () => {
      const video = document.querySelector('.channel.active video');
      if (!video) return { targetTime: 0.5, actualTime: 0 };

      if (video.readyState < 1) {
        await new Promise((resolve) => {
          video.addEventListener('loadedmetadata', resolve, { once: true });
          setTimeout(resolve, 2000);
        });
      }

      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      const targetTime = duration > 0 ? Math.max(0.25, Math.min(5, duration * 0.5)) : 0.5;

      await new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };

        video.addEventListener('seeked', finish, { once: true });
        video.currentTime = targetTime;

        const start = performance.now();
        const poll = () => {
          if (Math.abs(video.currentTime - targetTime) < 0.25 || performance.now() - start > 2000) {
            finish();
            return;
          }
          requestAnimationFrame(poll);
        };
        poll();
      });

      return { targetTime, actualTime: video.currentTime };
    });

    const timeBeforeNavigate = await page.evaluate(() => {
      const video = document.querySelector('.channel.active video');
      return video ? video.currentTime : 0;
    });

    // Navigate away — triggers pause + time save
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);

    const state = await page.evaluate(() => window.__PLAYER_STATE__);
    expect(Math.abs(state.videoTimes[0] - timeBeforeNavigate)).toBeLessThanOrEqual(0.5);
  });
});

test.describe('Visual Regression', () => {
  test.describe.configure({ mode: 'serial' });

  test('hero layout snapshot (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(TEST_URL);
    await waitForStableUI(page);
    await freezeActiveVideo(page);
    await expect(page).toHaveScreenshot('hero-desktop-1440x900.png');
  });

  test('hero layout snapshot (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 712 });
    await page.goto(TEST_URL);
    await waitForStableUI(page);
    await freezeActiveVideo(page);
    await expect(page).toHaveScreenshot('hero-mobile-320x712.png');
  });

  test('bio layout snapshot (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(TEST_URL);
    await waitForStableUI(page);
    await goToChannel(page, 5);
    await waitForStableUI(page);
    await expect(page).toHaveScreenshot('bio-desktop-1440x900.png');
  });

  test('bio layout snapshot (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 712 });
    await page.goto(TEST_URL);
    await waitForStableUI(page);
    await goToChannel(page, 5);
    await waitForStableUI(page);
    await expect(page).toHaveScreenshot('bio-mobile-320x712.png');
  });
});
