import { Page } from '@playwright/test';
import { acceptCookies } from './accept-cookies.pom';

export const login = async (
  page: Page,
  username = 'member@example.com',
  password = 'testmodepassword'
) => {
  await page.goto('http://localhost:9000/en/login');
  await page.getByTestId('email-input').fill(username);
  await page.getByTestId('password-input').fill(password);
  await acceptCookies(page);
  await page.getByTestId('submit').click();
};
