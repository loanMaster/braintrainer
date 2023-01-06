<template>
  <div
    ref="coreExercise"
    class="relative-position full-width column justify-center flex-1"
    style="overflow: hidden"
    data-testid="core-exercise"
  >
    <div class="row full-width justify-center text-h4 q-ma-lg full-width">
      <div class="relative-position q-mr-xl">
        <div
          ref="numberLeft"
          class="numberIndicator"
          :style="{
            color: timeout ? 'lightgray' : 'black',
            opacity: timeout ? 0.5 : 1,
          }"
        >
          {{ task.value1 }}
        </div>
      </div>
      <div class="relative-position q-ml-xl">
        <div
          ref="numberRight"
          class="numberIndicator"
          :style="{
            color: timeout ? 'lightgray' : 'black',
            opacity: timeout ? 0.5 : 1,
          }"
        >
          {{ task.value2 }}
        </div>
      </div>
    </div>
    <div class="row justify-center q-gutter-lg" ref="buttons">
      <q-btn
        color="green"
        size="xl"
        class="self-center"
        :disable="timeout"
        round
        push
        @click="onButtonClicked(true)"
        >✓</q-btn
      >
      <q-btn
        color="red"
        size="xl"
        class="self-center"
        :disable="timeout"
        round
        push
        @click="onButtonClicked(false)"
        >✖</q-btn
      >
    </div>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import { ref, onBeforeMount, onMounted, computed } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useRouter } from 'vue-router';
import { useAppStore } from 'stores/app-store';
import {
  AudioResponse,
  ExerciseService,
} from 'src/shared-services/exercise.service';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';

const {
  soundService,
  revealed,
  isDev,
  destroy,
  route,
  store,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => {
    // no-op
  },
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
});

const showLoadingIndicator = ref(false);
const numberLeft = ref();
const numberRight = ref();
const buttons = ref();
const router = useRouter();
const coreExercise = ref();
const timeout = ref(false);
let audio: AudioResponse[] = [];
let cancelTimeout = -1;

const task = ref({ audio: '', value1: 0, value2: 0, isTrue: false });

onBeforeMount(() => {
  const numberOfQuestions = 20;
  exerciseUtils.createExercise(numberOfQuestions);
});

onMounted(async () => {
  inputDisabled.value = true;
  new TweenService().setDisplay(coreExercise.value, 'none');
  if (numberLeft.value.isConnected) {
    numberLeft.value.style.setProperty('opacity', '0');
    numberRight.value.style.setProperty('opacity', '0');
  }
});

async function start() {
  showLoadingIndicator.value = true;
  await fetchAudio();
  showLoadingIndicator.value = false;
  new TweenService().setDisplay(coreExercise.value, 'flex');
  nextQuestion();
}

async function fetchAudio() {
  audio = await new ExerciseService().fetchNumbers({
    lang: store.language,
    count: store.exercise.totalQuestions,
    min: minNum.value,
    max: maxNum.value,
  });
}

async function nextQuestion() {
  clearTimeout(cancelTimeout);
  if (numberLeft.value.isConnected) {
    numberLeft.value.style.setProperty('opacity', '0');
    numberRight.value.style.setProperty('opacity', '0');
  }
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

  if (
    useAppStore().exercise.currentQuestion >=
    useAppStore().exercise.totalQuestions + 1
  ) {
    return;
  }

  createTask();
  timeout.value = false;

  if (numberLeft.value.isConnected) {
    numberLeft.value.style.setProperty('opacity', '1');
    numberRight.value.style.setProperty('opacity', '1');
  }
  new TweenService().animateCSS(numberLeft.value, 'bounceInLeft', 0.75);
  new TweenService().animateCSS(numberRight.value, 'bounceInRight', 0.75);

  if (store.exercise.currentQuestion === 1) {
    store.beginExercise();
  }
  inputDisabled.value = false;
  await playAudio();
  console.log('finished howlx');

  cancelTimeout = setTimeout(async () => {
    if (!inputDisabled.value) {
      timeout.value = true;
      inputDisabled.value = true;
      await Promise.all([
        new TweenService().fadeOut(numberLeft.value, 0.75),
        new TweenService().fadeOut(numberRight.value, 0.75),
      ]);
      nextQuestion();
    }
  }, 1000) as any;
}

const maxNum = computed(() => {
  switch (store.exercise.difficulty) {
    case 'easy':
      return 20;
    case 'normal':
      return 30;
    default:
      return 50;
  }
});

const minNum = computed(() => {
  switch (store.exercise.difficulty) {
    case 'easy':
      return 0;
    case 'normal':
      return 10;
    default:
      return 20;
  }
});

function createTask() {
  const vals = [
    Number(audio[store.exercise.currentQuestion - 1].val),
    Math.floor(Math.random() * maxNum.value + minNum.value),
  ];
  if (Math.random() > 0.65) {
    if (vals[0] > vals[1] && Math.random() > 0.5) {
      vals.push(vals[0] - vals[1]);
    } else {
      vals.push(vals[0] + vals[1]);
    }
  } else {
    const expected = vals[0] + vals[1];
    vals.push(Math.max(0, expected + Math.floor((Math.random() * 8) / 4)));
  }
  const isTrue =
    vals[0] + vals[1] === vals[2] ||
    vals[0] + vals[2] === vals[1] ||
    vals[1] + vals[2] === vals[0];
  if (Math.random() > 0.5) {
    const temp = vals[1];
    vals[1] = vals[2];
    vals[2] = temp;
  }
  task.value = {
    audio: audio[store.exercise.currentQuestion - 1].audio,
    value1: vals[1],
    value2: vals[2],
    isTrue,
  };
}

function playAudio() {
  if (!soundService.isPlaying()) {
    return soundService.play(task.value);
  }
}

async function onButtonClicked(value: boolean) {
  if (inputDisabled.value) {
    return;
  }
  inputDisabled.value = true;
  if (value !== task.value.isTrue) {
    useAppStore().strike();
    new TweenService().wiggle(buttons.value);
    await Promise.all([
      new TweenService().fadeOut(numberLeft.value, 0.75),
      new TweenService().fadeOut(numberRight.value, 0.75),
    ]);
  } else {
    store.$patch((state) => state.exercise.correctAnswers++);
    await Promise.all([
      new TweenService().animateCSS(numberLeft.value, 'bounceOutUp', 0.5),
      new TweenService().animateCSS(numberRight.value, 'bounceOutUp', 0.5),
    ]);
  }

  nextQuestion();
}
</script>

<style scoped>
.numberIndicator {
  border: 3px black solid;
  border-radius: 10px;
  background-color: white;
  padding: 5px;
}
</style>
