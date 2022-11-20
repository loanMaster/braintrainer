<template>
 <div class="g-full-width user-select-none mt-1">
   <div class="c-exercise-status-header g-full-width">
     <div class="c-timer-and-strike-container">
      <StrikeCounter ref="strikeCounter" class="c-strike-counter"/>
    </div>
    <QuestionNumberIndicator/>
    <div class="text-end">
      <button class="btn c-repeat-button" @click="pause">⏸</button>
      <button class="btn c-repeat-button" @click="repeat">🔊</button>
    </div>
  </div>
  <!--<div class="c-title">{{ $t(nameOfTheGame)}} ({{ $t(difficulty) }})</div>-->
 </div>
</template>

<script setup lang="ts">
import StrikeCounter from 'src/components/exercises/shared/StrikeCounter.vue'
import QuestionNumberIndicator from 'src/components/exercises/shared/QuestionNumberIndicator.vue'
import { computed, defineEmits } from 'vue'
import {getNameOfTheGame} from "src/util/game.name.helper";
import {useRoute} from "vue-router";
import {useAppStore} from "stores/app-store";

const store = useAppStore()
const emits = defineEmits(['repeat'])

function repeat () {
  emits('repeat')
}

const nameOfTheGame = computed(() => getNameOfTheGame(useRoute().params.game as string))

const difficulty = computed(() => {
  return useRoute().params.difficulty as string
})

function pause () {
  store.$patch({ pause: true })
}
</script>

<style scoped>
.c-strike-counter {
  margin-left: 12px;
}
.c-exercise-status-header {
  display: grid;
  grid-template-columns: 25% 50% 25%;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: 5px;
}
.c-timer-and-strike-container {
  display: flex;
  align-items: center;
}
.btn.c-repeat-button {
  font-size: 2rem;
  padding: 0 3px;
}
@media screen and (max-width: 992px) {
  .btn.c-repeat-button {
    font-size: 1.5rem;
  }
  .c-exercise-status-header {
    grid-template-columns: 33.3% 33.3% 33.3%;
  }
  .c-strike-counter {
    margin-left: 6px;
  }
}
.c-title {
  font-size: 2rem;
}
@media screen and (max-width: 992px) {
  .c-title {
    font-size: 1.5rem;
  }
}
</style>
