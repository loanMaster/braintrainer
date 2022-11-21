<template>
  <q-toolbar class="bg-accent text-white no-pointer-events">
    <q-toolbar-title>
      {{ $t(nameOfTheGame) }} <span class="text-italic">({{ $t(difficulty) }})</span>
    </q-toolbar-title>
    <q-space></q-space>
    <ExerciseTimer/>
  </q-toolbar>
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
  import ExerciseTimer from './ExerciseTimer.vue'
  import StrikeCounter from 'src/components/exercises/shared/StrikeCounter.vue'
  import QuestionNumberIndicator from 'src/components/exercises/shared/QuestionNumberIndicator.vue'
  import {computed, defineEmits} from 'vue'
  import {getNameOfTheGame} from "src/util/game.name.helper";
  import {useRoute} from "vue-router";
  import {useAppStore} from "stores/app-store";

  const store = useAppStore()
  const emits = defineEmits(['repeat'])

  function repeat() {
    emits('repeat')
  }

  const nameOfTheGame = computed(() => getNameOfTheGame(useRoute().params.game as string))

  const difficulty = computed(() => {
    return useRoute().params.difficulty as string
  })

  function pause() {
    store.$patch({pause: true})
  }
</script>
