<template>
  <div
    class="column items-center justify-center bg-primary q-ma-md non-selectable"
  >
    <div
      class="bg-white shadow-5 rounded-borders text-center q-ma-lg q-pa-lg overflow-hidden"
      style="width: 80%"
    >
      <div class="text-h4 q-mb-sd">{{ $t('Exercise finished') }}</div>
      <div class="text-h4 q-mb-lg">
        <StarsRating :rating="3"></StarsRating>
      </div>
      <div class="row justify-center no-wrap q-mx-lg" style="min-height: 40vh">
        <div class="column col-4 flex-1">
          <div class="text-h5">Auswertung</div>
          <div class="column q-mt-lg">
            <div class="row justify-between">
              <span>Gelöst</span>
              <span
                >{{ store.exercise.correctAnswers }} /
                {{ store.exercise.totalQuestions }}</span
              >
            </div>
            <div class="row justify-between">
              <span>Fehler</span>
              <span>{{ store.exercise.totalStrikeCount }}</span>
            </div>
            <div class="row justify-between">
              <span>Benötigte Zeit</span>
              <span>{{ store.exercise.duration }} Sekunden</span>
            </div>
          </div>
          <div class="q-mt-sm">
            <div class="text-left">
              <div v-if="updateScoreResponse" class="q-mb-sm">
                Besser als {{ percentile }}% der Spieler
              </div>
              <div
                class="text-center animated text-h6 animate bounceIn"
                style="--animate-duration: 2s"
                v-if="updateScoreResponse?.isNewHighScore"
              >
                🎉 Neuer highscore 🎉
              </div>
            </div>
          </div>
        </div>
        <div class="column col-4 flex-1">
          <div class="text-h5">Bewertung</div>
          <div ref="knob" class="full-width flex-auto column">
            <q-knob
              ref="knob"
              :model-value="score"
              show-value
              readonly
              instant-feedback
              size="lg"
              :thickness="0.22"
              color="lime"
              font-size="2rem"
              track-color="lime-3"
              class="text-lime q-ma-md flex-auto full-width no-pointer-events"
            />
          </div>
        </div>
        <div class="column col-4 flex-1">
          <div class="text-h5">Fortschritt</div>
          <ProgressDiagram :difficulty="difficulty" :nameOfTheGame="nameOfTheGame"/>
        </div>
      </div>
      <div class="row justify-center">
        <q-btn
          v-if="dailyTrainingActive && hasNextDailyExercise()"
          @click="continueDailyTraining"
          >{{ $t('Continue daily training') }}</q-btn
        >
        <q-btn @click="playAgain">{{ $t('Play again') }}</q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ScoreService,
  UpdateScoreResponse,
} from 'src/shared-services/score.service';
import StarsRating from 'src/components/shared/StarsRating.vue'
import ProgressDiagram from 'src/components/shared/ProgressDiagram.vue'
import { SoundService } from 'src/shared-services/sound.service';
import { DailyTrainingService } from 'src/shared-services/daily-training.service';
import { TweenService } from 'src/shared-services/tween.service';
import { NavService } from 'src/router/nav.service';
import { ref, computed, Ref, onMounted, onBeforeMount } from 'vue';
import { newExercise, useAppStore } from 'src/stores/app-store';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { takeUntil } from 'rxjs/operators';
import { interval, Subject } from 'rxjs';

const store = useAppStore();
const $q = useQuasar();
const { t } = useI18n();
const knob = ref();
const score = ref(0);
const updateScoreResponse: Ref<UpdateScoreResponse | null> = ref(null);

const percentile = computed(() =>
  updateScoreResponse.value
    ? Math.floor(updateScoreResponse.value.percentile * 100)
    : 0
);

onBeforeMount(() => {
  // for debugging
  store.$patch((store) => {
    store.exercise = newExercise('rememberNumbers', 'normal', 10);
    store.exercise.rating = 4;
    store.exercise.score = 50;
  });

  if (dailyTrainingActive.value && !hasNextDailyExercise()) {
    $q.dialog({
      title: '🎉 ' + t('Daily training finished'),
    });
    store.finishDailyTraining(); // show modal
  }
});

onMounted(async () => {
  if (store.exercise.fail) {
    new SoundService().playFail();
  } else {
    new SoundService().playLevelFinished();
  }

  if (store.player.name !== 'tester007') {
    updateScoreResponse.value = await new ScoreService().updateScore({
      score: store.exercise.score!,
      nameOfTheGame: store.exercise.nameOfTheGame,
      difficulty: store.exercise.difficulty,
      name: store.player.name,
      id: store.player.id,
    });
    store.updatePlayerScores(updateScoreResponse.value.percentile)
  } else {
    updateScoreResponse.value = {
      percentile: 3,
      isNewHighScore: false,
    };
  }
  const stop = new Subject<void>();
  setTimeout(() => {
    interval(20)
      .pipe(takeUntil(stop))
      .subscribe(() => {
        if (score.value < store.exercise.score!) {
          score.value++;
        } else {
          new TweenService().animateCSS(knob.value, 'pulse', 1);
          stop.next();
          stop.complete();
        }
      });
  }, 250);
});

function playAgain() {
  new NavService().navigateTo({
    name: 'play',
    nameOfTheGame: store.exercise.nameOfTheGame.toLowerCase(),
    difficulty: store.exercise.difficulty,
  });
}

const dailyTrainingActive = computed(() => store.dailyTraining.active);

function hasNextDailyExercise() {
  return new DailyTrainingService().hasNext();
}

function continueDailyTraining() {
  const { nameOfTheGame, difficulty } =
    new DailyTrainingService().getNextExercise();
  new NavService().navigateTo({
    name: 'play',
    nameOfTheGame: nameOfTheGame.toLowerCase(),
    difficulty,
  });
}

const nameOfTheGame = computed(() => store.exercise.nameOfTheGame)
const difficulty = computed(() => store.exercise.difficulty)

</script>
