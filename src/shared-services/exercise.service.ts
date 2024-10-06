import { randomElement, shuffle } from 'src/util/array.utils';
import { DictionaryProvider } from '../components/exercises/service/dictionary.provider';
import { DictionaryService } from '../components/exercises/service/dictionary.service';
import { requestHelper } from '../shared-services/request.helper';
import languageBasics from '../components/exercises/service/other-languages/language-basics.json';
import translationsDe from '../components/exercises/service/other-languages/translation-de.json';

export interface IntroductionRequest {
  lang: string;
  count: number;
}

export interface IntroductionResponse {
  introductions: Introduction[];
  optionalNames: {
    FEMALE: string[];
    MALE: string[];
  };
}

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

export interface HomophoneAudioResponse {
  audio: string;
  val: string[];
  alts?: string[];
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

export interface AnagramResponse {
  words: string[];
}

export class ExerciseService {
  private dictionaryService: DictionaryService;

  constructor() {
    this.dictionaryService = new DictionaryService(new DictionaryProvider());
  }

  get serverPath() {
    return serverPath || '';
  }

  async fetchWordGroup(req: {
    lang: string;
    minLength: number;
    maxLength: number;
    includeWordList: boolean;
  }): Promise<WordGroupResponse> {
    const response = await fetch(this.serverPath + '/speech/word-group', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(req),
    });
    return response.json();
  }

  async fetchRandomWords(randomWord: RandomWord): Promise<AudioResponse[]> {
    const response = await fetch(this.serverPath + '/speech/words', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord),
    });
    return response.json();
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
    const words = entry[difficulty === 'easy' ? 'easy' : 'normal'];
    return {
      words: Object.keys(words).map((word) => ({
        src: `/sounds/other-languages/${entry.lang}_${word}.mp3`,
        val: words[word],
        key: word,
      })),
      lang: entry.lang,
    };
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

  async fetchNumbers(numberRequest: NumberRequest): Promise<AudioResponse[]> {
    const response = await fetch(this.serverPath + '/speech/numbers', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(numberRequest),
    });
    return response.json();
  }

  async fetchHomophone(
    randomWord: RandomWord
  ): Promise<HomophoneAudioResponse> {
    const response = await fetch(this.serverPath + '/speech/homophone', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord),
    });
    return response.json();
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

  async fetchHomophones(
    randomWord: RandomWords
  ): Promise<HomophoneAudioResponse[]> {
    const response = await fetch(this.serverPath + '/speech/homophones', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord),
    });
    return response.json();
  }

  async fetchWordsBackwards(randomWord: RandomWord): Promise<AudioResponse> {
    const response = await fetch(this.serverPath + '/speech/words-backwards', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord),
    });
    return response.json();
  }

  async fetchAlphabet(query: { lang: string }): Promise<AudioResponse[]> {
    const response = await fetch(this.serverPath + '/speech/alphabet', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(query),
    });
    return response.json();
  }

  async fetchAnagram(randomWord: RandomWord): Promise<AnagramResponse> {
    const response = await fetch(
      this.serverPath + '/dictionary/random-anagram',
      {
        ...requestHelper.getStandardRequestInit(),
        method: 'POST',
        body: JSON.stringify(randomWord),
      }
    );
    return response.json();
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

  async fetchIntroductions(
    req: IntroductionRequest
  ): Promise<IntroductionResponse> {
    const response = await fetch(this.serverPath + '/speech/introductions', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(req),
    });
    return response.json();
  }
}
