import { expect, Page, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('train spell-backwards', async ({ page }) => {
  await navigateToGame(page, 'spell-backwards', 'veryhard', 'de');

  const coreExercise = await page.getByTestId('core-exercise');

  let previousSolution = '';
  for (let i = 0; i < 10; i++) {
    await expect(coreExercise).not.toHaveAttribute(
      'data-test',
      previousSolution,
      { timeout: 10000 }
    );
    const solution = (await coreExercise.getAttribute('data-test')) as string;
    for (let j = solution.length - 1; j >= 0; j--) {
      await page
        .locator(`[data-test="letter-button-${solution[j]}"]:not([disabled])`)
        .click();
    }
    previousSolution = solution;
  }

  await page.waitForURL('http://localhost:9000/de/score-screen');
});
