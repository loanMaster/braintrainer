<template>
  <div v-for="(label, idx) in buttonLabels" v-bind:key="idx" class="c-button-wrapper">
    <button class="g-full-width btn btn-outline-dark g-medium-font" @click="selectLetter(label, $event)" :disabled="disabled">{{label}}</button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, Ref, defineEmits } from 'vue'

const props = defineProps({
  disabled: Boolean,
  numberOfButtons: Number
})
const emits = defineEmits(['letter-selected'])

const buttonLabels: Ref<string[]> = ref([])

function selectLetter (letter: string, event: Event) {
  event.stopPropagation()
  emits('letter-selected', letter)
}

function update (letters: string[]) {
  buttonLabels.value = []
  for (const letter of letters) {
    buttonLabels.value.push(letter)
  }
  while (buttonLabels.value.length < (props.numberOfButtons as number)) {
    const nextRandomLetter = letters[Math.floor(Math.random() * letters.length)]
    if (buttonLabels.value.indexOf(nextRandomLetter) === -1) {
      buttonLabels.value.push(nextRandomLetter)
    }
  }
  buttonLabels.value.sort((a, b) => {
    return letters.indexOf(a) < letters.indexOf(b) ? -1 : 1
  })
}

defineExpose({ update })
</script>

<style scoped>
.c-button-wrapper {
  margin-left: 12px;
  margin-right: 12px;
}
@media screen and (max-width: 992px) and (orientation: landscape) {
  .c-button-wrapper .btn {
    padding: 2px;
    margin-left: 4px;
    margin-right: 4px;
  }
}
@media screen and (max-width: 992px) and (orientation: portrait) {
  .c-button-wrapper .btn {
    padding: 2px;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
