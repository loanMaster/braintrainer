<template>
  <div class="row justify-between q-pa-xs">
    <StrikeCounter ref="strikeCounter" />
    <div class="relative-position row col-grow q-px-sm items-center">
      <QuestionNumberIndicator />
    </div>
    <div class="flex items-center">
      <q-btn round color="primary" :icon="matPause" @click="pause" />
      <q-btn
        round
        color="primary"
        :icon="matVolumeUp"
        class="q-ml-sm"
        @click="repeat"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { matVolumeUp, matPause } from '@quasar/extras/material-icons';
import StrikeCounter from './StrikeCounter.vue';
import QuestionNumberIndicator from './QuestionNumberIndicator.vue';
import { useAppStore } from 'stores/app-store';

const store = useAppStore();

function repeat() {
  store.repeatAudio();
}

function pause() {
  store.pause();
}
</script>
