<template>
  <div class="row q-gutter-sm justify-center">
    <div v-for="(label, idx) in buttonLabels" v-bind:key="idx">
      <q-btn
        color="primary"
        class="text-h5"
        @click="selectLetter(label, $event)"
        :disable="disabled"
        >{{ label }}</q-btn
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, Ref, defineEmits } from 'vue';
import { useAppStore } from 'stores/app-store';
import {randomElement} from "src/util/array.utils";

const props = defineProps({
  disabled: Boolean,
  numberOfButtons: Number,
});
const emits = defineEmits(['letter-selected']);

const buttonLabels: Ref<string[]> = ref([]);

function selectLetter(letter: string, event: Event) {
  event.stopPropagation();
  emits('letter-selected', letter);
}

function showAtLeast(mandatoryLetters: string[]) {
  const allLetters = useAppStore().letters;
  buttonLabels.value = [];
  for (const letter of mandatoryLetters) {
    buttonLabels.value.push(letter);
  }
  while (buttonLabels.value.length < props.numberOfButtons!) {
    const nextRandomLetter = randomElement(allLetters)
    if (buttonLabels.value.indexOf(nextRandomLetter) === -1) {
      buttonLabels.value.push(nextRandomLetter);
    }
  }
  buttonLabels.value.sort((a, b) => {
    return allLetters.indexOf(a) < allLetters.indexOf(b) ? -1 : 1;
  });
}

defineExpose({ showAtLeast });
</script>
