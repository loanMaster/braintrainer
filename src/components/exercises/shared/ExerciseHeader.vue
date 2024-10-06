<template>
  <q-toolbar class="bg-secondary text-white no-pointer-events non-selectable">
    <q-toolbar-title>
      {{
        nameOfTheGame ? $t(nameOfTheGame + '.title') : $t('Select an exercise')
      }}
      <span class="text-italic" v-if="difficulty">({{ $t(difficulty) }})</span>
    </q-toolbar-title>
  </q-toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const nameOfTheGame = computed(() => route.params?.game as string);

const difficulty = computed(() => {
  return route.params?.difficulty;
});
</script>
