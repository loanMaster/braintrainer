<template>
  <div class="gradient flex-1 column items-center">
    <q-toolbar class="bg-secondary text-white no-pointer-events non-selectable">
      <q-toolbar-title>🎉 Highscores</q-toolbar-title>
    </q-toolbar>
    <div
      class="flex-1 relative-position max-width-sm full-width q-mx-sm q-my-xs-xs q-my-md-lg"
    >
      <q-table
        v-if="!showLoadingIndicator"
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
                :icon="'play_arrow'"
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
              <q-card-section class="text-h6 bg-orange-2 row justify-between">
                {{ props.row.nameOfTheGame }}
                <q-btn
                  size="md"
                  color="primary"
                  dense
                  @click="play(props)"
                  :icon="'play_arrow'"
                  class="q-mr-sm"
                />
              </q-card-section>
              <q-separator />
              <q-card-section class="column">
                <div class="row justify-between">
                  <div>User</div>
                  <div>
                    <span>{{ props.row.playerName }}</span>
                    <q-avatar size="sm" class="q-ml-sm">
                      <img
                        :src="
                          props.row.image || '/images/avatars/avatar_00.jpg'
                        "
                      />
                    </q-avatar>
                  </div>
                </div>
                <div class="row justify-between">
                  <div>Schwierigkeit</div>
                  <div>{{ props.row.difficulty }}</div>
                </div>
                <div class="row justify-between">
                  <div>Bewertung</div>
                  <div>{{ props.row.score }}</div>
                </div>
                <div class="row justify-between">
                  <div>Datum</div>
                  <div>{{ new Date(props.row.date).toLocaleDateString() }}</div>
                </div>
                <div class="row justify-between">
                  <div>Deine Punkte</div>
                  <div>{{ props.row.yourScore || '-' }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
      <LoadingIndicator :showing="showLoadingIndicator" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ScoreService } from 'src/shared-services/score.service';
import { ref, onMounted, Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { useRouter } from 'vue-router';
import { formatScore } from 'src/util/format-number';
import { useAppStore } from 'stores/app-store';

const { t } = useI18n();
const rows: Ref<any[]> = ref([]);
const router = useRouter();
const store = useAppStore();
const showLoadingIndicator = ref(true);

onMounted(async () => {
  const highscores = await new ScoreService().fetchHighscores();
  highscores.scores.forEach((s) => {
    rows.value.push({
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
  rows.value.sort((a, b) => {
    const byName = a.nameOfTheGame
      .toLowerCase()
      .localeCompare(b.nameOfTheGame.toLowerCase());
    const byDiff = a.sortDiff < b.sortDiff ? -1 : 1;
    return byName !== 0 ? byName : byDiff;
  });
  showLoadingIndicator.value = false;
});

const columns = ref([
  {
    name: 'nameOfTheGame',
    required: true,
    label: 'Übung',
    align: 'left',
    field: 'nameOfTheGame',
    sortable: true,
  },
  {
    name: 'difficulty',
    align: 'left',
    label: 'Schwierigkeit',
    field: 'difficulty',
    sortable: true,
  },
  { name: 'playerName', label: 'Spieler', field: 'playerName', sortable: true },
  {
    name: 'image',
    label: 'Avatar',
    field: 'image',
    align: 'left',
    sortable: true,
  },
  {
    name: 'score',
    label: 'Bewertung',
    field: 'score',
    format: (val: number) => formatScore(val, store.language),
  },
  {
    name: 'date',
    label: 'Datum',
    field: 'date',
    format: (val: number) => `${new Date(val).toDateString()}`,
  },
  {
    name: 'yourScore',
    label: 'Deine Bewertung',
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

<style>
.q-table__bottom {
  display: none;
}
.gradient {
  background-image: linear-gradient(to bottom right, #ffffaa55, #aaffff55);
}
.body--dark .gradient {
  background-image: none;
}
</style>
