<template>
  <div
    class="c-speech-bubble text-h5 transition-duration-md non-selectable q-pa-sm"
    :style="{ opacity: show ? '1' : '0' }"
  >
    <div
      :style="{ color: transparentText ? 'transparent' : 'black' }"
      class="transition-duration-sm"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup type="ts">
import { defineProps } from 'vue'
defineProps({
  show: Boolean,
  text: String,
  transparentText: Boolean
})
</script>

<style scoped>
.c-speech-bubble {
  border: 4px black solid;
  border-radius: 20px;
  display: flex;
  min-width: 4rem;
  align-items: center;
  justify-content: center;
  background-color: whitesmoke;
}
</style>
