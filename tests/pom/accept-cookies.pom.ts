import { Page } from '@playwright/test';

export const acceptCookies = async (page: Page) => {
  if (await page.locator('#ppms_cm_agree-to-all').isVisible()) {
    await page.locator('#ppms_cm_agree-to-all').click();
  }
};
