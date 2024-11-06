import { expect, Page, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

const solve = async (page: Page, count: number) => {
  const coreExercise = await page.getByTestId('core-exercise');

  for (let i = 0; i < count; i++) {
    await expect(
      await coreExercise.locator('button:not([disabled])')
    ).toHaveCount(12, { timeout: 10000 });
    const solutionNo = await coreExercise.getAttribute('data-test');
    const solution = String(solutionNo);
    for (let j = 0; j < solution.length; j++) {
      await page
        .locator(`[data-testid="numpad-${solution[j]}"]:not([disabled])`)
        .click();
    }
  }
};

test('train mental-arithmetic', async ({ page }) => {
  await navigateToGame(page, 'mental-arithmetic', 'normal', 'de');
  await solve(page, 6);
  await page.waitForURL('/#/de/score-screen');
});

test('train mental-arithmetic-mul', async ({ page }) => {
  await navigateToGame(page, 'mental-arithmetic-mul', 'normal', 'de');
  await solve(page, 6);
  await page.waitForURL('/#/de/score-screen');
});

test('train math-marathon', async ({ page }) => {
  await navigateToGame(page, 'math-marathon', 'normal', 'de');
  await solve(page, 15);
  await page.waitForURL('/#/de/score-screen');
});

test('train solve-equation', async ({ page }) => {
  await navigateToGame(page, 'solve-equation', 'normal', 'de');
  await solve(page, 6);
  await page.waitForURL('/#/de/score-screen');
});
