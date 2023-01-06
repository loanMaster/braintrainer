<template>
  <div
    ref="coreExercise"
    class="relative-position full-width column justify-center flex-1" style="overflow: hidden"
    data-testid="core-exercise"
  >
    <div class="row full-width justify-around text-h4 q-ma-lg full-width">
      <div class="relative-position q-mr-xl">
        <div ref="numberLeft" class="numberIndicator" :style="{ 'color': timeout ? 'gray' : 'black', opacity: timeout ? 0.5 : 1 }">{{ task.value1 }}
        </div>
      </div>
      <div class="relative-position q-ml-xl">
        <div ref="numberRight" class="numberIndicator" :style="{ 'color': timeout ? 'gray' : 'black', opacity: timeout ? 0.5 : 1 }">{{ task.value2 }}
        </div>
      </div>
    </div>
    <div class="row justify-center q-gutter-lg" ref="buttons">
      <q-btn color="green" size="xl" class="self-center" :disable="timeout" round push @click="onButtonClicked(true)">✓</q-btn>
      <q-btn color="red" size="xl" class="self-center" :disable="timeout" round push @click="onButtonClicked(false)">✖</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import { ref, onBeforeMount, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useRouter } from 'vue-router';
import { preloadAudio } from 'src/util/preload-assets';
import {useAppStore} from "stores/app-store";
import { shuffle } from 'src/util/array.utils';

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
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
});

const numberLeft = ref();
const numberRight = ref();
const buttons = ref()
const router = useRouter();
const timeout = ref(false)
let cancelTimeout = -1
const task =
  ref({ src: '', value1: 0, value2: 0, isTrue: false })

onBeforeMount(() => {
  const numberOfQuestions = 5;
  exerciseUtils.createExercise(numberOfQuestions);
});

onMounted(async () => {
  inputDisabled.value = true;
  if (numberLeft.value.isConnected) {
    numberLeft.value.style.setProperty('opacity', '0');
    numberRight.value.style.setProperty('opacity', '0');
  }
});

async function start() {
  const preload = Array.from(new Array(10).keys()).map(
    (k) => `/sounds/${store.language}_${k}.mp3`
  );
  await preloadAudio(preload);
  nextQuestion();
}

async function nextQuestion() {
  clearTimeout(cancelTimeout)
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
    return
  }

  createTask();
  timeout.value = false

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
  await playAudio(true);
  cancelTimeout = setTimeout(async() => {
    if (!inputDisabled.value) {
      timeout.value = true
      inputDisabled.value = true
      await Promise.all([new TweenService().fadeOut(numberLeft.value, 0.75),
        new TweenService().fadeOut(numberRight.value, 0.75)])
      nextQuestion()
    }
  }, 1000) as any
}

function createTask() {
  const vals = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]
  if (Math.random() > 0.4) {
    vals.push(vals[0] + vals[1])
  } else {
    vals.push(Math.floor(Math.random() * 20))
  }
  const isTrue = vals[0] + vals[1] === vals[2]
  shuffle(vals)
  task.value = {
    src: `/sounds/${store.language}_${vals[0] >= 10 ? vals[1] : vals[0]}.mp3`,
    value1: vals[0] >= 10 ? vals[0] : vals[1],
    value2: vals[2],
    isTrue
  }
  console.log(isTrue)
}

function playAudio(measureTime = false) {
  return soundService.playAll([task.value], 0, measureTime);
}

async function onButtonClicked(value: boolean) {
  if (inputDisabled.value) {
    return;
  }

  inputDisabled.value = true;
  if (value !== task.value.isTrue) {
    useAppStore().strike()
    new TweenService().wiggle(buttons.value);
    await Promise.all([new TweenService().fadeOut(numberLeft.value, 0.75),
      new TweenService().fadeOut(numberRight.value, 0.75)])
  } else {
    store.$patch((state) => state.exercise.correctAnswers++);
    await Promise.all([new TweenService().animateCSS(numberLeft.value, 'bounceOutUp', 0.5),
      new TweenService().animateCSS(numberRight.value, 'bounceOutUp', 0.5)])
  }

  nextQuestion();
}

</script>

<style scoped>
.numberIndicator {
  border: 3px black solid;
  border-radius: 10px;
  padding: 5px;
}
</style>
