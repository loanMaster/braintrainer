import { expect, Page, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('train listen-backwards', async ({ page }) => {
  await navigateToGame(page, 'listen-backwards', 'easy');

  const buttonWrapper = await page.getByTestId('exercise-buttons');
  await expect(
    await buttonWrapper.locator('button:not([disabled])')
  ).toHaveCount(4, { timeout: 10000 });

  for (let i = 0; i < 10; i++) {
    await page.locator('[data-test="correct-button"]:not([disabled])').click();
  }

  await page.waitForURL('http://localhost:9000/en/score-screen');
});
