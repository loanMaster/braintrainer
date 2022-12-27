import { requestHelper } from 'src/shared-services/request.helper';

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

export interface Introduction {
  text: string;
  audio: {
    introduction: string;
    name: string;
  };
  name: string;
  gender: 'FEMALE' | 'MALE';
}

export interface RandomWord {
  lang: string;
  minLength: number;
  maxLength: number;
  number: number;
  category?: string;
  gender?: string;
  exclude?: string[];
}

export interface HomophoneAudioResponse {
  audio: string;
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
