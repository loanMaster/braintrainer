<template>
  <div ref="buttons" class="numpad">
    <div v-for="(label, idx) in Array.from(Array(10).keys())" v-bind:key="idx" :style="{ 'grid-area': 'button' + idx }">
      <button class="btn btn-outline-dark c-number-button" @click="buttonClick(idx, $event)" :disabled="disabled">{{label}}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps({ disabled: Boolean })
const emits = defineEmits(['button-click'])

function buttonClick (idx: number, $event: Event) {
  $event.stopPropagation()
  emits('button-click', idx)
}
</script>

<style scoped>
.numpad {
  display: grid;
  grid-template-areas: "button7 button8 button9"
                         "button4 button5 button6"
                          "button1 button2 button3"
                          "buttonX button0 buttonZ";
  grid-gap: 5px;
}
.numpad button {
  width: 4rem;
}
.btn.c-number-button {
  font-size: 2rem;
}
@media screen and (max-width: 992px) and (orientation: landscape) {
  .btn.c-number-button {
    font-size: 1.25rem;
    padding: 3px;
  }
}
</style>
