import { expect, Page, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('train find-matching-person', async ({ page }) => {
  await navigateToGame(page, 'find-matching-person', 'easy');

  for (let i = 0; i < 5; i++) {
    await expect(
      await page.locator('[data-testid="select-image-button"]:not([disabled])')
    ).toHaveCount(1, { timeout: 30000 });
    const solution = await await page
      .getByTestId('core-exercise')
      .getAttribute('data-test');
    await page.locator(`.q-carousel__thumbnail[src="${solution}"]`).click();
    await page
      .locator('[data-testid="select-image-button"]:not([disabled])')
      .click();
  }

  await page.waitForURL('http://localhost:9000/en/score-screen');
});
