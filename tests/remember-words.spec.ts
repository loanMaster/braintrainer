import { expect, Page, test } from '@playwright/test';
import { navigateToGame } from 'app/tests/pom/navigate-to-game.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

const solve = async (page: Page) => {
  const coreExercise = await page.getByTestId('core-exercise');

  let previousSolution = '';
  for (let i = 0; i < 5; i++) {
    await expect(coreExercise).not.toHaveAttribute(
      'data-test',
      previousSolution,
      { timeout: 10000 }
    );
    const solution = (await coreExercise.getAttribute('data-test')) as string;
    const solutionWords = solution.split(' - ').map((s) => s.trim());
    for (let j = 0; j < solutionWords.length; j++) {
      await page
        .locator(`[data-testid="button-${solutionWords[j]}"]:not([disabled])`)
        .click();
    }
    previousSolution = solution;
  }
};

test('train remember-words', async ({ page }) => {
  await navigateToGame(page, 'remember-words', 'easy', 'de');
  await solve(page);
  await page.waitForURL('http://localhost:9000/de/score-screen');
});

test('train remember-words-rev', async ({ page }) => {
  await navigateToGame(page, 'remember-words-rev', 'easy', 'de');
  await solve(page);
  await page.waitForURL('http://localhost:9000/de/score-screen');
});
