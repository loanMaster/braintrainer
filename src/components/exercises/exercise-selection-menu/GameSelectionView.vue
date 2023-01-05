<template>
  <div class="full-width flex-1 column items-center">
    <ContinueAsGuestDialog ref="continueAsGuestDialog" />
    <div class="q-py-md content q-mx-auto text-center">
      <q-card class="exercise-block">
        <div class="exercise-title">{{ $t('Language') }}</div>
        <div class="row-sm column-xs q-col-gutter-lg">
          <div
            class="col-3 column"
            v-for="exercise in languageEx"
            :key="exercise"
          >
            <q-card
              class="flex-1 cursor-pointer zoom-on-hover"
              :data-testid="'card-' + exercise"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="words-bg text-bold">
                {{ t(exercise + '.title') }}
              </q-card-section>
              <q-card-section>{{
                t(exercise + '.description')
              }}</q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>
      <q-card class="exercise-block">
        <div class="exercise-title">{{ $t('Maths') }}</div>
        <div class="row-sm column-xs q-col-gutter-lg">
          <div class="col-3 column" v-for="exercise in mathEx" :key="exercise">
            <q-card
              :data-testid="'card-' + exercise"
              class="flex-1 cursor-pointer zoom-on-hover"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="math-bg text-bold">
                {{ t(exercise + '.title') }}
              </q-card-section>
              <q-card-section>{{
                t(exercise + '.description')
              }}</q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>
      <q-card class="exercise-block">
        <div class="exercise-title">{{ $t('Knowledge') }}</div>
        <div class="row-sm column-xs q-col-gutter-lg justify-center">
          <div
            class="col-3 column"
            v-for="exercise in knowledgeEx"
            :key="exercise"
          >
            <q-card
              :data-testid="'card-' + exercise"
              class="flex-1 cursor-pointer zoom-on-hover"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="knowledge-bg text-bold">
                {{ t(exercise + '.title') }}
              </q-card-section>
              <q-card-section>{{
                t(exercise + '.description')
              }}</q-card-section>
            </q-card>
          </div>
        </div>
      </q-card>
      <q-card class="exercise-block">
        <div class="exercise-title">{{ $t('Memory exercises') }}</div>
        <div class="row-sm column-xs q-col-gutter-lg q-mb-lg">
          <div
            class="col-3 column"
            v-for="exercise in memoryEx"
            :key="exercise"
          >
            <q-card
              :data-testid="'card-' + exercise"
              class="flex-1 cursor-pointer zoom-on-hover"
              @click="selectExercise(exercise)"
            >
              <q-card-section class="memory-bg text-bold">
                {{ t(exercise + '.title') }}
              </q-card-section>
              <q-card-section>{{
                t(exercise + '.description')
              }}</q-card-section>
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
import { useAuthStore } from 'stores/auth-store';
import {
  knowledgeExercises,
  languageExercises,
  mathExercises,
  memoryExercises,
} from 'src/const/games';

const { t } = useI18n();
const router = useRouter();
const continueAsGuestDialog = ref();

const languageEx = ref(languageExercises);
const mathEx = ref(mathExercises);
const memoryEx = ref(memoryExercises);
const knowledgeEx = ref(knowledgeExercises);

onMounted(() => {
  if (
    !useAppStore().playingAsGuest &&
    !useAuthStore().isLoggedIn &&
    !useAuthStore().hasAccount
  ) {
    continueAsGuestDialog.value.showDialog();
  }
});

function selectExercise(game: string) {
  if (game === 'countries-and-capitals') {
    router.push({
      name: 'countries-and-capitals',
      params: {
        game: game.toLowerCase(),
        difficulty: 'normal',
        language: useAppStore().language,
      },
    });
  } else {
    router.push({
      name: 'select-difficulty',
      params: {
        game: game.toLowerCase(),
        language: useAppStore().language,
      },
    });
  }
}
</script>

<style lang="scss" scoped>
@import 'node_modules/quasar/dist/quasar.sass';
@import '../../../css/app';

.math-bg {
  background-color: $math-bg-color;
}
.knowledge-bg {
  background-color: $knowledge-bg-color;
}
.words-bg {
  background-color: $words-bg-color;
}
.memory-bg {
  background-color: $memory-bg-color;
}

.body--dark {
  .math-bg {
    background-color: $math-bg-color-dark;
  }
  .knowledge-bg {
    background-color: $knowledge-bg-color-dark;
  }
  .words-bg {
    background-color: $words-bg-color-dark;
  }
  .memory-bg {
    background-color: $memory-bg-color-dark;
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
