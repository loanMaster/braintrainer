<template>
  <div class="full-width flex-1 column items-center">
    <div class="q-py-md column flex-1 items-center content">
      <LoadingIndicator :show="showLoadingIndicator" />
      <div
        class="row-sm column-xs q-col-gutter-lg"
        v-if="!showLoadingIndicator"
      >
        <div
          class="col-4 column"
          v-for="difficulty in difficulties"
          :key="difficulty"
          @click="selectDifficulty(difficulty)"
        >
          <q-card class="flex-1 cursor-pointer zoom-on-hover text-center">
            <q-card-section
              class="text-bold"
              :class="{
                'bg-easy': difficulty === 'easy',
                'bg-normal': difficulty === 'normal',
                'bg-hard': difficulty === 'hard',
              }"
            >
              {{ t(difficulty) }}
            </q-card-section>
            <q-card-section>
              Lösen Sie Aufgaben im Kopf
              <StarsRating
                :rating="getStars(difficulty)"
                class="text-h4 q-ml-xs"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="q-mt-md">
        <q-btn color="accent" @click="back">Zurück</q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNameOfTheGame } from 'src/util/game.name.helper';
import StarsRating from 'src/components/shared/StarsRating.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from 'stores/app-store';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { showEnterUsernameDialog } from 'src/util/show-enter-username-dialog';
import { ScoreService } from 'src/shared-services/score.service';
import { mapScoreToRating } from 'src/util/calculate-rating';

const selectedDifficulty = ref('');
const difficulties = ref(['easy', 'normal', 'hard']);

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useAppStore();
const showLoadingIndicator = ref(false);

const nameOfTheGame = computed(() =>
  getNameOfTheGame(route.params.game as string)
);

function getStars(difficulty: string): number {
  if (store.playerScores) {
    const matching = store.playerScores!.scores.find(
      (p) =>
        p.nameOfTheGame === nameOfTheGame.value && difficulty === p.difficulty
    );
    return matching ? mapScoreToRating(matching.score) : 0;
  } else {
    return 0;
  }
}

onMounted(() => {
  if (store.currentPlayerId) {
    showLoadingIndicator.value = true;
    new ScoreService().fetchPlayerScores();
    showLoadingIndicator.value = false;
  }
});

async function selectDifficulty(difficulty: string) {
  selectedDifficulty.value = difficulty;
  if (useAppStore().player.name === '') {
    const name = await showEnterUsernameDialog($q, t);
    if (name) {
      useAppStore().setName(name);
      startGame();
    }
  } else {
    startGame();
  }
}

function startGame() {
  router.push({
    name: route.params.game as string,
    params: {
      game: route.params.game as string,
      difficulty: selectedDifficulty.value,
    },
  });
}

function back() {
  router.push({
    name: 'select-exercise',
    params: { language: useAppStore().language },
  });
}
</script>

<style scoped lang="scss">
.bg-easy {
  background-color: $amber-1;
}
.bg-normal {
  background-color: $amber-2;
}
.bg-hard {
  background-color: $amber-3;
}

.body--dark {
  .bg-easy {
    background-color: $blue-grey-6;
  }
  .bg-normal {
    background-color: $blue-grey-8;
  }
  .bg-hard {
    background-color: $blue-grey-9;
  }
}
</style>
