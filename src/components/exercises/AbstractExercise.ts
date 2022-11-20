import { SoundService } from '@/shared-services/sound.service'
import { Subject } from 'rxjs'
import { getNameOfTheGame } from '@/domains/game/util/game.name.helper'
import {NavService} from "@/router/nav.service";
import {LETTERS} from "@/domains/game/const/letters";

const setup = () => {
  destroy = new Subject<void>();
  totalTime = 180
  currentQuestion = 0
  correctAnswers = 0
  inputDisabled = false
  revealed = false
  numberOfQuestions = 6

  soundService: SoundService = new SoundService();
  unsubscribe: (() => void) | undefined

  created () {
    this.unsubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'pause') {
        this.onPause(this.$store.state.pause)
      }
    })
  }

  onPause(pause: boolean) {
    this.soundService.pause(pause)
  }

  onTimeout () {
    this.finishExercise(true)
  }

  async finishExercise (fail = false) {
    await Promise.all([this.$store.dispatch('exerciseFinished', {
      correctAnswers: this.correctAnswers,
      totalQuestions: this.numberOfQuestions,
      strikes: this.strikeCounter.totalStrikeCount,
      totalTime: this.totalTime,
      remainingTime: this.countdownTimer.remainingTimeInSeconds,
      fail: fail,
      nameOfTheGame: this.nameOfTheGame,
      difficulty: this.$route.params.difficulty
    }), this.wait(500)])
    new NavService().navigateTo({
      name: 'score'
    })
  }

  get nameOfTheGame () {
    return getNameOfTheGame(this.$route.params.game as string)
  }

  abstract playAudio(): void

  async repeat () {
    if (!this.soundService.isPlaying()) {
      this.inputDisabled = true
      await this.playAudio()
      this.inputDisabled = false
    }
  }

  beforeUnmount () {
    this.destroy.next()
    this.destroy.complete()
    this.soundService.stop()
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }

  get difficulty () {
    return this.$route.params.difficulty
  }

  async wait (time: number) {
    await new Promise(resolve => setTimeout(resolve, time))
  }

  get language (): ('en' | 'de' | 'es') {
    return this.$store.getters.player.language
  }

  get letters (): string {
    return LETTERS[this.language]
  }
}
