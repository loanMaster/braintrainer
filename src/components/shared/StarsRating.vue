<template>
  <div>
    <q-icon name="star" color="amber-3" v-for="val in Array.from(Array(rating).keys())" :key="val"></q-icon>
    <q-icon name="star_border" color="amber-3" v-for="val in Array.from(Array(5 - rating).keys())" :key="val"></q-icon>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({ rating: Number });
</script>
