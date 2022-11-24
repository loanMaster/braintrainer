<template>
  <div class="c-wrapper no-pointer-events row flex-center text-negative non-selectable">
    <span>{{ store.exercise.totalStrikeCount }}</span><q-icon name="close"/>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "stores/app-store";
const store = useAppStore();
</script>

<style scoped lang="scss">
.c-wrapper {
  font-size: 2.5rem;
}
@media screen and (max-width: $breakpoint-sm) {
  .c-wrapper {
    font-size: 1.5rem;
  }
}
</style>
