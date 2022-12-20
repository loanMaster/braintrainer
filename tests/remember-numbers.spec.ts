import {expect, Page, test} from '@playwright/test';
import {navigateToGame} from "app/tests/pom/navigate-to-game.pom";

const solve = async (page: Page) => {
  const coreExercise = await page.getByTestId('core-exercise');

  let previousSolution = ''
  for (let i = 0; i < 5; i++) {
    await expect(coreExercise).not.toHaveAttribute('data-test', previousSolution, { timeout: 10000 })
    const solution = await coreExercise.getAttribute('data-test') as string
    console.log(solution)
    for (let j = 0; j < solution.length; j++) {
      console.log(solution[j])
      await page.locator(`[data-testid="numpad-${solution[j]}"]:not([disabled])`).click()
    }
    previousSolution = solution
  }
}

test('train remember-numbers', async ({ page }) => {
  await navigateToGame(page, 'remember-numbers', 'easy', 'de')
  await solve(page)
  await page.waitForURL('http://localhost:9000/de/score-screen')
});

test('train remember-numbers-rev', async ({ page }) => {
  await navigateToGame(page, 'remember-numbers-rev', 'easy', 'de')
  await solve(page)
  await page.waitForURL('http://localhost:9000/de/score-screen')
});
