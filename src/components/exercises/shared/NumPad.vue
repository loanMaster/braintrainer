<template>
  <div ref="buttons" class="numpad non-selectable">
    <div v-for="(label, idx) in Array.from(Array(10).keys())" v-bind:key="idx" :style="{ 'grid-area': 'button' + idx }">
      <q-btn round push  @click="buttonClick(idx, $event)" class="text-h5" :disabled="disabled" color="primary" :label="label"/>
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
  display: inline-grid;
  grid-template-areas: "button7 button8 button9"
                         "button4 button5 button6"
                          "button1 button2 button3"
                          "buttonX button0 buttonZ";
  grid-gap: 5px;
}
</style>
