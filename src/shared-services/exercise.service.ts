import { randomElement, shuffle } from 'src/util/array.utils';
import { DictionaryProvider } from './dictionary.provider';
import { DictionaryService } from './dictionary.service';
import languageBasics from 'src/assets/language/other-languages/language-basics.json';

export interface LanguageBasics {
  lang: string;
  words: {
    src: string;
    val: string;
    key: string;
  }[];
}

export interface RandomWords extends RandomWord {
  count: number;
}

export interface RandomWord {
  lang: string;
  minLength: number;
  maxLength: number;
  number?: number;
  category?: string;
  exclude?: string[];
}

export interface WordsMultipleSpeakers {
  lang: string;
  number: number;
  category?: string;
}

export interface WordList {
  val: string[];
  alts?: string[];
}

export interface NumberRequest {
  lang: string;
  min: number;
  max: number;
  count: number;
}

export interface WordGroupResponse {
  audio: {
    val: string;
    audio: string;
  }[];
  words: string[];
}

export interface AudioResponse {
  audio: string;
  val: string | number;
  alts?: string[];
}

export class ExerciseService {
  private dictionaryService: DictionaryService;

  constructor() {
    this.dictionaryService = new DictionaryService(new DictionaryProvider());
  }

  get serverPath() {
    return serverPath || '';
  }

  private createWordList(
    lang = 'en',
    minLength: number,
    maxLength: number,
    number: number,
    category?: string
  ): string[] {
    const words: string[] = [];
    const homoPhones: string[] = [];
    do {
      const next = this.dictionaryService.getRandomWord(
        lang,
        minLength,
        maxLength,
        category
      );
      if (words.indexOf(next) === -1 && homoPhones.indexOf(next) === -1) {
        words.push(next);
        this.dictionaryService.getHomophones(lang, next).forEach((h) => {
          homoPhones.push(h);
        });
      }
    } while (words.length < number);
    return words;
  }

  getRandomWords(randomWord: RandomWord): string[] {
    return this.createWordList(
      randomWord.lang,
      randomWord.minLength,
      randomWord.maxLength,
      randomWord.number || 1,
      randomWord.category
    );
  }

  getLanguageBasics(difficulty: string): LanguageBasics {
    const entry: {
      lang: string;
      voice: string;
      easy: { [word: string]: string };
      normal: { [word: string]: string };
    } = randomElement(languageBasics);
    const words = entry[difficulty === 'normal' ? 'easy' : 'normal'];
    return {
      words: Object.keys(words).map((word) => ({
        src: `/sounds/other-languages/${entry.lang}_${word}.mp3`,
        val: words[word],
        key: word,
      })),
      lang: entry.lang,
    };
  }

  getVoiceMemorySingleSpeaker(
    numberSpeakers: number,
    lang: string
  ): { src: string; val: string }[] {
    const animals = new DictionaryProvider()
      .getDictionary(lang, 'ANIMALS')
      .map((a) => a);
    const shuffledAnimals = shuffle(animals);
    const voices_en = [
      'en-US-Studio-O',
      'en-US-Studio-Q',
      'en-US-Wavenet-A',
      'en-US-Wavenet-B',
      'en-US-Wavenet-C',
      'en-US-Wavenet-D',
      'en-US-Wavenet-E',
      'en-US-Wavenet-F',
      'en-US-Wavenet-G',
      'en-US-Wavenet-H',
    ];
    const voices_de = [
      'de-DE-Studio-B',
      'de-DE-Studio-C',
      'de-DE-Wavenet-B',
      'de-DE-Wavenet-C',
      'de-DE-Wavenet-D',
      'de-DE-Wavenet-E',
      'de-DE-Wavenet-F',
      'de-DE-Wavenet-H',
    ];
    const voice =
      lang === 'de' ? randomElement(voices_de) : randomElement(voices_en);
    const result = [];
    for (const animal of shuffledAnimals) {
      result.push({
        src: `/sounds/voice-memory/${lang}_${voice}_${animal}.mp3`,
        val: animal,
      });
      result.push({
        src: `/sounds/voice-memory/${lang}_${voice}_${animal}.mp3`,
        val: animal,
      });
    }
    return result.splice(0, numberSpeakers * 2);
  }

  getVoiceMemory(
    numberSpeakers: number,
    lang: string
  ): { src: string; val: string }[] {
    const animals = new DictionaryProvider()
      .getDictionary(lang, 'ANIMALS')
      .map((a) => a);
    const shuffledAnimals = shuffle(animals);
    const voices_en = [
      'en-US-Studio-O',
      'en-US-Studio-Q',
      'en-US-Wavenet-A',
      'en-US-Wavenet-B',
      'en-US-Wavenet-C',
      'en-US-Wavenet-D',
      'en-US-Wavenet-E',
      'en-US-Wavenet-F',
      'en-US-Wavenet-G',
      'en-US-Wavenet-H',
    ];
    const voices_de = [
      'de-DE-Studio-B',
      'de-DE-Studio-C',
      'de-DE-Wavenet-A',
      'de-DE-Wavenet-B',
      'de-DE-Wavenet-C',
      'de-DE-Wavenet-D',
      'de-DE-Wavenet-E',
      'de-DE-Wavenet-F',
      'de-DE-Wavenet-H',
    ];
    const voices = lang === 'de' ? voices_de : voices_en;
    const result = [];
    for (const voice of voices) {
      result.push({
        src: `/sounds/voice-memory/${lang}_${voice}_${shuffledAnimals.pop()}.mp3`,
        val: voice,
      });
      result.push({
        src: `/sounds/voice-memory/${lang}_${voice}_${shuffledAnimals.pop()}.mp3`,
        val: voice,
      });
    }
    return result.splice(0, numberSpeakers * 2);
  }

  randomHomophone(query: RandomWord): WordList {
    let word = '';
    do {
      word = this.dictionaryService.getRandomWord(
        query.lang,
        query.minLength,
        query.maxLength,
        query.category
      );
    } while (query.exclude && query.exclude.indexOf(word) > -1);

    const homoPhones = this.dictionaryService
      .getHomophones(query.lang, word)
      .filter((w) => w.length === word.length);
    const words = [word];
    homoPhones.forEach((p) => words.push(p));
    return {
      val: words,
    };
  }

  getAlphabet(query: { lang: string }): string[] {
    const letters_de = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ';
    const letters_en = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letters_es = 'AÁBCDEÉFGHIÍJKLMNÑOÓPQRSTUÚÜVWXYZ';
    const letters =
      query.lang == 'de'
        ? letters_de
        : query.lang == 'es'
        ? letters_es
        : letters_en;
    return letters.split('');
  }

  getAnagram(query: RandomWord): string[] {
    let word: string;
    do {
      word = this.dictionaryService.getRandomWord(
        query.lang,
        query.minLength,
        query.maxLength
      );
    } while (query.exclude && query.exclude.indexOf(word) > -1);
    const words = this.dictionaryService.getAnagrams(query.lang, word);
    return words;
  }
}
