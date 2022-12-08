<template>
  <div class="full-width flex-1 column items-center">
    <div class="q-py-md content q-mx-auto text-center">
      <q-card class="exercise-block">
        <div class="exercise-title">Sprache</div>
        <div class="row-sm column-xs q-col-gutter-lg">
          <div
            class="col-3 column"
            v-for="exercise in languageExercises"
            :key="exercise"
          >
            <q-card
              class="flex-1 cursor-pointer zoom-on-hover"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="words-bg text-bold">
                {{ t(exercise) }}
              </q-card-section>
              <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>
      <q-card class="exercise-block">
        <div class="exercise-title">Rechnen</div>
        <div class="row-sm column-xs q-col-gutter-lg">
          <div
            class="col-3 column"
            v-for="exercise in mathExercises"
            :key="exercise"
          >
            <q-card
              class="flex-1 cursor-pointer zoom-on-hover"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="math-bg text-bold">
                {{ t(exercise) }}
              </q-card-section>
              <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>
      <q-card class="exercise-block">
        <div class="exercise-title">Gedächtnis</div>
        <div class="row-sm column-xs q-col-gutter-lg q-mb-lg">
          <div
            class="col-4 column"
            v-for="exercise in [
              'RememberWords',
              'RememberNumbers',
              'RememberNames',
            ]"
            :key="exercise"
          >
            <q-card
              class="flex-1 cursor-pointer zoom-on-hover"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="memory-bg text-bold">
                {{ t(exercise) }}
              </q-card-section>
              <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
            </q-card>
          </div>
        </div>
        <div class="row-sm column-xs q-col-gutter-lg">
          <div
            class="col-6 column"
            v-for="exercise in ['AudioMemoryAnimals', 'AudioMemory']"
            :key="exercise"
          >
            <q-card
              class="flex-1 cursor-pointer zoom-on-hover"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="memory-bg text-bold">
                {{ t(exercise) }}
              </q-card-section>
              <q-card-section>Lösen Sie Aufgaben im Kopf </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore } from 'stores/app-store';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const { t } = useI18n();
const router = useRouter();

onMounted(() => useAppStore().finishDailyTraining());

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

function selectExercise(game: string) {
  router.push({
    name: 'select-difficulty',
    params: {
      game: game.toLowerCase(),
      language: useAppStore().language,
    },
  });
}
</script>

<style lang="scss" scoped>
@import 'node_modules/quasar/dist/quasar.sass';

.math-bg {
  background-color: $green-2;
}
.words-bg {
  background-color: $blue-2;
}
.memory-bg {
  background-color: $orange-2;
}

.body--dark {
  .math-bg {
    background-color: $brown-10;
  }
  .words-bg {
    background-color: $indigo-10;
  }
  .memory-bg {
    background-color: $pink-10;
  }
}

.exercise-block {
  @extend .q-pa-md;
  @extend .q-mb-lg;
  @extend .full-width;
  background-color: #ffffff00;
}

.exercise-title {
  @extend .text-h4;
  @extend .q-mx-auto;
  @extend .text-center;
  @extend .q-mb-md;
}
</style>
