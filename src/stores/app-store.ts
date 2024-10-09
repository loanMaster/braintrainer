import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { LETTERS } from 'src/const/letters';
import { calculateScore } from 'src/util/calculate-score';
import { Composer } from 'vue-i18n';
import { mapScoreToRating } from 'src/util/calculate-rating';

const refractoryTime = 250;
const maxRefractoryTime = 750;

export interface Exercise {
  correctAnswers: number;
  totalQuestions: number;
  strikes: number;
  duration: number;
  difficulty: string;
  nameOfTheGame: string;
  state: 'created' | 'started' | 'finished';
  paused: boolean;
  beginTimeStamp: number;
  totalStrikeCount: number;
  lastStrike: number;
  lastSuccessfulStrike: number;
  currentQuestion: number;
  rating?: number;
  score?: number;
  audioState: AudioState;
  totalAudioDuration: number;
  enableSkip: boolean;
}

export const newExercise = (
  nameOfTheGame: string,
  difficulty: string,
  totalQuestions: number,
  enableSkip = true
): Exercise => ({
  correctAnswers: 0,
  totalQuestions,
  strikes: 0,
  duration: 10,
  difficulty,
  nameOfTheGame,
  state: 'created',
  paused: false,
  beginTimeStamp: Date.now(),
  totalStrikeCount: 0,
  lastSuccessfulStrike: 0,
  lastStrike: 0,
  currentQuestion: 0,
  totalAudioDuration: 0,
  audioState: { playing: false, meta: {}, playingSequence: false },
  enableSkip,
});

export interface AudioState {
  playing: boolean;
  meta: { [key: string]: string | boolean | undefined | number };
  playingSequence: boolean;
}

export interface Score {
  nameOfTheGame: string;
  difficulty: string;
  score: number;
  date: number;
}

export interface IAppState {
  exercise: Exercise;
  machineId: string;
  _language: string;
  _themePreference: string;
  playerScores?: { scores: Score[] };
  scoreHistory?: Score[];
}

const getBrowserLanguage = (): string => {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  const short = lang.toLowerCase().substring(0, 2);
  switch (short) {
    case 'de':
      return 'de';
    case 'es':
      return 'es';
    default:
      return 'en';
  }
};

const tmp = {
  soundStart: 0,
  pauseEnd: 0,
};

const store = (data: any, key: string) => {
  localStorage.setItem(key, btoa(JSON.stringify(data)));
};
const fetch = (key: string) => {
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(atob(data));
  } else {
    return undefined;
  }
};

export const useAppStore = defineStore('main', {
  state: (): IAppState => {
    if (!localStorage.getItem('machineId')) {
      localStorage.setItem('machineId', uuidv4());
    }
    const playerScores = fetch('playerScores');
    if (playerScores === undefined) {
      store({ scores: [] }, 'playerScores');
    }
    const scoreHistory = fetch('scoreHistory');
    if (scoreHistory === undefined) {
      store([], 'scoreHistory');
    }
    return {
      machineId: localStorage.getItem('machineId') || uuidv4(),
      dailyTraining: { active: false, results: [] as Exercise[] },
      exercise: newExercise('remember-numbers', 'normal', 5),
      _language: localStorage.getItem('language') || getBrowserLanguage(),
      _themePreference: localStorage.getItem('themePreference') || 'dark',
      playerScores,
      scoreHistory,
    } as IAppState;
  },
  getters: {
    language(): string {
      return this._language;
    },
    letters(): string {
      return LETTERS[useAppStore().language as 'de' | 'en' | 'es'];
    },
    themePreference(): string {
      return this._themePreference;
    },
  },
  actions: {
    setLanguage(i18n: Composer<any>, lang: string, _redirect = true) {
      console.log(_redirect);
      i18n.locale.value = lang;
      this._language = lang;
      localStorage.setItem('language', lang);
    },
    strike(): boolean {
      if (
        Date.now() - this.exercise.lastStrike < refractoryTime &&
        Date.now() - this.exercise.lastSuccessfulStrike < maxRefractoryTime
      ) {
        this.exercise.lastStrike = Date.now();
        return false;
      }
      this.exercise.lastSuccessfulStrike = Date.now();
      this.exercise.lastStrike = Date.now();
      this.exercise.strikes++;
      this.exercise.totalStrikeCount++;
      return true;
    },
    finishExercise() {
      this.exercise.duration +=
        Date.now() - Math.max(tmp.pauseEnd || this.exercise.beginTimeStamp);
      this.exercise.state = 'finished';
      this.exercise.score = calculateScore(this.exercise);
      this.exercise.rating = mapScoreToRating(this.exercise.score);
      if (this.scoreHistory !== undefined) {
        this.scoreHistory.push({
          difficulty: this.exercise.difficulty,
          nameOfTheGame: this.exercise.nameOfTheGame,
          score: this.exercise.score,
          date: Date.now(),
        });
        store(this.scoreHistory, 'scoreHistory');
      }
      if (this.playerScores !== undefined) {
        const matchingScore = this.playerScores.scores.find(
          (s) =>
            s.nameOfTheGame === this.exercise.nameOfTheGame &&
            s.difficulty === this.exercise.difficulty
        );
        if (!matchingScore) {
          this.playerScores.scores.push({
            nameOfTheGame: this.exercise.nameOfTheGame,
            difficulty: this.exercise.difficulty,
            score: this.exercise.score!,
            date: Date.now(),
          });
          store(this.playerScores, 'playerScores');
        } else if (matchingScore.score < this.exercise.score!) {
          matchingScore.score = this.exercise.score!;
          matchingScore.date = Date.now();
          store(this.playerScores, 'playerScores');
        }
      }
    },
    pause(): boolean {
      if (this.exercise.state === 'started') {
        this.exercise.paused = true;
        this.exercise.duration +=
          Date.now() - Math.max(this.exercise.beginTimeStamp, tmp.pauseEnd);
        return true;
      }
      return false;
    },
    resume(): boolean {
      if (this.exercise.paused) {
        this.exercise.paused = false;
        tmp.pauseEnd = Date.now();
        return true;
      }
      return false;
    },
    playerReady() {
      // noop
    },
    beginExercise() {
      this.exercise.state = 'started';
      this.exercise.beginTimeStamp = Date.now();
    },
    repeatAudio() {
      // noop
    },
    skip() {
      // noop
    },
    startedPlayingSound(meta: {
      [key: string]: string | boolean | undefined | number;
    }): void {
      this.exercise.audioState.playing = true;
      this.exercise.audioState.meta = meta;
    },
    finishedPlayingSound(meta: {
      [key: string]: string | boolean | undefined | number;
    }): void {
      this.exercise.audioState.playing = false;
      this.exercise.audioState.meta = meta;
    },
    setThemePreference(theme: 'light' | 'dark') {
      this._themePreference = theme;
      localStorage.setItem('themePreference', theme);
    },
    startedPlaySequence() {
      this.exercise.audioState.playingSequence = true;
    },
    finishedPlayingSequence() {
      this.exercise.audioState.playingSequence = false;
    },
  },
});
