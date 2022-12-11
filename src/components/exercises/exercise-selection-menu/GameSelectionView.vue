<template>
  <div class="full-width flex-1 column items-center">
    <ContinueAsGuestDialog ref="continueAsGuestDialog"/>
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
            class="col-3 column"
            v-for="exercise in [
              'remember-words',
              'remember-numbers',
              'remember-names',
              'remember-names',
              'remember-words-rev',
              'remember-numbers-rev',
              'memory-animals',
              'memory'
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
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContinueAsGuestDialog from 'src/components/shared/ContinueAsGuestDialog.vue';
import { ref, onMounted } from 'vue';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import {useAuthStore} from "stores/auth-store";

const { t } = useI18n();
const router = useRouter();
const continueAsGuestDialog = ref()

const languageExercises = ref([
  'spell-backwards',
  'word-scramble',
  'listen-backwards',
  'find-relative',
]);
const mathExercises = ref([
  'mental-arithmetic',
  'mental-arithmetic-mul',
  'math-marathon',
  'solve-equation',
]);

onMounted(() => {
  if (!useAppStore().playingAsGuest && !useAuthStore().isLoggedIn && !useAuthStore().hasAccount) {
    continueAsGuestDialog.value.showDialog()
  }
})

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
