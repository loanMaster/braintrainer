import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { LETTERS } from 'src/const/letters';
import { calculateScore } from 'src/util/calculate-score';
import { Composer } from 'vue-i18n';
import { PercentileScore, Score } from 'src/shared-services/score.service';
import { mapScoreToRating } from 'src/util/calculate-rating';
import { useAuthStore } from 'stores/auth-store';

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
}

export const newExercise = (
  nameOfTheGame: string,
  difficulty: string,
  totalQuestions: number
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
});

export interface AudioState {
  playing: boolean;
  meta: { [key: string]: string | boolean | undefined | number };
  playingSequence: boolean;
}

export interface IAppState {
  exercise: Exercise;
  machineId: string;
  _language: string;
  _themePreference: string;
  playerScores?: { scores: PercentileScore[]; hasPercentiles: boolean };
  scoreHistory?: Score[];
  _noOfTimesPlayedAsGuest: number;
  playingAsGuest?: boolean;
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
};

export const useAppStore = defineStore('main', {
  state: (): IAppState => {
    if (!localStorage.getItem('machineId')) {
      localStorage.setItem('machineId', uuidv4());
    }
    return {
      machineId: localStorage.getItem('machineId') || uuidv4(),
      dailyTraining: { active: false, results: [] as Exercise[] },
      exercise: newExercise('remember-numbers', 'easy', 5),
      _language: localStorage.getItem('language') || getBrowserLanguage(),
      _themePreference: localStorage.getItem('themePreference') || 'dark',
      _noOfTimesPlayedAsGuest: Number(
        localStorage.getItem('noOfTimesPlayedAsGuest') || 0
      ),
      playerScores: undefined,
      scoreHistory: undefined,
      playingAsGuest: undefined,
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
    noOfGamesPlayedAsGuest(): number {
      return this._noOfTimesPlayedAsGuest;
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
      this.exercise.duration = Date.now() - this.exercise.beginTimeStamp;
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
      }
    },
    updatePlayerScores(percentile: number) {
      if (this.playerScores !== undefined) {
        const matchingScore = this.playerScores.scores.find(
          (s) =>
            s.nameOfTheGame === this.exercise.nameOfTheGame &&
            s.difficulty === this.exercise.difficulty
        );
        if (!matchingScore) {
          this.playerScores.scores.push({
            nameOfTheGame: this.exercise.nameOfTheGame,
            percentile: percentile,
            difficulty: this.exercise.difficulty,
            score: this.exercise.score!,
            date: Date.now(),
          });
        } else if (matchingScore.score < this.exercise.score!) {
          matchingScore.score = this.exercise.score!;
          matchingScore.percentile = percentile;
          matchingScore.date = Date.now();
        }
      }
    },
    pause(): boolean {
      if (this.exercise.state === 'started') {
        this.exercise.paused = true;
        return true;
      }
      return false;
    },
    resume(): boolean {
      if (this.exercise.paused) {
        this.exercise.paused = false;
        return true;
      }
      return false;
    },
    beginExercise() {
      this.exercise.state = 'started';
      if (!useAuthStore().isLoggedIn || !useAuthStore().isConfirmed) {
        this._noOfTimesPlayedAsGuest++;
        localStorage.setItem(
          'noOfTimesPlayedAsGuest',
          String(this._noOfTimesPlayedAsGuest)
        );
      }
    },
    repeatAudio() {
      // noop
    },
    startedPlayingSound(meta: { [key: string]: string | boolean | undefined | number }): void {
      this.exercise.audioState.playing = true;
      this.exercise.audioState.meta = meta;
      if (meta['measureTime']) {
        tmp.soundStart = Date.now();
      }
    },
    finishedPlayingSound(meta: { [key: string]: string | boolean | undefined | number }): void {
      this.exercise.audioState.playing = false;
      this.exercise.audioState.meta = meta;
      if (meta['measureTime']) {
        this.exercise.totalAudioDuration += Date.now() - tmp.soundStart;
      }
    },
    setThemePreference(theme: 'light' | 'dark') {
      this._themePreference = theme;
      localStorage.setItem('themePreference', theme);
    },
    startedPlaySequence(measureTime: boolean) {
      this.exercise.audioState.playingSequence = true
      if (measureTime) {
        tmp.soundStart = Date.now();
      }
    },
    finishedPlayingSequence(measureTime: boolean) {
      this.exercise.audioState.playingSequence = false
      if (measureTime) {
        this.exercise.totalAudioDuration += Date.now() - tmp.soundStart;
      }
    }
  },
});
