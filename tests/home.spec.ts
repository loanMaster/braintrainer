import { test, expect } from '@playwright/test';
import { listenForConsoleErrors } from 'app/tests/listen-for-console-errors';

test.beforeEach(listenForConsoleErrors);

test('homepage has title', async ({ page }) => {
  await page.goto('http://localhost:9000');
  await expect(page).toHaveTitle(/Brain Trainer/);
});
