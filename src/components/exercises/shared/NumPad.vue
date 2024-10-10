<template>
  <div ref="buttons" class="numpad non-selectable">
    <div
      v-for="(label, idx) in [
        ...Array.from(Array(10).keys()),
        'Skip',
        'Repeat',
      ]"
      v-bind:key="label"
      :style="{ 'grid-area': 'button' + label }"
    >
      <q-btn
        round
        push
        :data-testid="'numpad-' + label"
        @click="buttonClick(idx, $event)"
        class="text-h5"
        :disabled="disabled"
        color="primary"
        v-if="label !== 'Skip' && label !== 'Repeat'"
        :label="label"
      />
      <q-btn
        v-if="label === 'Skip'"
        :disabled="disabled"
        round
        color="primary"
        :icon="matSkipNext"
        class="text-h5"
        @click="skip"
      />
      <q-btn
        v-if="label === 'Repeat'"
        round
        :disable="disabled"
        color="primary"
        :icon="matVolumeUp"
        class="text-h5"
        @click="repeat"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { matVolumeUp, matSkipNext } from '@quasar/extras/material-icons';
import { useAppStore } from 'src/stores/app-store';
defineProps({ disabled: Boolean });
const emits = defineEmits(['button-click']);

function buttonClick(idx: number, $event: Event) {
  $event.stopPropagation();
  emits('button-click', idx);
}

let store = useAppStore();

function repeat() {
  store.repeatAudio();
}

function skip() {
  store.skip();
}
</script>

<style scoped>
.numpad {
  display: inline-grid;
  grid-template-areas:
    'button7 button8 button9'
    'button4 button5 button6'
    'button1 button2 button3'
    'buttonSkip button0 buttonRepeat';
  grid-gap: 5px;
}
</style>
