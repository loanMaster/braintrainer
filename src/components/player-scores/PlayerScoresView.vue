<template>
  <div class="gradient flex-1 column">
    <q-toolbar class="bg-accent text-white no-pointer-events non-selectable">
      <q-toolbar-title>Your scores</q-toolbar-title>
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
                  <div>Bewertung</div>
                  <div>{{ props.row.score }}</div>
                </div>
                <div class="row justify-between">
                  <div>Sterne</div>
                  <div>{{ props.row.stars }}</div>
                </div>
                <div class="row justify-between">
                  <div>Deine Punkte</div>
                  <div>{{ props.row.percentile }}</div>
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
  import {ScoreService} from 'src/shared-services/score.service';
  import { ref, onMounted, Ref } from 'vue';
  import { useQuasar } from 'quasar';
  import {useI18n} from "vue-i18n";
  import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';

  const { t } = useI18n()
  const rows: Ref<any[]> = ref([])

  onMounted(async () => {
    const percentiles = await new ScoreService().fetchPlayerScores();
    Object.keys(percentiles).filter(k => GAMES.indexOf(k) > -1).forEach(nameOfTheGame => {
      ['easy', 'normal', 'hard'].forEach((difficulty: string) => {
        const dto = percentiles[nameOfTheGame];
        if (dto[difficulty as keyof typeof dto]) {
          rows.value.push({
            nameOfTheGame,
            difficulty,
            ...dto[difficulty as keyof typeof dto]
          })
        }
      })
    })
    rows.value.forEach(r => {
      r.nameOfTheGame = t(r.nameOfTheGame)
      r.difficulty = t(r.difficulty)
      r.stars = Array(3).fill('★').join('') // TODO
    })
    rows.value.sort((a,b) => a.nameOfTheGame.toLowerCase().localeCompare(b.nameOfTheGame.toLowerCase()))
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
    { name: 'score', label: 'Bewertung', field: 'score',  sortable: true },
    { name: 'stars', label: 'Sterne', field: 'stars',  sortable: true },
    { name: 'percentile', label: 'Besser als x%', field: 'percentile', format: (val: number) => `${val}%` }
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
