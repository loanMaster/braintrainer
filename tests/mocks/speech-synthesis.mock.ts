import { Page } from 'playwright-core';

export const mockSpeechSynthesis = async (page: Page) => {
  await page.evaluate(() => {
    const speechSynthesisMock = {
      getVoices: () => {
        return [{ lang: 'de' }, { lang: 'en' }];
      },
      cancel: () => undefined,
      speak: (utterance: SpeechSynthesisUtterance) => {
        utterance.dispatchEvent(new Event('end'));
      },
    };
    (window as any).speechSynthesisFacade = speechSynthesisMock;
  });
};
