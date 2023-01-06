<template>
  <div class="flex-1 max-width-sm full-width q-mx-sm q-my-sm">
    <q-dialog v-model="showProgressDiagram">
      <q-card class="full-width">
        <div class="full-width q-pa-sm column no-wrap">
          <div class="test-h5">
            {{ $t(nameOfTheGame + '.title') + ' (' + $t(difficulty) + ')' }}
          </div>
          <ProgressDiagram
            :difficulty="difficulty"
            :nameOfTheGame="nameOfTheGame"
            class="diagram-min-height"
          />
        </div>
      </q-card>
    </q-dialog>

    <LoadingIndicator :showing="showLoadingIndicator" style="z-index: 1" />
    <div
      class="words-table-header"
      v-if="languageScores.length > 0"
      data-testid="words-table"
    >
      <div class="text-h5">{{ t('Language') }}</div>
      <PlayerScoresTable
        @show-progress-diagram="showProgress"
        :scores="languageScores"
      />
    </div>
    <div
      class="math-table-header q-mt-md"
      v-if="mathScores.length > 0"
      data-testid="math-table"
    >
      <div class="text-h5">{{ t('Maths') }}</div>
      <PlayerScoresTable
        @show-progress-diagram="showProgress"
        :scores="mathScores"
      />
    </div>
    <div
      class="knowledge-table-header q-mt-md"
      v-if="knowledgeScores.length > 0"
      data-testid="knowledge-table"
    >
      <div class="text-h5">{{ t('Knowledge') }}</div>
      <PlayerScoresTable
        @show-progress-diagram="showProgress"
        :scores="knowledgeScores"
      />
    </div>

    <div
      class="memory-table-header q-mt-md"
      v-if="memoryScores.length > 0"
      data-testid="memory-table"
    >
      <div class="text-h5">{{ t('Memory exercises') }}</div>
      <PlayerScoresTable
        @show-progress-diagram="showProgress"
        :scores="memoryScores"
      />
    </div>

    <div
      class="memory-table-header q-mt-md"
      v-if="concentrationScores.length > 0"
      data-testid="concentration-table"
    >
      <div class="text-h5">{{ $t('Concentration') }}</div>
      <PlayerScoresTable
        @show-progress-diagram="showProgress"
        :scores="concentrationScores"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PercentileScore,
  ScoreService,
} from 'src/shared-services/score.service';
import { ref, onMounted, Ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import PlayerScoresTable from './PlayerScoresTable.vue';
import ProgressDiagram from 'src/components/shared/ProgressDiagram.vue';
import {
  concentrationExercises,
  knowledgeExercises,
  languageExercises,
  mathExercises,
  memoryExercises,
} from 'src/const/games';

const { t } = useI18n();
const showLoadingIndicator = ref(false);
const percentiles: Ref<PercentileScore[]> = ref([]);
const nameOfTheGame = ref('');
const difficulty = ref('easy');
const showProgressDiagram = ref(false);

onMounted(async () => {
  showLoadingIndicator.value = true;
  percentiles.value = await new ScoreService().fetchPlayerScorePercentiles();
  showLoadingIndicator.value = false;
});

const languageScores = computed(() => {
  return percentiles.value.filter(
    (s) => languageExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const mathScores = computed(() => {
  return percentiles.value.filter(
    (s) => mathExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const knowledgeScores = computed(() => {
  return percentiles.value.filter(
    (s) => knowledgeExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const memoryScores = computed(() => {
  return percentiles.value.filter(
    (s) => memoryExercises.indexOf(s.nameOfTheGame) > -1
  );
});

const concentrationScores = computed(() => {
  return percentiles.value.filter(
    (s) => concentrationExercises.indexOf(s.nameOfTheGame) > -1
  );
});

function showProgress(props: { difficulty: string; game: string }) {
  difficulty.value = props.difficulty;
  nameOfTheGame.value = props.game;
  showProgressDiagram.value = true;
}
</script>

<style scoped lang="scss">
.diagram-min-height {
  min-height: 40vh;
}
</style>
