<template>
  <div class="c-full-screen-button user-select-none" @click="toggleFullScreen">&#x26F6;</div>
</template>

<script setup lang="ts">
async function toggleFullScreen () {
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  } else {
    await document.querySelector('#app')!.requestFullscreen()
  }
}
</script>

<style scoped>
.c-full-screen-button {
  padding: 0;
  cursor: pointer;
}
@media screen and (max-width: 992px) {
  .c-full-screen-button {
    font-size: 2rem;
  }
}
</style>
