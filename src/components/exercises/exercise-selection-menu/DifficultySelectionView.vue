<template>
  <div class="full-width flex-1 column items-center">
    <div class="q-py-md column flex-1 items-center content">
      <LoadingIndicator :show="showLoadingIndicator" />
      <div
        class="row-sm column-xs q-col-gutter-lg"
        v-if="!showLoadingIndicator"
      >
        <div
          class="col-4 column flex-1"
          v-for="difficulty in difficulties"
          :key="difficulty"
          @click="selectDifficulty(difficulty)"
        >
          <q-card class="flex-1 cursor-pointer zoom-on-hover text-center">
            <q-card-section
              class="text-bold"
              :data-testid="'card-' + difficulty"
              :class="{
                'bg-easy': difficulty === 'easy',
                'bg-normal': difficulty === 'normal',
                'bg-hard': difficulty === 'hard',
              }"
            >
              {{ t(difficulty) }}
            </q-card-section>
            <q-card-section>
              <StarsRating
                :rating="getStars(difficulty)"
                class="text-h4 q-ml-xs"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="q-mt-md">
        <q-btn color="accent" @click="back">{{ $t('Back') }}</q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StarsRating from 'src/components/shared/StarsRating.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
import { ScoreService } from 'src/shared-services/score.service';
import { mapScoreToRating } from 'src/util/calculate-rating';

const selectedDifficulty = ref('');
const difficulties = ref(['easy', 'normal', 'hard']);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useAppStore();
const showLoadingIndicator = ref(false);

const nameOfTheGame = computed(() => route.params.game as string);

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
  showLoadingIndicator.value = true;
  new ScoreService().fetchPlayerScores();
  showLoadingIndicator.value = false;
});

async function selectDifficulty(difficulty: string) {
  selectedDifficulty.value = difficulty;
  startGame();
}

function startGame() {
  router.push({
    name: route.params.game as string,
    params: {
      game: route.params.game as string,
      difficulty: selectedDifficulty.value,
      language: store.language,
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
