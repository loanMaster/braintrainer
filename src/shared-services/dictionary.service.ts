import { randomElement } from 'src/util/array.utils';
import { DictionaryProvider } from './dictionary.provider';

export class DictionaryService {
  constructor(private dictionaryProvider: DictionaryProvider) {}

  getRandomWord(
    lang: string,
    minLength: number,
    maxLength: number,
    category?: string
  ): string {
    const dictionary = this.dictionaryProvider.getDictionary(lang, category);
    const filteredOnLengh = dictionary.filter(
      (w: string) => w.length >= minLength && w.length <= maxLength
    );
    return randomElement(filteredOnLengh);
  }

  getHomophones(lang: string, word: string): string[] {
    const results: string[] = [];
    this.dictionaryProvider
      .getHomophonesList(lang)
      .forEach((phones: string[]) =>
        phones.forEach((w1) => {
          if (w1.toLowerCase() === word.toLowerCase()) {
            phones.forEach((w2) => {
              if (w2.toLowerCase() !== word.toLowerCase()) {
                results.push(w2);
              }
            });
          }
        })
      );
    return results;
  }

  getAnagrams(lang: string, word: string): string[] {
    const allWords = this.dictionaryProvider
      .getAnagramDictionary(lang)
      .concat(...this.dictionaryProvider.getDictionary(lang));
    const sortedWord = word.toLowerCase().split('').sort().join('');
    const anagrams: string[] = [];
    anagrams.push(word.toLowerCase());
    allWords
      .filter((w: string) => w.length === sortedWord.length)
      .map((w: string) => w.toLowerCase())
      .filter((w: string) => this.isAnagram(w, sortedWord))
      .forEach((w: string) => {
        if (anagrams.indexOf(w) == -1) {
          anagrams.push(w);
        }
      });
    return anagrams;
  }

  isAnagram(input: string, sortedInput: string) {
    const string1: string = input.toLowerCase().split('').sort().join('');
    return string1 === sortedInput;
  }
}

export interface Word {
  word: string;
}
