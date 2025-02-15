import { expect, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('train find-relative', async ({ page }) => {
  await navigateToGame(page, 'find-relative', 'normal');

  const buttonWrapper = await page.getByTestId('exercise-buttons');

  for (let i = 0; i < 6; i++) {
    await expect(
      await buttonWrapper.locator('button:not([disabled])')
    ).toHaveCount(6, { timeout: 10000 });
    const allCorrectButtons = await await page
      .locator('[data-test="correct-button"]:not([disabled])')
      .all();
    await allCorrectButtons[0].click();
  }

  await page.waitForURL('/#/en/score-screen');
});
