<template>
  <div class="full-width flex-1 column items-center">
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
import { ref } from 'vue';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { exercises } from 'src/const/exercises';

const { t } = useI18n();
const router = useRouter();

const languageEx = ref(
  exercises.filter((e) => e.category === 'language').map((e) => e.name)
);
const mathEx = ref(
  exercises.filter((e) => e.category === 'math').map((e) => e.name)
);
const memoryEx = ref(
  exercises.filter((e) => e.category === 'memory').map((e) => e.name)
);
const knowledgeEx = ref(
  exercises.filter((e) => e.category === 'knowledge').map((e) => e.name)
);

function selectExercise(name: string) {
  router.push({
    name: 'select-difficulty',
    params: {
      game: name.toLowerCase(),
      language: useAppStore().language,
    },
  });
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
