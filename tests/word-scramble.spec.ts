import { expect, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('train word-scramble', async ({ page }) => {
  await navigateToGame(page, 'word-scramble', 'normal', 'de');

  const coreExercise = await page.getByTestId('core-exercise');

  let previousSolution = '';
  for (let i = 0; i < 6; i++) {
    await expect(coreExercise).not.toHaveAttribute(
      'data-test',
      previousSolution,
      { timeout: 10000 }
    );
    const solution = (await coreExercise.getAttribute('data-test')) as string;
    for (let j = 0; j < solution.length; j++) {
      await page
        .locator(`[data-test="letter-button-${solution[j]}"]:not([disabled])`)
        .click();
    }
    previousSolution = solution;
  }

  await page.waitForURL('/#/de/score-screen');
});
