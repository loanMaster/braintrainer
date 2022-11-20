<template>
  <div class="g-small-font progress d-flex position-relative align-items-center user-select-none" style="height: 2.5rem;">
    <div class="progress-bar" role="progressbar" :style="{ 'width': Math.floor(Math.max(store.exercise.totalQuestions - 1, 0) / store.exercise.currentQuestion * 100) + '%', 'height': '100%' }"></div>
    <div class="g-full-width position-absolute m-auto text-center">
      {{ Math.max(store.exercise.currentQuestion - 1, 0) }} / {{ store.exercise.totalQuestions }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "stores/app-store";
const store = useAppStore();
</script>
