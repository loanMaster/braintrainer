import { requestHelper } from 'src/shared-services/request.helper';

export interface RandomWord {
  lang: string;
  minLength: number;
  maxLength: number;
  number: number;
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
}
