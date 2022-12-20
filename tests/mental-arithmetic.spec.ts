import {expect, Page, test} from '@playwright/test';
import {navigateToGame} from "app/tests/pom/navigate-to-game.pom";
import {listenForConsoleErrors} from "app/tests/listen-for-console-errors";

test.beforeEach(listenForConsoleErrors)

const solve = async (page: Page, count: number) => {
  const coreExercise = await page.getByTestId('core-exercise');

  let previousSolution = ''
  for (let i = 0; i < count; i++) {
    await expect(await coreExercise.locator(`button:not([disabled])`)).toHaveCount(10, { timeout: 10000 })
    const solutionNo = await coreExercise.getAttribute('data-test')
    const solution = String(solutionNo)
    console.log(solution)
    for (let j = 0; j < solution.length; j++) {
      console.log(solution[j])
      await page.locator(`[data-testid="numpad-${solution[j]}"]:not([disabled])`).click()
    }
    previousSolution = solution
  }
}

test('train mental-arithmetic', async ({ page }) => {
  await navigateToGame(page, 'mental-arithmetic', 'easy', 'de')
  await solve(page,  5)
  await page.waitForURL('http://localhost:9000/de/score-screen')
});

test('train mental-arithmetic-mul', async ({ page }) => {
  await navigateToGame(page, 'mental-arithmetic-mul', 'easy', 'de')
  await solve(page, 5)
  await page.waitForURL('http://localhost:9000/de/score-screen')
});

test('train math-marathon', async ({ page }) => {
  await navigateToGame(page, 'math-marathon', 'easy', 'de')
  await solve(page, 15)
  await page.waitForURL('http://localhost:9000/de/score-screen')
});
