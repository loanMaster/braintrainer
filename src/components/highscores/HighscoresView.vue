<template>
  <div class="gradient flex-1 column">
    <q-toolbar class="bg-accent text-white no-pointer-events non-selectable">
      <q-toolbar-title>🎉 Highscores</q-toolbar-title>
    </q-toolbar>
    <div class="flex-1 relative-position">
      <LoadingIndicator :showing="rows.length === 0" />
      <q-table
        v-if="rows.length > 0"
        class="q-ma-md"
        :grid="$q.screen.xs"
        :rows="rows"
        column-sort-order="da"
        table-header-class="bg-orange-2"
        :columns="columns"
        row-key="name"
        :pagination="{ rowsPerPage: 0 }"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4">
            <q-card>
              <q-card-section class="text-h6 bg-orange-2">
                {{ props.row.nameOfTheGame }}
              </q-card-section>
              <q-separator />
              <q-card-section class="column">
                <div class="row justify-between">
                  <div>Schwierigkeit</div>
                  <div>{{ props.row.difficulty }}</div>
                </div>
                <div class="row justify-between">
                  <div>User</div>
                  <div>{{ props.row.playerName }}</div>
                </div>
                <div class="row justify-between">
                  <div>Bewertung</div>
                  <div>{{ props.row.score }}</div>
                </div>
                <div class="row justify-between">
                  <div>Datum</div>
                  <div>{{ new Date(props.row.date).toDateString() }}</div>
                </div>
                <div class="row justify-between">
                  <div>Deine Punkte</div>
                  <div>{{ props.row.yourScore }}</div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GAMES } from 'src/const/games';
import {GameHighScoreDto, ScoreService} from 'src/shared-services/score.service';
import { ref, onMounted, Ref } from 'vue';
import { useQuasar } from 'quasar';
import {useI18n} from "vue-i18n";
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';


const { t } = useI18n()
const rows: Ref<any[]> = ref([])

onMounted(async () => {
  const highscores = await new ScoreService().fetchHighscores();
  highscores.scores.forEach(s => {
    rows.value.push({
      nameOfTheGame: t(s.nameOfTheGame),
      difficulty: t(s.difficulty),
      score: s.score,
      date: s.date,
      yourScore: s.yourScore,
      playerName: s.playerName,
      isYou: s.isYou,
      sortDiff: ['easy', 'normal', 'hard'].indexOf(s.difficulty)
    })
  })
  rows.value.sort((a,b) => {
    const byName = a.nameOfTheGame.toLowerCase().localeCompare(b.nameOfTheGame.toLowerCase())
    const byDiff = a.sortDiff < b.sortDiff ? -1 : 1
    return byName !== 0 ? byName : byDiff
  })
});

const columns = ref([
  {
    name: 'nameOfTheGame',
    required: true,
    label: 'Übung',
    align: 'left',
    field: 'nameOfTheGame',
    sortable: true
  },
  { name: 'difficulty', align: 'left', label: 'Schwierigkeit', field: 'difficulty', sortable: true },
  { name: 'playerName', label: 'Spieler', field: 'playerName', sortable: true },
  { name: 'score', label: 'Bewertung', field: 'score' },
  { name: 'date', label: 'Datum', field: 'date', format: (val: number) => `${new Date(val).toDateString()}` },
  { name: 'yourScore', label: 'Deine Bewertung', field: 'yourScore', format: (val: number | undefined) => val || '-' },
])

</script>

<style>
  .q-table__bottom {
    display: none
  }
  .gradient {
    background-image: linear-gradient(to bottom right, #FFFFAA55, #AAFFFF55);
  }
</style>
