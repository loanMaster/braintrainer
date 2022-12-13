<template>
  <div
    class="flex-1 relative-position max-width-sm full-width q-mx-sm q-my-xs-xs q-my-md-lg"
  >
    <q-dialog v-model="showProgressDiagram">
      <q-card class="full-width">
        <div class="full-width q-pa-sm column no-wrap">
          <div class="test-h5">{{ $t(nameOfTheGame + '.title') + ' (' + $t(difficulty) + ')' }}</div>
          <ProgressDiagram :difficulty="difficulty" :nameOfTheGame="nameOfTheGame" class="diagram-min-height"/>
        </div>
      </q-card>
    </q-dialog>
    <LoadingIndicator :showing="showLoadingIndicator" style="z-index: 1" />
    <q-table
      v-if="!showLoadingIndicator"
      :grid="$q.screen.xs"
      :rows="rows"
      column-sort-order="da"
      :columns="columns"
      :pagination="{ rowsPerPage: 0 }"
    >
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th auto-width />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td auto-width>
            <q-btn
              size="md"
              color="primary"
              dense
              @click="play(props)"
              :icon="'play_arrow'"
              class="q-mr-sm"
            />
            <q-btn
              size="md"
              color="primary"
              dense
              @click="showProgress(props)"
              :icon="'assessment'"
              class="q-ml-sm"
            />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props">
            <span v-if="col.name !== 'stars'">{{ col.value }}</span>
            <StarsRating
              class="text-h5"
              :rating="col.value"
              v-if="col.name === 'stars'"
            />
          </q-td>
        </q-tr>
      </template>

      <template v-slot:item="props">
        <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
          <q-card>
            <q-card-section class="text-h6 table-header row justify-between">
              {{ props.row.nameOfTheGame }}
              <div class="row">
                <q-btn
                  size="md"
                  color="primary"
                  dense
                  @click="play(props)"
                  :icon="'play_arrow'"
                  class="q-mr-sm"
                />
                <q-btn
                  size="md"
                  color="primary"
                  dense
                  @click="showProgress(props)"
                  :icon="'assessment'"
                  class="q-ml-sm"
                />
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="column">
              <div class="row justify-between">
                <div>{{ $t('Difficulty') }}</div>
                <div>{{ props.row.difficulty }}</div>
              </div>
              <div class="row justify-between">
                <div>{{ $t('Rating') }}</div>
                <div>{{ props.row.score }}</div>
              </div>
              <div class="row justify-between">
                <div>{{ $t('Stars') }}</div>
                <StarsRating class="text-h5" :rating="props.row.stars" />
              </div>
              <div class="row justify-between">
                <div>{{ $t('Top % of users') }}</div>
                <div>{{ props.row.percentile }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ScoreService } from 'src/shared-services/score.service';
import { ref, onMounted, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import StarsRating from 'src/components/shared/StarsRating.vue';
import ProgressDiagram from 'src/components/shared/ProgressDiagram.vue';
import { useRouter } from 'vue-router';
import { formatScore } from 'src/util/format-number';
import { useAppStore } from 'stores/app-store';
import { mapScoreToRating } from 'src/util/calculate-rating';

const { t } = useI18n();
const rows: Ref<any[]> = ref([]);
const showLoadingIndicator = ref(false);
const router = useRouter();
const store = useAppStore();
const showProgressDiagram = ref(false)
const nameOfTheGame = ref('')
const difficulty = ref('easy')

onMounted(async () => {
  showLoadingIndicator.value = true;
  const percentiles = await new ScoreService().fetchPlayerScorePercentiles();
  showLoadingIndicator.value = false;
  percentiles.forEach((s) => {
    rows.value.push({
      difficultyOri: s.difficulty,
      nameOfTheGameOri: s.nameOfTheGame,
      nameOfTheGame: t(s.nameOfTheGame + '.title'),
      difficulty: t(s.difficulty),
      score: s.score,
      date: s.date,
      stars: mapScoreToRating(s.score),
      percentile: formatScore(s.percentile, store.language),
      sortDiff: ['easy', 'normal', 'hard'].indexOf(s.difficulty),
    });
  });
  rows.value.sort((a, b) => {
    const byName = a.nameOfTheGame
      .toLowerCase()
      .localeCompare(b.nameOfTheGame.toLowerCase());
    const byDiff = a.sortDiff < b.sortDiff ? -1 : 1;
    return byName !== 0 ? byName : byDiff;
  });
});

const columns = ref([
  {
    name: 'nameOfTheGame',
    required: true,
    label: t('Exercise'),
    align: 'left',
    field: 'nameOfTheGame',
    sortable: true,
  },
  {
    name: 'difficulty',
    align: 'left',
    label: t('Difficulty'),
    field: 'difficulty',
    sortable: true,
  },
  {
    name: 'score',
    label: t('Rating'),
    field: 'score',
    sortable: true,
    format: (val: number) => formatScore(val, store.language),
  },
  {
    name: 'stars',
    label: 'Sterne',
    field: 'stars',
    align: 'center',
    sortable: true,
  },
  {
    name: 'percentile',
    label: t('Top % of users'),
    field: 'percentile',
    format: (val: number) => `${formatScore(val, store.language)}%`,
  },
]);

function showProgress(props: any) {
  difficulty.value = props.row.difficultyOri
  nameOfTheGame.value = props.row.nameOfTheGameOri
  showProgressDiagram.value = true
  /*router.push({
    name: 'playerprogress',
    params: {
      game: props.row.nameOfTheGameOri,
      difficulty: props.row.difficultyOri,
      language: useAppStore().language,
    },
  });*/
}

function play(props: any) {
  router.push({
    name: props.row.nameOfTheGameOri,
    params: {
      game: props.row.nameOfTheGameOri,
      difficulty: props.row.difficultyOri,
      language: useAppStore().language,
    },
  });
}
</script>

<style>
.q-table__bottom {
  display: none;
}
.diagram-min-height {
  min-height: 40vh
}
</style>
