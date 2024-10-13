<template>
  <div
    ref="numpadContainer"
    class="column relative-position"
    data-testid="core-exercise"
    :data-test="isDev ? expectedResult : ''"
  >
    <input :value="previousResult" disabled class="text-center text-h6" />
    <NumPadWithDisplay
      ref="numpad"
      :input-disabled="inputDisabled"
      :input-value="inputValue"
      @button-click="onNumberEntered"
    />
  </div>
  <SolutionBanner
    :show="revealed"
    :solution="expectedResult"
    @confirmed="onSolutionConfirmed"
  />
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { takeUntil } from 'rxjs/operators';
import { keyInput } from 'src/util/key.input';
import {
  ContinuationExerciseResponse,
  MathExerciseService,
} from 'src/shared-services/math-exercise.service';
import { useRouter } from 'vue-router';
import { preloadAudio } from 'src/util/preload-assets';

const {
  soundService,
  speechService,
  revealed,
  destroy,
  store,
  isDev,
  inputDisabled,
  onSolutionConfirmed,
  difficulty,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
  skipCb: () => reveal(),
});

const currentIndex = ref(0);
const inputValue = ref('');
const numpadContainer = ref();
const numpad = ref();
const router = useRouter();

let currentExercise: ContinuationExerciseResponse;

const expectedResult: Ref<number | null> = ref(null);
const previousResult: Ref<number | null> = ref(null);

onBeforeMount(() => {
  const numberOfQuestions = 15;
  exerciseUtils.createExercise(numberOfQuestions);
});

onMounted(() => {
  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    const number = Number(key.key);
    if (!isNaN(number)) {
      onNumberEntered(number);
    }
  });
  preloadAudio(
    ['÷', '+', '×', '−'].map((k) => `sounds/maths/${store.language}_${k}.mp3`)
  );
  new TweenService().setDisplay(numpadContainer.value, 'none');
});

function fetchNextExercise(current?: number) {
  return new MathExerciseService().getNextCalculation({
    difficulty: difficulty.value as string,
    lang: store.language,
    current,
  });
}

async function nextQuestion() {
  inputValue.value = '';
  speechService.stop();
  currentIndex.value = 0;
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
  previousResult.value = expectedResult.value;

  currentExercise = fetchNextExercise(currentExercise?.result);
  expectedResult.value = currentExercise.result;

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(numpadContainer.value, 'flex');
    store.beginExercise();
    await new TweenService().fadeIn(numpadContainer.value);
  }
  inputDisabled.value = false;
  await playAudio();
}

async function playAudio() {
  speechService.stop();
  if (store.exercise.currentQuestion === 1) {
    await speechService.say(
      currentExercise.initial + ' ' + currentExercise.asText
    );
  } else {
    await speechService.say(currentExercise.asText);
  }
}

async function onNumberEntered(num: number) {
  if (inputDisabled.value) {
    return;
  }
  if (String(num) === String(expectedResult.value)[currentIndex.value]) {
    currentIndex.value++;
    inputValue.value = String(expectedResult.value).substring(
      0,
      currentIndex.value
    );
    if (currentIndex.value === String(expectedResult.value).length) {
      inputDisabled.value = true;
      store.$patch((store) => store.exercise.correctAnswers++);
      new SoundService().playSuccess();
      await exerciseUtils.wait(150);
      nextQuestion();
    }
  } else {
    exerciseUtils.handleMistake(reveal, numpadContainer);
  }
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}
</script>
