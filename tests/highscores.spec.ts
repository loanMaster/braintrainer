import { test, expect } from '@playwright/test';
import { login } from 'app/tests/pom/login.pom';

test('highscore screen shows some entries', async ({ page }) => {
  await page.goto('http://localhost:9000/en/highscores');

  await page.waitForSelector('[data-testid="words-table"]');

  const wordsTable = await page.getByTestId('words-table');
  expect(await (await wordsTable.locator('tr')).count()).toBeGreaterThan(0);

  const mathsTable = await page.getByTestId('math-table');
  expect(await (await mathsTable.locator('tr')).count()).toBeGreaterThan(0);

  const memoryTable = await page.getByTestId('memory-table');
  expect(await (await memoryTable.locator('tr')).count()).toBeGreaterThan(0);
});

test('from highscores navigate to exercise', async ({ page }) => {
  await login(page);
  await page.goto('http://localhost:9000/en/highscores');
  await page.waitForSelector('[data-testid="words-table"]');
  const wordsTable = await page.getByTestId('words-table');
  expect(await (await wordsTable.locator('tr')).count()).toBeGreaterThan(0);
  await page.getByTestId('train-spell-backwards-easy').click();
  await page.waitForURL('http://localhost:9000/en/train/easy/spell-backwards');
});
