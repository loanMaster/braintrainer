<template>
  <div class="c-wrapper">
    <span>{{ store.exercise.totalStrikeCount }}❌</span>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "stores/app-store";
const store = useAppStore();
</script>

<style scoped>
.c-wrapper {
  display: flex;
  align-items: center;
  font-size: 2.5rem;
  user-select: none;
  color: red;
}
@media screen and (max-width: 992px) {
  .c-wrapper {
    font-size: 1.5rem;
  }
}
</style>
