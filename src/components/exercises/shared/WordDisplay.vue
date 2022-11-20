<template>
  <div style="height: 3rem" class="user-select-none">
    <span class="g-medium-font">{{ firstPart }}</span>
    <span class="g-medium-font" :style="{ 'color': highlightColor }">{{ highlight }}</span>
    <span class="g-medium-font">{{ lastPart }}</span>
  </div>
  </template>

<script setup lang="ts">
import { defineProps, computed, ref, Ref } from 'vue'

defineProps({
  value: String,
  highlightIndex: Number,
  highlightColor: String
})

const value: Ref<string | undefined> = ref(undefined)
const highlightIndex: Ref<number | undefined> = ref(undefined)

const firstPart = computed(() => {
  if (highlightIndex.value !== undefined && highlightIndex.value >= 0) {
    return value.value?.substr(0, highlightIndex.value).replaceAll('_', '_ ')
  }
  return value
})

const lastPart = computed(() => {
  if (highlightIndex.value !== undefined && highlightIndex.value >= 0) {
    return value.value?.substr(highlightIndex.value + 1).replaceAll('_', '_ ')
  }
  return ''
})

const highlight = computed(() => {
  if (highlightIndex.value !== undefined && highlightIndex.value >= 0) {
    return value.value?.substr(highlightIndex.value, 1).replaceAll('_', '_ ')
  }
  return ''
})
</script>
