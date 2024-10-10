import dictionary_de from 'src/assets/language/de/dictionary.json';
import homophones_de from 'src/assets/language/de/homophones.json';
import anagrams_de from 'src/assets/language/de/anagrams.json';
import animals_de from 'src/assets/language/de/animals.json';
import colors_de from 'src/assets/language/de/colors.json';

import anagrams_en from 'src/assets/language/en/anagrams.json';
import homophones_en from 'src/assets/language/en/homophones.json';
import dictionary_en from 'src/assets/language/en/dictionary.json';
import animals_en from 'src/assets/language/en/animals.json';
import colors_en from 'src/assets/language/en/colors.json';

const dictionaryTree: { [language: string]: { [category: string]: string[] } } =
  {
    de: {
      ANIMALS: animals_de,
      COLORS: colors_de,
      DEFAULT: dictionary_de,
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
      default:
        return anagrams_en;
    }
  }

  getHomophonesList(lang: string): string[][] {
    switch (lang) {
      case 'de':
        return homophones_de;
      default:
        return homophones_en;
    }
  }
}
