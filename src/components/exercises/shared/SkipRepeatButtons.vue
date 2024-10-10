<template>
  <div class="flex items-center q-my-sm justify-center">
    <q-btn
      v-if="store.exercise.enableSkip"
      :disable="store.exercise.state !== 'started' || disabled"
      round
      color="primary"
      :icon="matSkipNext"
      class="q-ml-sm"
      @click="skip"
    />
    <q-btn
      round
      :disable="disabled"
      color="primary"
      :icon="matVolumeUp"
      class="q-ml-sm"
      @click="repeat"
    />
  </div>
</template>

<script setup lang="ts">
import { matVolumeUp, matSkipNext } from '@quasar/extras/material-icons';
import { useAppStore } from 'stores/app-store';

defineProps({
  disabled: Boolean,
});

let store = useAppStore();

function repeat() {
  store.repeatAudio();
}

function skip() {
  store.skip();
}
</script>
