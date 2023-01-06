<template>
  <div
    ref="coreExercise"
    class="relative-position full-width column justify-center flex-1"
    style="overflow: hidden"
    data-testid="core-exercise"
  >
    <div class="row full-width justify-center text-h4 q-ma-lg full-width">
      <div class="relative-positionx">
        <div
          ref="word"
          class="wordDisplay"
          :style="{
            color:
              state === 'correct'
                ? 'green'
                : state === 'wrong'
                ? 'red'
                : 'black',
          }"
        >
          {{ task.scrambledWord }}
        </div>
      </div>
    </div>
    <div class="row justify-center q-gutter-lg" ref="buttons">
      <q-btn
        color="green"
        size="xl"
        class="self-center"
        round
        push
        @click="onButtonClicked(true)"
        >✓</q-btn
      >
      <q-btn
        color="red"
        size="xl"
        class="self-center"
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
import { ref, Ref, onBeforeMount, onMounted, computed } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useRouter } from 'vue-router';
import { useAppStore } from 'stores/app-store';
import {
  ExerciseService,
  HomophoneAudioResponse,
} from 'src/shared-services/exercise.service';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { randomElement, shuffle } from 'src/util/array.utils';
import { LETTERS } from 'src/const/letters';

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
const word = ref();
const buttons = ref();
const router = useRouter();
const coreExercise = ref();
const timeout = ref(false);
const state: Ref<'correct' | 'wrong' | ''> = ref('');
let homophones: HomophoneAudioResponse[] = [];
let cancelTimeout = -1;

const task = ref({ audio: '', scrambledWord: '', isTrue: false });

onBeforeMount(() => {
  const numberOfQuestions = 10;
  exerciseUtils.createExercise(numberOfQuestions);
});

onMounted(async () => {
  inputDisabled.value = true;
  new TweenService().setDisplay(coreExercise.value, 'none');
  if (word.value.isConnected) {
    word.value.style.setProperty('opacity', '0');
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
  homophones = await new ExerciseService().fetchHomophones({
    lang: store.language,
    count: store.exercise.totalQuestions,
    minLength: minLength.value,
    maxLength: maxLength.value,
  });
}

async function nextQuestion() {
  state.value = '';
  clearTimeout(cancelTimeout);
  if (word.value.isConnected) {
    word.value.style.setProperty('opacity', '0');
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

  if (word.value.isConnected) {
    word.value.style.setProperty('opacity', '1');
  }
  new TweenService().animateCSS(
    word.value,
    store.exercise.currentQuestion % 2 == 0 ? 'bounceInLeft' : 'bounceInRight',
    0.75
  );

  if (store.exercise.currentQuestion === 1) {
    store.beginExercise();
  }
  inputDisabled.value = false;
  await playAudio();
  cancelTimeout = setTimeout(async () => {
    if (!inputDisabled.value) {
      timeout.value = true;
      await new TweenService().fadeOut(word.value, 0.65);
      if (!inputDisabled.value) {
        inputDisabled.value = true;
        nextQuestion();
      }
    }
  }, 650) as any;
}

const minLength = computed(() => {
  switch (store.exercise.difficulty) {
    case 'easy':
      return 3;
    case 'normal':
      return 6;
    default:
      return 8;
  }
});

const maxLength = computed(() => {
  switch (store.exercise.difficulty) {
    case 'easy':
      return 5;
    case 'normal':
      return 8;
    default:
      return 10;
  }
});

function createTask() {
  const currentWord = homophones[store.exercise.currentQuestion - 1].val[0]
    .toUpperCase()
    .split('');
  const permutation = [...currentWord];
  if (Math.random() > 0.75) {
    permutation.pop();
  } else if (Math.random() > 0.6) {
    permutation.push(randomElement(LETTERS[store.language].split('')));
    if (Math.random() > 0.6) {
      permutation.pop();
    }
  }
  shuffle(permutation);
  while (permutation.join('') === currentWord.join('')) {
    shuffle(permutation);
  }
  const sortedPermutation = permutation.sort((a, b) =>
    a > b ? 1 : a < b ? -1 : 0
  );
  let isTrue = false;
  homophones[store.exercise.currentQuestion - 1].val.forEach((v) => {
    const sortedWord = v
      .toUpperCase()
      .split('')
      .sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
    if (sortedPermutation.join('') === sortedWord.join('')) {
      isTrue = true;
    }
  });
  task.value = {
    audio: homophones[store.exercise.currentQuestion - 1].audio,
    scrambledWord: permutation.join(''),
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
    state.value = 'wrong';
    task.value.scrambledWord = 'X';
    new TweenService().stopAnimations(word.value);
    await Promise.all([
      new TweenService().animateCSS(word.value, 'backOutDown', 0.5),
    ]);
  } else {
    store.$patch((state) => state.exercise.correctAnswers++);
    state.value = 'correct';
    task.value.scrambledWord = '✓';
    new TweenService().stopAnimations(word.value);
    await Promise.all([
      new TweenService().animateCSS(word.value, 'bounceOutUp', 0.5),
    ]);
  }
  nextQuestion();
}
</script>

<style scoped>
.wordDisplay {
  color: black;
  border: 3px black solid;
  border-radius: 10px;
  background-color: white;
  padding: 5px;
}
</style>
