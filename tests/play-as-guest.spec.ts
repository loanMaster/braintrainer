import { test, expect } from '@playwright/test';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';

test.beforeEach(listenForConsoleErrors);

test('play three times as guest', async ({ page }) => {
  await navigateToGame(page, 'listen-backwards', 'normal');
  await page.goto(`http://localhost:9000/de/train/normal/listen-backwards`);
  await page.getByTestId('confirm-exercise-instructions-btn').click();
  let buttonWrapper = await page.getByTestId('exercise-buttons');
  await expect(
    await buttonWrapper.locator('button:not([disabled])')
  ).toHaveCount(6, { timeout: 10000 });

  await page.goto(`http://localhost:9000/de/train/easy/listen-backwards`);
  await page.getByTestId('confirm-exercise-instructions-btn').click();
  buttonWrapper = await page.getByTestId('exercise-buttons');
  await expect(
    await buttonWrapper.locator('button:not([disabled])')
  ).toHaveCount(4, { timeout: 10000 });

  await page.goto(`http://localhost:9000/de/train/easy/listen-backwards`);
  await page.waitForURL(`http://localhost:9000/de/login`);
});
