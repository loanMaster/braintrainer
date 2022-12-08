<template>
  <div class="non-selectable text-h3 text-center">
    <span class="g-medium-font">{{ firstPart }}</span>
    <span
      class="g-medium-font"
      :style="{ color: highlightColor || undefined }"
      >{{ highlight }}</span
    >
    <span class="g-medium-font">{{ lastPart }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  value: String,
  highlightIndex: Number,
  highlightColor: String,
});

const firstPart = computed(() => {
  if (props.highlightIndex !== undefined && props.highlightIndex >= 0) {
    return props.value?.substr(0, props.highlightIndex).replaceAll('_', '_ ');
  }
  return props.value!;
});

const lastPart = computed(() => {
  if (props.highlightIndex !== undefined && props.highlightIndex >= 0) {
    return props.value?.substr(props.highlightIndex + 1).replaceAll('_', '_ ');
  }
  return '';
});

const highlight = computed(() => {
  if (props.highlightIndex !== undefined && props.highlightIndex >= 0) {
    return props.value?.substr(props.highlightIndex, 1).replaceAll('_', '_ ');
  }
  return '';
});
</script>
