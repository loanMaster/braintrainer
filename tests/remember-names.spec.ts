import { expect, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('train remember-names', async ({ page }) => {
  await navigateToGame(page, 'remember-names', 'normal');

  const buttonWrapper = await page.getByTestId('exercise-buttons');
  await expect(
    await buttonWrapper.locator('button:not([disabled])')
  ).not.toHaveCount(0, { timeout: 30000 });

  for (let i = 0; i < 5; i++) {
    await page.locator('[data-test="correct-button"]:not([disabled])').click();
  }

  await page.waitForURL('/#/en/score-screen');
});
