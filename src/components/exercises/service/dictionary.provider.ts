import dictionary_de from './de/dictionary.json';
import homophones_de from './de/homophones.json';
import anagrams_de from './de/anagrams.json';
import animals_de from './de/animals.json';
import colors_de from './de/colors.json';

import anagrams_en from './en/anagrams.json';
import homophones_en from './en/homophones.json';
import dictionary_en from './en/dictionary.json';
import animals_en from './en/animals.json';
import colors_en from './en/colors.json';

import anagrams_es from './es/anagrams.json';
import homophones_es from './es/homophones.json';
import dictionary_es from './es/dictionary.json';
import animals_es from './es/animals.json';
import colors_es from './es/colors.json';

const dictionaryTree: { [language: string]: { [category: string]: string[] } } =
  {
    de: {
      ANIMALS: animals_de,
      COLORS: colors_de,
      DEFAULT: dictionary_de,
    },
    es: {
      ANIMALS: animals_es,
      COLORS: colors_es,
      DEFAULT: dictionary_es,
    },
    en: {
      ANIMALS: animals_en,
      COLORS: colors_en,
      DEFAULT: dictionary_en,
    },
  };

export class DictionaryProvider {
  getDictionary(lang = 'en', category = 'DEFAULT'): string[] {
    return dictionaryTree[lang.toLocaleLowerCase()][category];
  }

  getAnagramDictionary(lang: string): string[] {
    switch (lang) {
      case 'de':
        return anagrams_de;
      case 'es':
        return anagrams_es;
      default:
        return anagrams_en;
    }
  }

  getHomophonesList(lang: string): string[][] {
    switch (lang) {
      case 'de':
        return homophones_de;
      case 'es':
        return homophones_es;
      default:
        return homophones_en;
    }
  }
}
