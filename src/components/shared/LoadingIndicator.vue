<template>
  <q-inner-loading :showing="showing">
    <q-spinner-gears size="8rem" />
  </q-inner-loading>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
defineProps({ showing: Boolean });
</script>
