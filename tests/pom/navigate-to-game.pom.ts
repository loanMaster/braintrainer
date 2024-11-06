import { Page } from '@playwright/test';
import { mockSpeechSynthesis } from '../mocks/speech-synthesis.mock';

export const navigateToGame = async (
  page: Page,
  nameOfTheGame: string,
  difficulty: string,
  lang = 'en'
) => {
  await page.goto(`/#/${lang}/train`);
  await mockSpeechSynthesis(page);
  await page.getByTestId('card-' + nameOfTheGame).click();
  await page.waitForURL(`/#/${lang}/train/select-difficulty/${nameOfTheGame}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.getByTestId('card-' + difficulty).click();

  await page.waitForURL(`/#/${lang}/train/${difficulty}/${nameOfTheGame}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await page.getByTestId('confirm-exercise-instructions-btn').click();
};
