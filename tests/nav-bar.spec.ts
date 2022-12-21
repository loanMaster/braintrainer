import { test, expect } from '@playwright/test';
import { login } from 'app/tests/pom/login.pom';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('dark mode toggle', async ({ page }) => {
  await page.goto('http://localhost:9000');

  await page.waitForSelector('.body--dark');
  await expect(await await page.locator('.body--dark').count()).toBe(1);
  await expect(await await page.locator('.body--light').count()).toBe(0);

  await page.getByTestId('darkModeToggle').click();

  await expect(await await page.locator('.body--dark').count()).toBe(0);
  await expect(await await page.locator('.body--light').count()).toBe(1);

  await page.getByTestId('darkModeToggle').click();

  await expect(await await page.locator('.body--dark').count()).toBe(1);
  await expect(await await page.locator('.body--light').count()).toBe(0);
});

test('full screen toggle', async ({ page }) => {
  await page.goto('http://localhost:9000');
  await page.getByTestId('fullScreenToggle').click();
});

test('change-language', async ({ page }) => {
  await page.goto('http://localhost:9000/en');
  await page.getByTestId('languageDropdown').click();
  await page.getByTestId('select-language-de').click();
  await page.waitForURL('http://localhost:9000/de');
  await expect(await page.getByTestId('practise-nav-item')).toContainText(
    'Trainieren'
  );

  await page.getByTestId('languageDropdown').click();
  await page.getByTestId('select-language-en').click();
  await page.waitForURL('http://localhost:9000/en');
  await expect(await page.getByTestId('practise-nav-item')).toContainText(
    'Train'
  );
});

test('navigation-not-logged-in', async ({ page }) => {
  await page.goto('http://localhost:9000/en');
  await page.getByTestId('highscores-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/highscores');

  await page.getByTestId('player-scores-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/login');

  await page.getByTestId('user-settings-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/login');

  await page.getByTestId('practise-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/train');
});

test('navigation-logged-in', async ({ page }) => {
  await login(page);
  await page.getByTestId('highscores-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/highscores');

  await page.getByTestId('player-scores-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/player-scores');

  await page.getByTestId('user-settings-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/user-settings');

  await page.getByTestId('practise-nav-item').click();
  await page.waitForURL('http://localhost:9000/en/train');
});
