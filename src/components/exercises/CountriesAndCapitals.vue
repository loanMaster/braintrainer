<template>
  <div class="column items-center flex-1 justify-around">
    <div ref="coreExercise" class="column flex-1 justify-around">
      <InlineSvg
        ref="worldMap"
        class="flex-1"
        style="max-width: 100%; width: 100vw"
        src="/images/world-map.svg"
        fill="black"
      ></InlineSvg>
      <div
        ref="buttons"
        class="row q-gutter-sm justify-center"
        data-testid="exercise-buttons"
      >
        <div v-for="(label, idx) in buttonLabels" v-bind:key="idx" class="row">
          <q-btn
            color="primary"
            @click="selectWord(idx, $event)"
            :disabled="inputDisabled"
            :data-test="
              isDev && isCorrectButton(idx)
                ? 'correct-button'
                : 'incorrect-button'
            "
            class="transition-duration-md"
            >{{ label }}</q-btn
          >
        </div>
      </div>
      <LoadingIndicator :showing="showLoadingIndicator" />
      <SolutionBanner
        :show="revealed"
        :solution="solution"
        @confirmed="onSolutionConfirmed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import SpeechBubble from 'src/components/exercises/shared/SpeechBubble.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import InlineSvg from 'vue-inline-svg';
import {
  CountryAndCapital,
  GeographyService,
} from './service/countries.service';
import { preloadAudio } from 'src/util/preload-assets';

const {
  soundService,
  revealed,
  route,
  store,
  isDev,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
});

const { t } = useI18n();
let permutation: Ref<number[]> = ref([]);
let task: CountryAndCapital[] = [];
let buttonLabels: Ref<string[]> = ref([]);
const buttons = ref();
const worldMap = ref();
const coreExercise = ref();
let showLoadingIndicator = ref(false);
const router = useRouter();

onBeforeMount(() => {
  const numberOfQuestion =
    difficulty.value === 'easy' ? 5 : difficulty.value === 'normal' ? 7 : 10;
  exerciseUtils.createExercise(numberOfQuestion);
});

const difficulty = computed(() => route.params.difficulty);

onMounted(async () => {
  new TweenService().setDisplay(coreExercise.value, 'none');
});

async function start() {
  showLoadingIndicator.value = true;
  task = new GeographyService().getCountriesAndGeographies(store.language, 5);
  await preloadAudio(
    task.map((c) => `/sounds/countries/${store.language}_${c.country}.mp3`)
  );
  showLoadingIndicator.value = false;
  store.beginExercise();

  permutation.value = shuffle(
    Array.from(Array(store.exercise.totalQuestions).keys())
  );
  for (let idx = 0; idx < store.exercise.totalQuestions; idx++) {
    buttonLabels.value[idx] = task[permutation.value[idx]].capital;
  }
  new TweenService().setDisplay(coreExercise.value, 'flex');
  await new TweenService().fadeIn(coreExercise.value);
  nextQuestion();
}

async function nextQuestion() {
  if (
    !(await exerciseUtils.prepareNewQuestion({
      inputDisabled,
      soundService,
      revealed,
      router,
    }))
  ) {
    return;
  }
  inputDisabled.value = false;

  console.log(task);
  console.log('country is ' + task[store.exercise.currentQuestion - 1].country);
  highlightCountry(task[store.exercise.currentQuestion - 1].countryEn);
  await playAudio(false);
}

async function playAudio(measureTime = false) {
  await soundService.playAll(
    [
      {
        src: `/sounds/countries/${store.language}_${
          task[store.exercise.currentQuestion - 1].country
        }.mp3`,
      },
    ],
    0,
    measureTime
  );
}

function highlightCountry(countryName: string) {
  const circle = worldMap.value.$el.querySelector('circle.highlight');
  circle.setAttribute('stroke', 'none');
  const highlighted = [...worldMap.value.$el.querySelectorAll('[fill="red"]')];
  highlighted.forEach((h: HTMLElement) => h.removeAttribute('fill'));
  const country: HTMLElement = [
    ...worldMap.value.$el.querySelectorAll('title'),
  ].find((t: HTMLElement) => t.innerHTML === countryName);
  if (!country) {
    console.log(`country not fount ${countryName}`);
  } else {
    const parent: SVGGElement = country.parentElement! as any;
    parent.setAttribute('fill', 'red');
    const box = parent.getBBox();
    if (box.width < 30 || box.height < 30) {
      circle.setAttribute('stroke', 'red');
      circle.setAttribute('cx', Math.floor(box.x + box.width / 2));
      circle.setAttribute('cy', Math.floor(box.y + box.height / 2));
      circle.setAttribute('r', Math.max(box.width, box.height) + 5);
    }
  }
}

function isCorrectButton(idx: number) {
  if (
    task.length === 0 ||
    task.length < store.exercise.currentQuestion ||
    store.exercise.currentQuestion === 0
  ) {
    return false;
  }
  return (
    buttonLabels.value[idx] === task[store.exercise.currentQuestion - 1].capital
  );
}

async function selectWord(idx: number, $event: Event) {
  if (inputDisabled.value) {
    return;
  }
  $event.stopPropagation();
  if (isCorrectButton(idx)) {
    inputDisabled.value = true;
    store.$patch((store) => store.exercise.correctAnswers++);
    new SoundService().playSuccess();
    await exerciseUtils.wait(250);
    nextQuestion();
  } else {
    exerciseUtils.handleMistake(reveal, buttons);
  }
}

function isButtonDisabled(idx: number) {
  return permutation.value[idx] < store.exercise.currentQuestion - 1;
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}

const solution = computed(() => {
  if (
    task.length === 0 ||
    task.length < store.exercise.currentQuestion ||
    store.exercise.currentQuestion === 0
  ) {
    return '';
  }
  return task[store.exercise.currentQuestion - 1].capital;
});
</script>
