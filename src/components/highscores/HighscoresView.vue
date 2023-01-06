<template>
  <div class="bg-gradient flex-1 column items-center">
    <LoadingIndicator :showing="showLoadingIndicator" style="z-index: 1" />
    <q-toolbar class="bg-secondary text-white no-pointer-events non-selectable">
      <q-toolbar-title
        >🎉 {{ t('High scores (last 30 days)') }}</q-toolbar-title
      >
    </q-toolbar>
    <div class="flex-1 relative-position max-width-sm full-width q-my-sm">
      <div
        class="words-table-header"
        v-if="languageHighscores.length > 0"
        data-testid="words-table"
      >
        <div class="text-h5">{{ $t('Language') }}</div>
        <HighscoresTable :scores="languageHighscores" />
      </div>

      <div
        class="math-table-header q-mt-md"
        v-if="mathHighscores.length > 0"
        data-testid="math-table"
      >
        <div class="text-h5">{{ $t('Maths') }}</div>
        <HighscoresTable :scores="mathHighscores" />
      </div>

      <div
        class="knowledge-table-header q-mt-md"
        v-if="knowledgeHighscores.length > 0"
        data-testid="knowledge-table"
      >
        <div class="text-h5">{{ $t('Knowledge') }}</div>
        <HighscoresTable :scores="knowledgeHighscores" />
      </div>

      <div
        class="memory-table-header q-mt-md"
        v-if="memoryHighscores.length > 0"
        data-testid="memory-table"
      >
        <div class="text-h5">{{ $t('Memory exercises') }}</div>
        <HighscoresTable :scores="memoryHighscores" />
      </div>

      <div
        class="memory-table-header q-mt-md"
        v-if="concentrationHighscores.length > 0"
        data-testid="concentration-table"
      >
        <div class="text-h5">{{ $t('Concentration') }}</div>
        <HighscoresTable :scores="concentrationHighscores" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HighScoreDto, ScoreService } from 'src/shared-services/score.service';
import { ref, onMounted, Ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import HighscoresTable from './HighscoresTable.vue';
import {
  concentrationExercises,
  knowledgeExercises,
  languageExercises,
  mathExercises,
  memoryExercises,
} from 'src/const/games';

const { t } = useI18n();
const showLoadingIndicator = ref(true);
const highscores: Ref<HighScoreDto[]> = ref([]);

onMounted(async () => {
  const dto = await new ScoreService().fetchHighscores();
  highscores.value = dto.scores;
  showLoadingIndicator.value = false;
});

const languageHighscores = computed(() => {
  return highscores.value.filter(
    (s) => languageExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const mathHighscores = computed(() => {
  return highscores.value.filter(
    (s) => mathExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const knowledgeHighscores = computed(() => {
  return highscores.value.filter(
    (s) => knowledgeExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const memoryHighscores = computed(() => {
  return highscores.value.filter(
    (s) => memoryExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const concentrationHighscores = computed(() => {
  return highscores.value.filter(
    (s) => concentrationExercises.indexOf(s.nameOfTheGame) > -1
  );
});
</script>
