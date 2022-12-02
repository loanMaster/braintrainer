<template>
  <div class="flex-auto column justify-center items-center q-ma-lg">
    <q-card class="exercise-block">
      <div class="exercise-title">Sprache</div>
      <div class="row q-col-gutter-lg">
        <div
          class="col-3 column"
          v-for="exercise in languageExercises"
          :key="exercise"
        >
          <q-card class="flex-1 cursor-pointer">
            <q-card-section class="bg-blue-2 text-bold">
              {{ t(exercise) }}
            </q-card-section>
            <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>
    <q-card class="exercise-block">
      <div class="exercise-title">Rechnen</div>
      <div class="row q-col-gutter-lg">
        <div
          class="col-3 column"
          v-for="exercise in mathExercises"
          :key="exercise"
        >
          <q-card class="flex-1 cursor-pointer">
            <q-card-section class="bg-green-2 text-bold">
              {{ t(exercise) }}
            </q-card-section>
            <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>
    <q-card class="exercise-block">
      <div class="exercise-title">Gedächtnis</div>
      <div class="row q-col-gutter-lg q-mb-lg">
        <div
          class="col-4 column"
          v-for="exercise in [
            'RememberWords',
            'RememberNumbers',
            'RememberNames',
          ]"
          :key="exercise"
        >
          <q-card class="flex-1 cursor-pointer">
            <q-card-section class="bg-orange-2 text-bold">
              {{ t(exercise) }}
            </q-card-section>
            <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="row q-col-gutter-lg">
        <div
          class="col-6 column"
          v-for="exercise in ['AudioMemoryAnimals', 'AudioMemory']"
          :key="exercise"
        >
          <q-card class="flex-1 cursor-pointer">
            <q-card-section class="bg-orange-2 text-bold">
              {{ t(exercise) }}
            </q-card-section>
            <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from 'stores/app-store';
import { GAMES } from 'src/const/games';
import { NavService } from 'src/router/nav.service';
import { DailyTrainingService } from 'src/shared-services/daily-training.service';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { showEnterUsernameDialog } from 'src/util/show-enter-username-dialog';

const showEnterNameModal = ref(false);
const $q = useQuasar();
const { t } = useI18n();

onMounted(() => useAppStore().finishDailyTraining());

const games = ref(GAMES);
const hovered = ref(false);

const languageExercises = ref([
  'SpellBackwards',
  'WordScramble',
  'ListenBackwards',
  'FindRelative',
]);
const mathExercises = ref([
  'MentalArithmetic',
  'MentalArithmeticMulDiv',
  'MathMarathon',
  'SolveEquation',
]);

function selectGame(game: string) {
  new NavService().navigateTo({
    name: 'select-difficulty',
    nameOfTheGame: game.toLowerCase(),
  });
}

function getMedals(game: string): number {
  let medals = 0;
  for (const diff of ['easy', 'normal', 'hard']) {
    if (useAppStore().player.ratings[game]?.[diff] === 3) {
      medals++;
    }
  }
  return medals;
}

function startDailyTrainingNow() {
  useAppStore().startDailyTraining();
  const { nameOfTheGame, difficulty } =
    new DailyTrainingService().getNextExercise();
  new NavService().navigateTo({
    name: 'play',
    nameOfTheGame: nameOfTheGame.toLowerCase(),
    difficulty,
  });
}

async function startDailyTraining() {
  if (useAppStore().player.name === '') {
    const name = await showEnterUsernameDialog($q, t);
    if (name) {
      useAppStore().addUser(name);
      startDailyTrainingNow();
    }
  } else {
    startDailyTrainingNow();
  }
}

function onNameEntered(name: string) {
  if (name) {
    useAppStore().setName(name);
    showEnterNameModal.value = false;
    startDailyTraining();
  }
}
</script>

<style lang="scss" scoped>
@import 'node_modules/quasar/dist/quasar.sass';

.exercise-block {
  @extend .q-pa-md;
  @extend .q-mb-lg;
  @extend .full-width;
}

.exercise-title {
  @extend .text-h4;
  @extend .q-mx-auto;
  @extend .text-center;
  @extend .q-mb-md;
}
</style>
