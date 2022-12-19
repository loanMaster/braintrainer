import { Page } from '@playwright/test';
import {acceptCookies} from "app/tests/pom/accept-cookies.pom";

export const navigateToGame = async (page: Page, nameOfTheGame: string, difficulty: string, lang = 'en') => {
  await page.goto(`http://localhost:9000/${lang}/train`);
  await acceptCookies(page)
  await page.waitForSelector('[data-testid=\"continueAsGuestButton\"]')
  await page.getByTestId('continueAsGuestButton').click()
  await page.getByTestId('card-' + nameOfTheGame).click()
  await page.waitForURL(`http://localhost:9000/${lang}/train/select-difficulty/${nameOfTheGame}`)
  await page.getByTestId('card-' + difficulty).click();
  await page.waitForURL(`http://localhost:9000/${lang}/train/${difficulty}/${nameOfTheGame}`)
  await page.getByTestId('confirm-exercise-instructions-btn').click()
};
