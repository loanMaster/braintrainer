import {expect, Page, test} from '@playwright/test';
import {navigateToGame} from "app/tests/pom/navigate-to-game.pom";

const solveMemory = async (page: Page, count: number) => {
  const buttonWrapper = await page.getByTestId('memory-buttons');
  await expect(await buttonWrapper.locator('button:not([disabled])')).toHaveCount(count, { timeout: 10000 })

  while (await (await buttonWrapper.locator('button:not([disabled])')).count() > 0) {
    const allButtons = await (await buttonWrapper.locator('button:not([disabled])')).all()
    const firstButton = allButtons[0]
    await firstButton.click();

    const testValue = await firstButton.getAttribute('data-test')
    const matchingButtons = await (await buttonWrapper.locator(`[data-test="${testValue}"]`)).all()
    const secondButton = matchingButtons[1]
    await secondButton.click()
    await new Promise(resolve => setTimeout(() => resolve(''), 250))
  }

  await page.waitForURL('http://localhost:9000/en/score-screen')
}

test('play memory', async ({ page }) => {
  await navigateToGame(page, 'memory', 'easy')
  await solveMemory(page, 12)
});

test('play memory with animals', async ({ page }) => {
  await navigateToGame(page, 'memory-animals', 'hard')
  await solveMemory(page, 40)
});
