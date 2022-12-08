<template>
  <div class="flex-1 relative-position column items-center q-ma-lg full-width">
    <div class="max-width-sm full-width column items-center flex-1">
      <ProgressDiagram :difficulty="difficulty" :nameOfTheGame="game" />
      <div class="q-mx-auto text-center">
        <q-btn color="secondary" @click="back()">Zurück</q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ProgressDiagram from 'src/components/shared/ProgressDiagram.vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from 'stores/app-store';

const router = useRouter();
const route = useRoute();

function back() {
  router.push({
    name: 'player-scores',
    params: { language: useAppStore().language },
  });
}

const difficulty = computed(() => route.params.difficulty);
const game = computed(() => route.params.game);
</script>
