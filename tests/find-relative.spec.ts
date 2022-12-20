import {expect, Page, test} from '@playwright/test';
import {navigateToGame} from "app/tests/pom/navigate-to-game.pom";
import {listenForConsoleErrors} from "app/tests/listen-for-console-errors";

test.beforeEach(listenForConsoleErrors)

test('train find-relative', async ({ page }) => {
  await navigateToGame(page, 'find-relative', 'easy')

  const buttonWrapper = await page.getByTestId('exercise-buttons');

  for (let i = 0; i < 5; i++) {
    await expect(await buttonWrapper.locator('button:not([disabled])')).toHaveCount(5, { timeout: 10000 })
    const allCorrectButtons = await (await page.locator('[data-test="correct-button"]:not([disabled])').all())
    await allCorrectButtons[0].click()
  }

  await page.waitForURL('http://localhost:9000/en/score-screen')
});
