import {defineStore} from 'pinia';
import {PersistenceService} from "src/shared-services/persistence.service";
import {v4 as uuidv4} from 'uuid'
import {i18n} from "boot/i18n";
import {LETTERS} from "src/const/letters";
import {NavService} from "src/router/nav.service";
import {calculateScore} from "src/util/calculate-score";
import {Composer, useI18n} from "vue-i18n";

const refractoryTime = 500;
const maxRefractoryTime = 1500;

export interface Exercise {
  correctAnswers: number;
  totalQuestions: number;
  strikes: number;
  duration: number;
  fail: boolean;
  difficulty: string;
  nameOfTheGame: string;
  finished: boolean;
  beginTimeStamp: number;
  totalStrikeCount: number;
  lastStrike: number;
  lastSuccessfulStrike: number;
  currentQuestion: number;
  paused?: boolean;
  rating?: number;
  score?: number
}

export const newExercise = (nameOfTheGame: string, difficulty: string, totalQuestions: number) => ({
    correctAnswers: 0,
    totalQuestions,
    strikes: 0,
    duration: 0,
    fail: false,
    difficulty,
    nameOfTheGame,
    finished: false,
    beginTimeStamp: Date.now(),
    totalStrikeCount: 0,
    lastSuccessfulStrike: 0,
    lastStrike: 0,
    currentQuestion: 0,
})

export interface Ratings {
  [key: string]: {
    [key: string]: number
  }
}

export interface Player {
  id: string;
  name: string;
  xp: number;
  level: number;
  ratings: Ratings,
  averageRatings: Ratings,
  exerciseHistory: string[]
}

export interface Players {
  [key: string]: Player
}

export interface DailyTraining {
  active: boolean
  results: Exercise[]
}

export interface IAppState {
  currentPlayerId: string;
  players: Players
  exercise: Exercise
  machineId: string
  dailyTraining: DailyTraining
  pause: boolean
  _language: string
}

const getBrowserLanguage = (): string => {
  const lang = navigator.language || (navigator as any).userLanguage || 'en';
  const short = lang.toLowerCase().substring(0, 2)
  switch (short) {
    case 'de':
      return 'de'
    case 'es':
      return 'es'
    default:
      return 'en'
  }
}

const storeMachineId = (machineId: string) => {
  new PersistenceService().store('machineId', machineId)
}

const storeCurrentPlayerId = (playerId: string) => {
  new PersistenceService().store('currentPlayerId', playerId)
}

const newPlayer = () => {
  return { name: '', xp: 0, level: 0, id: uuidv4(), averageRatings: {}, ratings: {}, exerciseHistory: [] }
}

const calculateRating = (exercise: Exercise) => {
  const percentageCorrect = exercise.correctAnswers / exercise.totalQuestions
  const numberOfErrors = exercise.strikes
  const errorQuote = exercise.strikes / exercise.totalQuestions
  if (errorQuote <= 0.1 && percentageCorrect === 1.0) {
    return 3
  } else if (percentageCorrect === 1 && (numberOfErrors < 3 || errorQuote <= 0.2)) {
    return 2
  } else if (percentageCorrect > 0.5) {
    return 1
  }
  return 0
}


export const useAppStore = defineStore('main', {
  state: (): IAppState => {
    if (!new PersistenceService().fetch('machineId')) {
      storeMachineId(uuidv4())
    }
    let players = new PersistenceService().fetch('players')
    let currentPlayerId = new PersistenceService().fetch('currentPlayerId')
    if (!players || !currentPlayerId || !players[currentPlayerId]) {
      const player = newPlayer()
      storeCurrentPlayerId(player.id)
      currentPlayerId = player.id
      players = {
        [currentPlayerId]: player
      }
    }
    return {
      currentPlayerId: currentPlayerId,
      machineId: new PersistenceService().fetch('machineId') || uuidv4(),
      players: players,
      dailyTraining: {active: false, results: [] as Exercise[]},
      pause: false,
      exercise: newExercise('rememberNumbers', 'easy', 5),
      _language: getBrowserLanguage()
    } as IAppState
  },
  getters: {
    player (state: IAppState): Player {
      return state.players[state.currentPlayerId]
    },
    language (): string {
      return this._language
    },
    letters (): string {
      return LETTERS[useAppStore().language as 'de'|'en'|'es']
    }
  },
  actions: {
    setName (name: string) {
      this.players[this.currentPlayerId].name = name
      storePlayers()
    },
    updateRating ({ nameOfTheGame, difficulty, rating}: { nameOfTheGame: string, difficulty: string, rating: number }) {
      const gameRating = this.players[this.currentPlayerId].ratings?.[nameOfTheGame]?.[difficulty] || -1
      if (gameRating < rating) {
        this.players[this.currentPlayerId].ratings[nameOfTheGame] = this.players[this.currentPlayerId].ratings[nameOfTheGame] || {}
        this.players[this.currentPlayerId].ratings[nameOfTheGame][difficulty] = rating
      }
      const averageRating = this.players[this.currentPlayerId].averageRatings[nameOfTheGame] || {}
      if (!averageRating[difficulty]) {
        averageRating[difficulty] = rating
      } else {
        averageRating[difficulty] = 0.3 * rating + 0.7 * averageRating[difficulty]
      }
      this.players[this.currentPlayerId].averageRatings[nameOfTheGame] = averageRating
    },
    startDailyTraining  () {
      this.dailyTraining.active = true
      this.dailyTraining.results = []
    },
    finishDailyTraining () {
      this.dailyTraining.active = false
      this.dailyTraining.results = []
    },
    async exerciseFinished (exercise: Exercise) {
      const rating = calculateRating(exercise)
      await this.updateRating({
        nameOfTheGame: exercise.nameOfTheGame,
        difficulty: exercise.difficulty,
        rating
      })
      if (this.dailyTraining) {
        this.exercise = exercise
        this.dailyTraining.results.push(exercise)
      }
      this.exercise = exercise
      this.player.exerciseHistory.push(exercise.nameOfTheGame);
      storePlayers()
    },
    setLanguage (i18n: Composer<any>, lang: string) {
      i18n.locale.value = lang
      this._language = lang
    },
    async addUser (userName: string) {
      const additionalPlayer = newPlayer()
      additionalPlayer.name = userName
      this.players[additionalPlayer.id] = additionalPlayer
      storePlayers()
      this.currentPlayerId = additionalPlayer.id
    },
    async deleteUser (userId: string) {
      if (userId === this.currentPlayerId) {
        if (Object.keys(this.players).length === 1) {
          this.addUser('noname')
        }
        this.currentPlayerId = Object.keys(this.players).find(id => id !== userId)!
      }
      delete this.players[userId]
      storePlayers()
    },
    setCurrentPlayerId (currentPlayerId: string) {
      this.currentPlayerId = currentPlayerId
      storeCurrentPlayerId(this.currentPlayerId)
    },
    strike (): boolean {
      if (Date.now() - this.exercise.lastStrike < refractoryTime && Date.now() - this.exercise.lastSuccessfulStrike < maxRefractoryTime) {
        this.exercise.lastStrike = Date.now()
        return false
      }
      this.exercise.lastSuccessfulStrike = Date.now()
      this.exercise.lastStrike = Date.now()
      this.exercise.strikes++
      this.exercise.totalStrikeCount++
      return true
    },
    finishExercise() {
      this.exercise.duration = Date.now() - this.exercise.beginTimeStamp
      this.exercise.finished = true
      this.exercise.score = calculateScore(this.exercise)
      this.exercise.rating = calculateRating(this.exercise)
    }
  }
});

const storePlayers = (players?: Players) => {
  new PersistenceService().store('players', players || useAppStore().players)
}

