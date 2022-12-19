import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('http://localhost:9000');
  await expect(page).toHaveTitle(/Brain Trainer/);
});
