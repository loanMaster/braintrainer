<template>
  <q-toolbar class="bg-secondary text-white no-pointer-events non-selectable">
    <q-toolbar-title>
      {{ nameOfTheGame ? $t(nameOfTheGame) : 'Select an exercise' }}
      <span class="text-italic" v-if="difficulty">({{ $t(difficulty) }})</span>
    </q-toolbar-title>
  </q-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getNameOfTheGame } from 'src/util/game.name.helper';
import { useRoute } from 'vue-router';

const nameOfTheGame = computed(() => useRoute().params?.game as string);

const difficulty = computed(() => {
  return useRoute().params?.difficulty;
});
</script>
