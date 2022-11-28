<template>
  <div class="full-width text-center q-ma-sm">
    <h4>{{ $t('Select difficulty') }}</h4>
    <div>
      <div
        v-for="difficulty in difficulties"
        class="c-difficulty-selection-buttons"
        :key="difficulty"
      >
        <q-btn
          color="primary"
          class="shadow-5 q-ma-sm"
          rounded
          :label="$t(difficulty)"
          @click="selectDifficulty(difficulty)"
        >
          <StarsRating :rating="getStars(difficulty)" class="c-stars q-ml-xs" />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNameOfTheGame } from 'src/util/game.name.helper';
import StarsRating from 'src/components/shared/StarsRating.vue';
import { NavService } from 'src/router/nav.service';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from 'stores/app-store';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { showEnterUsernameDialog } from 'src/util/show-enter-username-dialog';

const selectedDifficulty = ref('');
const difficulties = ref(['easy', 'normal', 'hard']);

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const nameOfTheGame = computed(() =>
  getNameOfTheGame(route.params.game as string)
);

function getStars(difficulty: string): number {
  return useAppStore().player.ratings[nameOfTheGame.value]?.[difficulty] || 0;
}

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
  new NavService().navigateTo({
    name: 'play',
    nameOfTheGame: route.params.game as string,
    difficulty: selectedDifficulty.value,
  });
}
</script>

<style scoped>
@media screen and (max-width: 992px) and (orientation: landscape) {
  .c-stars {
    font-size: 1rem;
  }
}
@media screen and (max-width: 992px) and (orientation: portrait) {
  .c-stars {
    font-size: 1.25rem;
  }
}
</style>
