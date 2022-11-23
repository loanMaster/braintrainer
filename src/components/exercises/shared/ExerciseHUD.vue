<template>
  <div class="row justify-between q-pa-xs">
    <StrikeCounter ref="strikeCounter"/>
    <div class="relative-position row col-grow q-px-sm items-center">
      <QuestionNumberIndicator/>
    </div>
    <div class="flex items-center">
      <q-btn round color="primary" icon="pause" @click="pause"/>
      <q-btn round color="primary" icon="volume_up" class="q-ml-sm" @click="repeat"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import StrikeCounter from './StrikeCounter.vue'
import QuestionNumberIndicator from './QuestionNumberIndicator.vue'
import {computed} from 'vue'
import {getNameOfTheGame} from "src/util/game.name.helper";
import {useRoute} from "vue-router";
import {useAppStore} from "stores/app-store";

const store = useAppStore()

function repeat() {
  store.repeatAudio()
}

const nameOfTheGame = computed(() => getNameOfTheGame(useRoute().params.game as string))

const difficulty = computed(() => {
  return useRoute().params?.difficulty
})

function pause() {
  store.pause()
}
</script>
