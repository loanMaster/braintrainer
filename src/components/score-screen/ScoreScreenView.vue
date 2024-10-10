<template>
  <div
    class="column items-center justify-center non-selectable q-ma-sm-lg q-ma-xs-none"
  >
    <MovingColorsBackground />
    <q-card
      class="max-width-sm q-pa-lg full-width text-center semi-transparent-background"
    >
      <q-card-section>
        <div class="text-h4">{{ $t('Exercise finished') }}</div>
      </q-card-section>
      <q-card-section>
        <div class="text-h3">
          <StarsRating :rating="store.exercise.rating || 0"></StarsRating>
        </div>
      </q-card-section>
      <div class="row-sm column-xs justify-center no-wrap">
        <div class="column col-4 flex-1">
          <div class="text-h5">{{ $t('Evaluation') }}</div>
          <div class="column q-mt-lg">
            <div class="row justify-between">
              <span>{{ $t('Solved') }}</span>
              <span
                >{{ store.exercise.correctAnswers }} /
                {{ store.exercise.totalQuestions }}</span
              >
            </div>
            <div class="row justify-between">
              <span>{{ $t('Mistakes') }}</span>
              <span>{{ store.exercise.totalStrikeCount }}</span>
            </div>
            <div class="row justify-between">
              <span>{{ $t('Time required') }}</span>
              <span
                >{{
                  formatScore(store.exercise.duration / 1000, store.language)
                }}
                s</span
              >
            </div>
          </div>
        </div>
        <q-separator class="mobile-only q-mb-md"></q-separator>
        <div class="column col-4 flex-1" style="min-height: 40vh">
          <div class="text-h5">{{ $t('Rating') }}</div>
          <div ref="knob" class="full-width flex-auto column">
            <q-knob
              ref="knob"
              :model-value="score"
              readonly
              show-value
              instant-feedback
              size="lg"
              :thickness="0.22"
              color="amber-4"
              font-size="2rem"
              track-color="amber-1"
              class="text-amber-4 q-ma-md flex-auto full-width no-pointer-events"
              ><span class="pink-text-shadow">{{
                formatScore(score, store.language)
              }}</span></q-knob
            >
          </div>
        </div>
        <q-separator class="mobile-only q-mb-md"></q-separator>
        <div class="column col-4 flex-1" style="min-height: 40vh">
          <div class="text-h5">{{ $t('Progress') }}</div>
          <ProgressDiagram
            :difficulty="store.exercise.difficulty"
            :nameOfTheGame="store.exercise.nameOfTheGame"
          />
        </div>
      </div>
      <q-card-section>
        <div class="row justify-center">
          <q-btn @click="playAgain">{{ $t('Train again') }}</q-btn>
        </div>
      </q-card-section>
    </q-card>
    <div class="q-mx-auto text-h6 text-center q-mt-xl q-px-sm">
      <div class="">
        {{ $t('Please take the following survey to improve BrainTrainer:') }}
      </div>
      <a
        class="text-color-default"
        style="word-break: break-all"
        target="_blank"
        :href="$t('SURVEY_URL')"
        >{{ $t('SURVEY_URL') }}</a
      >
    </div>
    <div class="q-mx-auto text-h6 text-center q-mt-xl q-px-sm">
      <div class="">
        {{ $t('Have a look at our partner website:') }}
      </div>
      <a
        class="text-color-default"
        style="word-break: break-all"
        target="_blank"
        :href="'https://chessninja.org'"
        >https://chessninja.org</a
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import MovingColorsBackground from 'src/components/backgrounds/MovingColorsBackground.vue';
import StarsRating from 'src/components/shared/StarsRating.vue';
import ProgressDiagram from 'src/components/shared/ProgressDiagram.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { TweenService } from 'src/shared-services/tween.service';
import { ref, onMounted } from 'vue';
import { useAppStore } from 'src/stores/app-store';
import { takeUntil } from 'rxjs/operators';
import { interval, Subject } from 'rxjs';
import { formatScore } from 'src/util/format-number';
import { useRouter } from 'vue-router';
import { SpeechService } from 'src/shared-services/speech.service';
import { randomElement } from 'src/util/array.utils';
import { useI18n } from 'vue-i18n';

const store = useAppStore();
const router = useRouter();
const knob = ref();
const score = ref(0);
const { t } = useI18n();

const texts = {
  positive: ['Well done!', 'Excellent!', 'Very good!'],
  negative: ['That went wrong', 'Practise makes perfect'],
  inBetween: ['Practise makes perfect', 'Keep going!'],
  neutral: ['Made it!'],
};

onMounted(async () => {
  new SoundService().playLevelFinished();
  const text = t(
    'ScoreScreenView.' +
      randomElement([
        ...(store.exercise.score! > 75
          ? texts.positive
          : store.exercise.score! > 40
          ? texts.inBetween
          : texts.negative),
        ...texts.neutral,
      ])
  );

  const stop = new Subject<void>();
  setTimeout(() => {
    interval(20)
      .pipe(takeUntil(stop))
      .subscribe(() => {
        if (score.value < store.exercise.score!) {
          score.value++;
        } else {
          new SpeechService().say(text);
          score.value = store.exercise.score!;
          new TweenService().animateCSS(knob.value, 'pulse', 1);
          stop.next();
          stop.complete();
        }
      });
  }, 250);
});

function playAgain() {
  router.push({
    name: store.exercise.nameOfTheGame.toLowerCase(),
    params: {
      game: store.exercise.nameOfTheGame.toLowerCase(),
      difficulty: store.exercise.difficulty,
      language: useAppStore().language,
    },
  });
}
</script>

<style scoped>
.pink-text-shadow {
  text-shadow: 1px 1px 2px pink;
}

.semi-transparent-background {
  background-color: #ffffff77;
}

.body--dark .semi-transparent-background {
  background-color: #ffffff11;
}
.q-circular-progress__svg {
  height: auto !important; /* safari bug */
  min-height: 100%;
}
</style>
