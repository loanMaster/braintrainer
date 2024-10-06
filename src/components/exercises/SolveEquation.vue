<template>
  <div
    ref="numpadContainer"
    class="relative-position"
    data-testid="core-exercise"
    :data-test="isDev && currentExercise?.result"
  >
    <NumPadWithDisplay
      ref="numpad"
      :input-disabled="inputDisabled"
      :input-value="inputValue"
      @button-click="onNumberEntered"
      :totalTime="10000"
      @timeout="reveal"
    />
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
  <SolutionBanner
    :show="revealed"
    :solution="`${currentExercise?.formula} -> x=${currentExercise?.result}`"
    @confirmed="onSolutionConfirmed"
  />
</template>

<script setup lang="ts">
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue';
import { takeUntil } from 'rxjs';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { SoundService } from 'src/shared-services/sound.service';
import { onBeforeMount, onMounted, Ref, ref } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import {
  Equation,
  MathExerciseService,
} from 'src/shared-services/math-exercise.service';
import { useRouter } from 'vue-router';

const {
  soundService,
  speechService,
  revealed,
  destroy,
  store,
  isDev,
  inputDisabled,
  onSolutionConfirmed,
  route,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

let currentIndex = 0;
const inputValue = ref('');
const numpadContainer = ref();
const numpad = ref();
const showLoadingIndicator = ref(false);
const router = useRouter();
let currentExercise: Ref<Equation | undefined> = ref();

onBeforeMount(async () => {
  const difficulty = exerciseUtils.difficulty(route);
  const numberOfQuestions = difficulty === 'easy' ? 5 : 7;
  exerciseUtils.createExercise(numberOfQuestions);
});

onMounted(async () => {
  new TweenService().setDisplay(numpadContainer.value, 'none');

  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    const number = Number(key.key);
    if (!isNaN(number)) {
      onNumberEntered(number);
    }
  });
});

async function nextQuestion() {
  currentIndex = 0;
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
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(numpadContainer.value);
  }
  numpad.value?.resetTimer();
  inputValue.value = 'x=';
  showLoadingIndicator.value = true;
  currentExercise.value = getNextExercise();
  showLoadingIndicator.value = false;
  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(numpadContainer.value, 'block');
    store.beginExercise();
  }
  await new TweenService().fadeIn(numpadContainer.value);
  inputDisabled.value = false;
  await playAudio(true);
  numpad.value?.startTimer();
}

async function playAudio(measureTime = false) {
  await speechService.say(currentExercise.value!.formulaToRead);
}

function getNextExercise(): Equation {
  const difficulty = store.exercise.difficulty;
  return new MathExerciseService().createEquation({
    difficulty,
    lang: store.language,
  });
}

async function onNumberEntered(num: number) {
  if (inputDisabled.value) {
    return;
  }
  if (String(num) === String(currentExercise?.value?.result)[currentIndex]) {
    currentIndex++;
    inputValue.value =
      'x=' + String(currentExercise?.value?.result).substring(0, currentIndex);
    if (currentIndex === String(currentExercise?.value?.result).length) {
      inputDisabled.value = true;
      numpad.value?.stopTimer();
      new SoundService().playSuccess();
      await exerciseUtils.wait(200);
      store.$patch((store) => store.exercise.correctAnswers++);
      new TweenService().fadeOut(numpadContainer.value);
      nextQuestion();
    }
  } else {
    exerciseUtils.handleMistake(reveal, numpadContainer);
  }
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
  numpad.value?.stopTimer();
}
</script>
