<template>
  <div class="d-flex flex-column align-items-center justify-content-between g-full-height">
    <h1 class="mt-2">{{ $t('Exercise finished') }}</h1>
    <div class="c-container">
      <div class="c-stars c-transparent" ref="stars">
        <span v-for="(val) in Array.from(Array(3 - store.exercise.rating).keys())" :key="val" class="c-star-inactive">★</span>
        <span v-for="(val) in Array.from(Array(store.exercise.rating).keys())" :key="val" class="c-star-active">★</span>
      </div>
      <div class="c-score-list g-small-font c-transparent" ref="scores">
        <div class="mt-2 mb-2">{{ $t('Solved: {correct} / {total}', { correct: store.exercise.correctAnswers, total: store.exercise.totalQuestions }) }}</div>
        <div class="mt-2 mb-2">{{ $t('{time} seconds, {strikes} mistakes', { strikes: store.exercise.errors, time: store.exercise.duration } ) }}</div>
        <div class="mt-2 mb-2">{{ $t('Score: {score}', { score: store.exercise.score }) }}</div>
        <div class="mt-2 mb-2" v-if="updateScoreResponse?.isNewHighScore">🍾 {{ $t('New Highscore') }} 🥂</div>
        <div class="mt-2 mb-2" v-if="!updateScoreResponse?.isNewHighScore">{{ $t('Better than {percentile}% of players', { percentile: percentile }) }}</div>
      </div>
    </div>
    <div class="c-buttons">
      <button v-if="dailyTrainingActive && hasNextDailyExercise()" @click="continueDailyTraining" class="g-mr-2 g-ml-2 mb-2 btn btn-outline-dark">{{ $t('Continue daily training') }}</button>
      <button @click="playAgain" class="g-mr-2 g-ml-2 mb-2 btn btn-outline-dark">{{ $t('Play again') }}</button>
    </div>
    <div class="mt-4">
      <h2>{{ $t('More apps') }}</h2>
      <OtherSites/>
    </div>

    <div class="mt-4 pb-4">
      <h2>{{ $t('Donate') }}</h2>
      <DonationLinks/>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppModal from 'src/components/shared/AppModal.vue'
import { ScoreService, UpdateScoreResponse } from 'src/shared-services/score.service'
import { SoundService } from 'src/shared-services/sound.service'
import { DailyTrainingService } from 'src/shared-services/daily-training.service'
import OtherSites from 'src/components/shared/OtherSites.vue'
import DonationLinks from 'src/components/shared/DonationLinks.vue'
import { TweenService } from 'src/shared-services/tween.service'
import { NavService } from 'src/router/nav.service'
import { ref, computed, Ref, onMounted, onBeforeMount } from 'vue'
import {newExercise, useAppStore} from 'src/stores/app-store'
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";
import {hideLoadingIndicator, showLoadingIndicator} from "src/util/loading-indicator";

const store = useAppStore()
const $q = useQuasar()
const { t } = useI18n()
const stars = ref()
const scores = ref()
const updateScoreResponse: Ref<UpdateScoreResponse | null> = ref(null)

const percentile = computed(() =>
  updateScoreResponse.value ? Math.floor(updateScoreResponse.value.percentile * 100) : 0
)

onBeforeMount(() => {

  // for debugging
  store.$patch(store => {
    store.exercise = newExercise('memory', 'hard', 10)
    store.exercise.rating = 2
    store.exercise.score = 1000
  })

  if (dailyTrainingActive.value && !hasNextDailyExercise()) {
    $q.dialog({
      title: '🎉 ' + t('Daily training finished')
    })
    store.finishDailyTraining() // show modal
  }
})

onMounted(async () => {
  showLoadingIndicator($q)
  if (store.exercise.fail) {
    new SoundService().playFail()
  } else {
    new SoundService().playLevelFinished()
  }

  if (store.player.name !== 'tester007') {
    /*updateScoreResponse.value = await new ScoreService().updateScore({ // TODO call store?
      score: score,
      nameOfTheGame: exerciseResult.nameOfTheGame,
      difficulty: exerciseResult.difficulty,
      name: $store.getters.player.name,
      id: $store.getters.player.id
    })*/
  } else {
    updateScoreResponse.value = {
      percentile: 3,
      isNewHighScore: false
    }
  }
  hideLoadingIndicator($q)
  new TweenService().fadeIn(stars.value as HTMLElement, 0.5)
  new TweenService().fadeIn(scores.value as HTMLElement, 0.5)
})

function playAgain () {
  new NavService().navigateTo({
    name: 'play',
    nameOfTheGame: store.exercise.nameOfTheGame.toLowerCase(),
    difficulty: store.exercise.difficulty
  })
}

const dailyTrainingActive = computed(() => store.dailyTraining.active)

function hasNextDailyExercise () {
  return new DailyTrainingService().hasNext()
}

function continueDailyTraining () {
  const { nameOfTheGame, difficulty } = new DailyTrainingService().getNextExercise()
  new NavService().navigateTo({
    name: 'play',
    nameOfTheGame: nameOfTheGame.toLowerCase(),
    difficulty
  })
}
</script>

<style scoped>
.c-score-list {
  text-align: center;
}
.c-stars {
  font-size: 3rem;
}
@media screen and (max-width: 992px) and (orientation: landscape) {
  .c-stars {
    font-size: 2rem;
  }
}
.c-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
  justify-content: center;
}
.c-buttons {
 display: flex;
 flex-direction: column;
}
@media screen and (max-width: 992px) and (orientation: landscape) {
  .c-buttons {
    flex-direction: row;
  }
}
.c-star-active {
  color: yellow;
  text-shadow: 2px 1px black;
}
.c-star-inactive {
  opacity: 0.2;
  color: darkgray;
  text-shadow: 2px 1px black;
}
.c-transparent {
  opacity: 0
}
</style>
