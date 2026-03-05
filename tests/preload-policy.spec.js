// @ts-check
import { test, expect } from '@playwright/test';

const TEST_URL = '/?test=1';

async function expectedPlaylistPair(page, activeIndex) {
  return page.evaluate((index) => {
    const playlist = window.__PLAYER_CONFIG__?.PLAYLIST ?? [];
    const total = playlist.length;
    if (!total) return [];

    const safeIndex = ((index % total) + total) % total;
    const nextIndex = (safeIndex + 1) % total;

    return [
      playlist[safeIndex]?.filename,
      playlist[nextIndex]?.filename,
    ].filter(Boolean);
  }, activeIndex);
}

async function jumpToChannel(page, targetIndex) {
  await page.waitForFunction(
    () => Boolean(window.__PLAYER_STATE__ && Number.isInteger(window.__PLAYER_STATE__.activeIndex)),
    undefined,
    { timeout: 5000 }
  );

  const totalChannels = await page.evaluate(() =>
    Array.isArray(window.__PLAYER_CONFIG__?.PLAYLIST) ? window.__PLAYER_CONFIG__.PLAYLIST.length : 0
  );
  if (!totalChannels) return;

  const activeIndex = await page.evaluate(() => window.__PLAYER_STATE__.activeIndex);
  const hops = ((targetIndex - activeIndex) + totalChannels) % totalChannels;
  for (let i = 0; i < hops; i += 1) {
    await page.locator('[data-hitbox="down"]').click({ force: true });
    const expectedIndex = (activeIndex + i + 1) % totalChannels;
    await page.waitForFunction(
      (idx) => window.__PLAYER_STATE__.activeIndex === idx,
      expectedIndex,
      { timeout: 3000 }
    );
  }
}

function normalize(assetNames) {
  return [...assetNames].sort();
}

test.describe('Video preload policy', () => {
  test('initial preload is current+next only', async ({ page }) => {
    await page.goto(TEST_URL);
    const state = await page.waitForFunction(
      () => {
        const s = window.__PLAYER_STATE__;
        if (!s || !Array.isArray(s.preloadedAssets)) return false;
        return s.preloadedAssets.length > 0;
      },
      undefined,
      { timeout: 5000 }
    );

    const preloadState = await state.evaluate(s => ({ preloadedAssets: [...s.preloadedAssets], activeIndex: s.activeIndex }));
    const expected = await expectedPlaylistPair(page, preloadState.activeIndex);

    expect(normalize(preloadState.preloadedAssets)).toEqual(normalize(expected));
  });

  test('preload set updates after navigation and excludes non-adjacent channels', async ({ page }) => {
    const channelsToCheck = [0, 1, 3, 7];

    for (const targetIndex of channelsToCheck) {
      await page.goto(TEST_URL);
      await jumpToChannel(page, targetIndex);
      const preloadState = await page.evaluate(() => ({
        preloadedAssets: [...window.__PLAYER_STATE__.preloadedAssets],
        activeIndex: window.__PLAYER_STATE__.activeIndex,
      }));
      const expected = await expectedPlaylistPair(page, preloadState.activeIndex);
      const totalChannels = await page.evaluate(() => window.__PLAYER_CONFIG__.PLAYLIST.length);
      const allNames = await page.evaluate(() =>
        window.__PLAYER_CONFIG__.PLAYLIST.map((entry) => entry.filename)
      );

      expect(preloadState.preloadedAssets.length).toBeLessThanOrEqual(2);
      expect(normalize(preloadState.preloadedAssets)).toEqual(normalize(expected));
      const forbidden = allNames.filter((name) => !expected.includes(name));
      expect(forbidden.every((name) => !preloadState.preloadedAssets.includes(name))).toBe(true);
      expect(preloadState.activeIndex).toBe(targetIndex % totalChannels);
    }
  });
});
