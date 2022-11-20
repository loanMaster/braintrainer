<template>
  <div class="g-game-container user-select-none">
    <h1 class="text-center mb-2 mt-4">{{ $t(nameOfTheGame) }}</h1>
    <h2 class="text-center mt-2 mb-2">{{ $t('Select difficulty') }}</h2>
    <div class="c-game-selection-container mt-2">
      <div v-for="difficulty in difficulties" class="c-difficulty-selection-buttons" :key="difficulty" >
        <button class="btn btn-outline-dark text-center g-flex-1 position-relative" @click="selectDifficulty(difficulty)">
          <Stars :rating="getStars(difficulty)" class="c-stars"/>
          {{ $t(difficulty) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNameOfTheGame } from 'src/util/game.name.helper'
import StarsRating from 'src/components/shared/StarsRating.vue'
import { NavService } from 'src/router/nav.service'
import { ref, computed } from 'vue'
import {useRoute, useRouter} from "vue-router";
import {useAppStore} from "stores/app-store";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";
import {showEnterUsernameDialog} from "src/util/show-enter-username-dialog";

const showSpellingInfo = ref(false)
const selectedDifficulty = ref('')
const difficulties = ref(['easy', 'normal', 'hard'])

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const nameOfTheGame = computed(() => getNameOfTheGame(route.params.game as string))

function getStars (difficulty: string): number {
  return useAppStore().player.ratings[nameOfTheGame.value]?.[difficulty] || 0
}

async function selectDifficulty (difficulty: string) {
  selectedDifficulty.value = difficulty
  if (useAppStore().player.name === '') {
    const name = await showEnterUsernameDialog($q, t);
    if (name) {
      useAppStore().setName(name)
      spellingInfo()
    }
  } else {
    spellingInfo()
  }
}

function spellingInfo () {
  const lang = useAppStore().language
  if (lang !== 'es' && (nameOfTheGame.value === 'SpellBackwards' || nameOfTheGame.value === 'WordScramble')) {
    $q.dialog({
      title: t('A hint regarding spelling'),
      message: t('A hint regarding spelling')
    })
  } else {
    startGame()
  }
}

function startGame () {
  new NavService().navigateTo({ name: 'play', nameOfTheGame: route.params.game as string, difficulty: selectedDifficulty.value })
}
</script>

<style scoped>
.c-game-selection-container {
  margin: auto;
  width: 30%;
  display: flex;
  flex-direction: column;
  align-content: center;
}

@media screen and (max-width: 992px) and (orientation: landscape) {
  .c-game-selection-container {
    width: 60%;
  }
}

@media screen and (max-width: 992px) and (orientation: portrait) {
  .c-game-selection-container {
    width: 90%;
  }
}
.c-stars {
  font-size: 1.5rem;
  position: absolute;
  right: 3px;
}

.c-difficulty-selection-buttons {
  min-width: 50%;
  display: flex;
  padding: 10px;
  justify-content: center;
}

@media screen and (max-width: 992px) and (orientation: landscape) {
  .c-stars {
    font-size: 1rem;
  }
}
@media screen and (max-width: 992px) and (orientation: portrait) {
  .c-stars {
    font-size: 1.25rem;
  }
}
</style>
