<template>
  <h1 class="text-center mt-4">{{ $t('Your Scores') }}</h1>
  <q-inner-loading :showing="!playerScores">
    <q-spinner-gears size="4em" color="primary"/>
  </q-inner-loading>
  <div v-if="playerScores">
    <table class="table table-borderless">
      <thead>
      <tr>
        <th scope="col">{{ $t('Game') }}</th>
        <th scope="col">{{ $t('Difficulty') }}</th>
        <th scope="col">{{ $t('Score') }}</th>
        <th scope="col">{{ $t('Better than') }}</th>
        <th scope="col">{{ $t('Rating') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr
        v-for="game in games"
        :key="game"
      >
        <td>{{ $t(game.name) }}</td>
        <td>{{ $t(game.difficulty) }}</td>
        <td>
          {{ scores[game.name][game.difficulty] }}
        </td>
        <td>{{ Math.floor(percentiles[game.name][game.difficulty] * 100) }}%</td>
        <td>
          <StartRating :rating="getRating(game.name, game.difficulty)"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {PlayerPercentiles, Scores, ScoreService} from 'src/shared-services/score.service'
import { GAMES } from 'src/const/games'
import StartRating from 'src/components/shared/StarsRating.vue'
import { ref, Ref, onMounted, computed } from 'vue'
import {useAppStore} from "stores/app-store";
import {useQuasar} from "quasar";

const playerScores: Ref<PlayerPercentiles | null> = ref(null)
const $q = useQuasar()

onMounted(async () => {
  playerScores.value = await new ScoreService().fetchPlayerScores()
})

const scores = computed(() => {
  return (playerScores.value as PlayerPercentiles).scores
})

const percentiles = computed(() => {
  return (playerScores.value as PlayerPercentiles).percentiles
})

function getRating (nameOfTheGame: string, difficulty: string): number {
  return useAppStore().player.ratings[nameOfTheGame] && useAppStore().player.ratings[nameOfTheGame][difficulty]
    ? useAppStore().player.ratings[nameOfTheGame][difficulty]
    : 0
}

const games = computed(() => {
  const gamesAndScores = []
  for (const game of GAMES) {
    if (Object.keys(scores).indexOf(game) > -1) {
      for (const difficulty of ['easy', 'normal', 'hard']) {
        if (Object.keys((playerScores.value as PlayerPercentiles).scores[game]).indexOf(difficulty) > -1) {
          gamesAndScores.push({
            name: game,
            difficulty
          })
        }
      }
    }
  }
  return gamesAndScores
})
</script>

<style scoped>
@media screen and (max-width: 992px) and (orientation: portrait) {
  tr {
    font-size: 0.75rem;
  }
}
</style>
