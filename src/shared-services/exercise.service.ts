import {useAppStore} from "stores/app-store";

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
  words: string[]
}

export class ExerciseService {
  private getStandardRequestInit (): RequestInit {
    return {
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'x-machine': useAppStore().machineId,
        'x-player': useAppStore().player.id
      }
    }
  }

  get serverPath () {
    return serverPath || ''
  }

  async fetchRandomWords (randomWord: RandomWord): Promise<AudioResponse[]> {
    const response = await fetch(this.serverPath + '/speech/words', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord)
    })
    return response.json()
  }

  async fetchNumbers (numberRequest: NumberRequest): Promise<AudioResponse[]> {
    const response = await fetch(this.serverPath + '/speech/numbers', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(numberRequest)
    })
    return response.json()
  }

  async fetchHomophone (randomWord: RandomWord): Promise<HomophoneAudioResponse> {
    const response = await fetch(this.serverPath + '/speech/homophone', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord)
    })
    return response.json()
  }

  async fetchWordsBackwards (randomWord: RandomWord): Promise<AudioResponse> {
    const response = await fetch(this.serverPath +'/speech/words-backwards', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord)
    })
    return response.json()
  }

  async fetchAlphabet (query: { lang: string }): Promise<AudioResponse[]> {
    const response = await fetch(this.serverPath +'/speech/alphabet', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(query)
    })
    return response.json()
  }

  async fetchAnagram (randomWord: RandomWord): Promise<AnagramResponse> {
    const response = await fetch(this.serverPath + '/dictionary/random-anagram', {
      ...this.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify(randomWord)
    })
    return response.json()
  }
}
