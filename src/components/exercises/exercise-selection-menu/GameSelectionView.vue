<template>
  <div class="flex-auto column justify-center items-center">
    <div v-for="game in games" :key="game" class="q-mx-auto text-center ">
      <q-btn color="primary" class="shadow-5 q-ma-sm" rounded :label="$t(game)" @click="selectGame(game)"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {useAppStore} from "stores/app-store";
import {GAMES} from "src/const/games";
import {NavService} from "src/router/nav.service";
import {DailyTrainingService} from "src/shared-services/daily-training.service";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";
import {showEnterUsernameDialog} from "src/util/show-enter-username-dialog";

const showEnterNameModal = ref(false)
const $q = useQuasar()
const { t } = useI18n()

onMounted(() => useAppStore().finishDailyTraining())

const games = ref(GAMES)

function selectGame (game: string) {
  new NavService().navigateTo({ name: 'select-difficulty', nameOfTheGame: game.toLowerCase() })
}

function getMedals (game: string): number {
  let medals = 0
  for (const diff of ['easy', 'normal', 'hard']) {
    if (useAppStore().player.ratings[game]?.[diff] === 3) {
      medals++
    }
  }
  return medals
}

function startDailyTrainingNow() {
  useAppStore().startDailyTraining()
  const { nameOfTheGame, difficulty } = new DailyTrainingService().getNextExercise()
  new NavService().navigateTo({ name: 'play', nameOfTheGame: nameOfTheGame.toLowerCase(), difficulty })
}

async function startDailyTraining () {
  if (useAppStore().player.name === '') {
    const name = await showEnterUsernameDialog($q, t);
    if (name) {
      useAppStore().addUser(name)
      startDailyTrainingNow()
    }
  } else {
    startDailyTrainingNow()
  }
}


function onNameEntered (name: string) {
  if (name) {
    useAppStore().setName(name)
    showEnterNameModal.value = false
    startDailyTraining()
  }
}
</script>
