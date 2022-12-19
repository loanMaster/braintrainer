import { test, expect } from '@playwright/test';
import { login } from 'app/tests/pom/login.pom';

test('change username and avatar', async ({ page }) => {
  await login(page);
  await page.getByTestId('username-input').fill('theodor');
  await page.getByTestId('avatar-dropdown').click();
  await page.getByTestId('select-avatar-/images/avatars/avatar_00.jpg').click();
  await page.getByTestId('save-user-settings').click();

  await expect(await page.getByTestId('profile-picture')).toHaveAttribute(
    'src',
    '/images/avatars/avatar_00.jpg',
    { timeout: 10000 }
  );

  await page.getByTestId('username-input').fill('dietmar');
  await page.getByTestId('avatar-dropdown').click();
  await page.getByTestId('select-avatar-/images/avatars/avatar_01.jpg').click();
  await page.getByTestId('save-user-settings').click();
  await expect(await page.getByTestId('profile-picture')).toHaveAttribute(
    'src',
    '/images/avatars/avatar_01.jpg',
    { timeout: 10000 }
  );

  await page.reload();
  await expect(await page.getByTestId('username-input')).toHaveValue(
    'dietmar',
    { timeout: 10000 }
  );
});
