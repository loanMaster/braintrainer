import { test, expect } from '@playwright/test';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('dark mode toggle', async ({ page }) => {
  await page.goto('/');

  await page.waitForSelector('.body--light');
  await expect(await await page.locator('.body--dark').count()).toBe(0);
  await expect(await await page.locator('.body--light').count()).toBe(1);

  await page.getByTestId('darkModeToggle').click();

  await expect(await await page.locator('.body--dark').count()).toBe(1);
  await expect(await await page.locator('.body--light').count()).toBe(0);

  await page.getByTestId('darkModeToggle').click();

  await expect(await await page.locator('.body--dark').count()).toBe(0);
  await expect(await await page.locator('.body--light').count()).toBe(1);
});

test('change-language', async ({ page }) => {
  await page.goto('/#/en');
  await page.getByTestId('languageDropdown').click();
  await page.getByTestId('select-language-de').click();
  await page.waitForURL('/#/de');
  await expect(await page.getByTestId('practise-nav-item')).toContainText(
    'Trainieren'
  );

  await page.getByTestId('languageDropdown').click();
  await page.getByTestId('select-language-en').click();
  await page.waitForURL('/#/en');
  await expect(await page.getByTestId('practise-nav-item')).toContainText(
    'Train'
  );
});

test('navigation', async ({ page }) => {
  await page.goto('/#/en');
  await page.getByTestId('practise-nav-item').click();
  await page.waitForURL('/#/en/train');

  await page.getByTestId('player-scores-nav-item').click();
  await page.waitForURL('/#/en/player-scores');
});
