<template>
  <q-table
    :grid="$q.screen.xs"
    :rows="rows"
    column-sort-order="da"
    :columns="columns"
    row-key="name"
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
            :icon="matPlayArrow"
            :data-testid="
              'train-' +
              props.row.nameOfTheGameOri +
              '-' +
              props.row.difficultyOri
            "
            class="q-mr-sm"
          />
        </q-td>
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-avatar size="md" v-if="col.name === 'image'">
            <img :src="col.value || '/images/avatars/default_avatar.png'" />
          </q-avatar>
          <span v-if="col.name !== 'image'">{{ col.value }}</span>
        </q-td>
      </q-tr>
    </template>

    <template v-slot:item="props">
      <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
        <q-card class="non-selectable">
          <q-card-section class="text-h6 table-header row justify-between">
            {{ props.row.nameOfTheGame }}
            <q-btn
              size="md"
              color="primary"
              dense
              @click="play(props)"
              :icon="matPlayArrow"
            />
          </q-card-section>
          <q-separator />
          <q-card-section class="column">
            <div class="row justify-between">
              <div>{{ $t('User') }}</div>
              <div>
                <span>{{ props.row.playerName }}</span>
                <q-avatar size="sm" class="q-ml-sm">
                  <img
                    :src="props.row.image || '/images/avatars/avatar_00.jpg'"
                  />
                </q-avatar>
              </div>
            </div>
            <div class="row justify-between">
              <div>{{ $t('Difficulty') }}</div>
              <div>{{ props.row.difficulty }}</div>
            </div>
            <div class="row justify-between">
              <div>{{ $t('Rating') }}</div>
              <div>{{ props.row.score }}</div>
            </div>
            <div class="row justify-between">
              <div>{{ $t('Date') }}</div>
              <div>
                {{
                  new Date(props.row.date).toLocaleDateString(store.language)
                }}
              </div>
            </div>
            <div class="row justify-between">
              <div>{{ $t('Your rating') }}</div>
              <div>{{ props.row.yourScore || '-' }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { matPlayArrow } from '@quasar/extras/material-icons';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { formatScore } from 'src/util/format-number';
import { useAppStore } from 'stores/app-store';
import { HighScoreDto } from 'src/shared-services/score.service';

const props = defineProps({
  scores: Object,
});

const { t } = useI18n();
const router = useRouter();
const store = useAppStore();

const rows = computed(() => {
  if (!props.scores) {
    return [];
  }
  const _rows: any[] = [];
  props.scores.forEach((s: HighScoreDto) => {
    _rows.push({
      nameOfTheGame: t(s.nameOfTheGame + '.title'),
      difficulty: t(s.difficulty),
      nameOfTheGameOri: s.nameOfTheGame,
      difficultyOri: s.difficulty,
      score: s.score,
      date: s.date,
      yourScore: s.yourScore,
      playerName: s.playerName,
      image: s.image,
      isYou: s.isYou,
      sortDiff: ['easy', 'normal', 'hard'].indexOf(s.difficulty),
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
    label: t('Exercise'),
    align: 'left',
    sortable: true,
    field: 'nameOfTheGame',
  },
  {
    name: 'difficulty',
    align: 'left',
    label: t('Difficulty'),
    field: 'difficulty',
  },
  { name: 'playerName', label: t('User'), field: 'playerName', sortable: true },
  {
    name: 'image',
    label: t('Avatar'),
    field: 'image',
    align: 'left',
  },
  {
    name: 'score',
    label: t('Rating'),
    field: 'score',
    sortable: true,
    format: (val: number) => formatScore(val, store.language),
  },
  {
    name: 'date',
    label: t('Date'),
    field: 'date',
    sortable: true,
    format: (val: number) =>
      `${new Date(val).toLocaleDateString(store.language)}`,
  },
  {
    name: 'yourScore',
    label: t('Your rating'),
    field: 'yourScore',
    format: (val: number | undefined) =>
      val === undefined ? '-' : formatScore(val, store.language),
  },
]);

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
