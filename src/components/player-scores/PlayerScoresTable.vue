<template>
  <q-table
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
            :data-testid="
              'train-' +
              props.row.nameOfTheGameOri +
              '-' +
              props.row.difficultyOri
            "
            @click="play(props)"
            :icon="matPlayArrow"
            class="q-mr-sm"
          />
          <q-btn
            size="md"
            color="primary"
            dense
            :data-testid="
              'showProgress-' +
              props.row.nameOfTheGameOri +
              '-' +
              props.row.difficultyOri
            "
            @click="showProgress(props)"
            :icon="matAssessment"
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
                :icon="matPlayArrow"
                class="q-mr-sm"
              />
              <q-btn
                size="md"
                color="primary"
                dense
                @click="showProgress(props)"
                :icon="matAssessment"
                class="q-ml-sm"
              />
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="column" style="margin-top: -12px">
            <div class="row justify-center">
              <StarsRating class="text-h5" :rating="props.row.stars" />
            </div>
            <div class="row justify-between">
              <div>{{ $t('Difficulty') }}</div>
              <div>{{ props.row.difficulty }}</div>
            </div>
            <div class="row justify-between">
              <div>{{ $t('Rating') }}</div>
              <div>{{ props.row.score }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import StarsRating from 'src/components/shared/StarsRating.vue';
import { useRouter } from 'vue-router';
import { formatScore } from 'src/util/format-number';
import { useAppStore } from 'stores/app-store';
import { mapScoreToRating } from 'src/util/calculate-rating';
import { matPlayArrow, matAssessment } from '@quasar/extras/material-icons';

const { t } = useI18n();
const router = useRouter();
const store = useAppStore();

const props = defineProps({
  scores: Array,
});

const emits = defineEmits(['show-progress-diagram']);

const rows = computed(() => {
  const _rows: any[] = [];
  props.scores!.forEach((s: any) => {
    _rows.push({
      difficultyOri: s.difficulty,
      nameOfTheGameOri: s.nameOfTheGame,
      nameOfTheGame: t(s.nameOfTheGame + '.title'),
      difficulty: t(s.difficulty),
      score: s.score,
      date: s.date,
      stars: mapScoreToRating(s.score),
      sortDiff: ['normal', 'hard', 'veryhard'].indexOf(s.difficulty),
    });
  });
  _rows.sort((a, b) => {
    const byName = a.nameOfTheGame
      .toLowerCase()
      .localeCompare(b.nameOfTheGame.toLowerCase());
    const byDiff = a.sortDiff < b.sortDiff ? -1 : 1;
    return byName !== 0 ? byName : byDiff;
  });
  return _rows;
});

const columns = ref([
  {
    name: 'nameOfTheGame',
    required: true,
    sortable: true,
    label: t('Exercise'),
    align: 'left',
    field: 'nameOfTheGame',
  },
  {
    name: 'difficulty',
    align: 'left',
    label: t('Difficulty'),
    field: 'difficulty',
  },
  {
    name: 'score',
    sortable: true,
    label: t('Rating'),
    field: 'score',
    format: (val: number) => formatScore(val, store.language),
  },
  {
    name: 'stars',
    sortable: true,
    label: t('Stars'),
    field: 'stars',
    align: 'center',
  },
]);

function showProgress(props: any) {
  emits('show-progress-diagram', {
    difficulty: props.row.difficultyOri,
    game: props.row.nameOfTheGameOri,
  });
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
