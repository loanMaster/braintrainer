<template>
  <div>
    <span v-for="(val) in Array.from(Array(3 - rating).keys())" :key="val" class="c-star-inactive">★</span>
    <span v-for="(val) in Array.from(Array(rating).keys())" :key="val" class="c-star-active">★</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps({ rating: Number })
</script>

<style scoped>
.c-star-active {
  color: yellow;
  text-shadow: 2px 1px black;
}
.c-star-inactive {
  opacity: 0.2;
  color: darkgray;
  text-shadow: 2px 1px black;
}
</style>
