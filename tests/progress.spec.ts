import { test, expect } from '@playwright/test';
import { login } from 'app/tests/pom/login.pom';
import { keyInput } from 'src/util/key.input';

test('progress page shows some entries', async ({ page }) => {
  await login(page);
  await page.goto('http://localhost:9000/en/player-scores');

  await page.waitForSelector('[data-testid="words-table"]');

  const wordsTable = await page.getByTestId('words-table');
  expect(await (await wordsTable.locator('tr')).count()).toBeGreaterThan(0);

  const mathsTable = await page.getByTestId('math-table');
  expect(await (await mathsTable.locator('tr')).count()).toBeGreaterThan(0);

  const memoryTable = await page.getByTestId('memory-table');
  expect(await (await memoryTable.locator('tr')).count()).toBeGreaterThan(0);
});

test('show progress diagram and navigate to exercise', async ({ page }) => {
  await login(page);
  await page.goto('http://localhost:9000/en/player-scores');

  await page.waitForSelector('[data-testid="words-table"]');

  await page.getByTestId('showProgress-spell-backwards-easy').click();

  await expect(await page.getByTestId('progress-diagram')).toBeVisible();

  await page.keyboard.press('Escape');
  await page.keyboard.up('Escape');

  await page.getByTestId('train-spell-backwards-easy').click();

  await page.waitForURL('http://localhost:9000/en/train/easy/spell-backwards');
});
