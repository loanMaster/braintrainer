<template>
  <div>
    <h1 class="text-center mt-4">🎉 Highscores</h1>
    <q-inner-loading :showing="!highscores">
      <q-spinner-gears size="4em" color="primary"/>
    </q-inner-loading>
    <div v-if="highscores">
      <table class="table table-borderless g-max-width-100">
        <thead>
        <tr>
          <th scope="col">{{ $t('Game') }}</th>
          <th scope="col">{{ $t('Difficulty') }}</th>
          <th scope="col">{{ $t('Player') }}</th>
          <th scope="col">{{ $t('Score') }}</th>
          <th scope="col">{{ $t('Your Score') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="game in games"
          :key="game"
        >
          <td>{{ $t(game.name) }}</td>
          <td>{{ $t(game.difficulty) }}</td>
          <td :class="highscores[game.name][game.difficulty].isYou ? 'my-highlight' : ''">
            {{ highscores[game.name][game.difficulty].playerName }}
          </td>
          <td>{{ highscores[game.name][game.difficulty].score }}</td>
          <td>{{ highscores[game.name][game.difficulty].yourScore || '-' }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GAMES } from 'src/const/games'
import {HighScoresDto, ScoreService} from "src/shared-services/score.service";
import { ref, computed, onMounted, Ref } from 'vue'
import {useQuasar} from "quasar";

let highscores: Ref<HighScoresDto | null> = ref(null)

onMounted(async () => {
  highscores.value = await new ScoreService().fetchHighscores()
})

const games = computed(() => {
  const gamesAndScores = []
  for (const game of GAMES) {
    if (Object.keys(highscores.value as HighScoresDto).indexOf(game) > -1) {
      for (const difficulty of ['easy', 'normal', 'hard']) {
        if (Object.keys((highscores.value as HighScoresDto)[game]).indexOf(difficulty) > -1) {
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
.c-highlight {
  font-weight: bolder;
  color: blue;
}
@media screen and (max-width: 992px) and (orientation: portrait) {
  tr {
    font-size: 0.75rem;
  }
}
</style>
