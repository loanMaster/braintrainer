import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { LETTERS } from 'src/const/letters';
import { calculateScore } from 'src/util/calculate-score';
import { Composer } from 'vue-i18n';
import { mapScoreToRating } from 'src/util/calculate-rating';
import { exercises } from 'src/const/exercises';

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
  audio: boolean;
  minLength: number;
  maxLength: number;
  sequenceLength: number;
}

export const newExercise = (
  nameOfTheGame: string,
  difficulty: string
): Exercise => {
  const index = difficulty === 'normal' ? 0 : difficulty === 'hard' ? 1 : 2;
  const config = exercises.find((e) => e.name === nameOfTheGame)!;
  return {
    correctAnswers: 0,
    strikes: 0,
    duration: 10,
    difficulty,
    nameOfTheGame,
    state: 'created',
    beginTimeStamp: Date.now(),
    totalStrikeCount: 0,
    lastSuccessfulStrike: 0,
    lastStrike: 0,
    currentQuestion: 0,
    totalAudioDuration: 0,
    audioState: { playing: false, meta: {}, playingSequence: false },
    totalQuestions: config.numberOfQuestions
      ? config.numberOfQuestions[index]
      : 1,
    audio: config.audio,
    enableSkip: config.enableSkip || true,
    minLength: config.minLength ? config.minLength[index] : 0,
    maxLength: config.maxLength ? config.maxLength[index] : 0,
    sequenceLength: config.sequenceLength ? config.sequenceLength[index] : 0,
  };
};

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
    let playerScores = fetch('playerScores');
    if (playerScores === undefined) {
      playerScores = { scores: [] };
      store(playerScores, 'playerScores');
    }
    let scoreHistory = fetch('scoreHistory');
    if (scoreHistory === undefined) {
      scoreHistory = [];
      store(scoreHistory, 'scoreHistory');
    }
    return {
      machineId: localStorage.getItem('machineId') || uuidv4(),
      dailyTraining: { active: false, results: [] as Exercise[] },
      exercise: newExercise('remember-numbers', 'normal'),
      _language: localStorage.getItem('language') || getBrowserLanguage(),
      _themePreference: localStorage.getItem('themePreference') || 'light',
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
    setLanguage(i18n: Composer<any>, lang: string) {
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
        Date.now() - Math.max(this.exercise.beginTimeStamp);
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
