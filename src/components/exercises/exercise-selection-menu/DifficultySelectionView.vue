<template>
  <div class="flex-auto column justify-center items-center q-pa-md full-width text-center">
    <h4>{{ $t('Select difficulty') }}</h4>
    <div class="row q-col-gutter-lg">
      <div
        class="col-4 column"
        v-for="difficulty in difficulties"
        :key="difficulty"
        @click="selectDifficulty(difficulty)"
      >
        <q-card class="flex-1 cursor-pointer zoom-on-hover">
          <q-card-section class="text-bold"
            :class="{ 'bg-amber-1': difficulty === 'easy', 'bg-amber-2': difficulty === 'normal', 'bg-amber-3': difficulty === 'hard' }">
            {{ t(difficulty) }}
          </q-card-section>
          <q-card-section>
            Lösen Sie Aufgaben im Kopf
            <StarsRating :rating="getStars(difficulty)" class="text-h4 q-ml-xs" />
          </q-card-section>
        </q-card>
      </div>
      <div class="full-width q-mx-auto">
        <q-btn color="secondary" @click="back">Zurück</q-btn>
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
  return useAppStore().player.ratings[nameOfTheGame.value as string]?.[difficulty] || 0;
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

function back() {
    new NavService().navigateTo({
      name: 'play'
    });
}
</script>
