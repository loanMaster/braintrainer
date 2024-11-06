<template>
  <div
    ref="numpadContainer"
    class="relative-position"
    data-testid="core-exercise"
    :data-test="solution"
  >
    <NumPadWithDisplay
      ref="numpad"
      :input-disabled="inputDisabled"
      :input-value="inputValue"
      @button-click="onNumberEntered"
    />
  </div>
  <SolutionBanner
    :show="revealed"
    :solution="solution"
    @confirmed="onSolutionConfirmed"
  />
</template>

<script setup lang="ts">
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue';
import { takeUntil } from 'rxjs';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { SoundService } from 'src/shared-services/sound.service';
import { onBeforeMount, onMounted, ref } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import {
  MathExercise,
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
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
  skipCb: () => reveal(),
});

let currentIndex = 0;
const inputValue = ref('');
const numpad = ref();
const numpadContainer = ref();
const showLoadingIndicator = ref(false);
const router = useRouter();

let currentExercise: MathExercise;
let solution = ref(0);

onBeforeMount(() => {
  exerciseUtils.createExercise();
});

onMounted(async () => {
  new TweenService().setDisplay(numpadContainer.value, 'none');

  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    const number = Number(key.key);
    if (!isNaN(number)) {
      onNumberEntered(number);
    }
  });

  preloadAudio(
    ['÷', '+', '×', '−'].map((k) => `sounds/maths/${store.language}_${k}.mp3`)
  );
});

async function nextQuestion() {
  inputValue.value = '';
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
  showLoadingIndicator.value = true;
  currentExercise = createNewExercise();
  solution.value = currentExercise.result;
  showLoadingIndicator.value = false;
  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(numpadContainer.value, 'block');
    store.beginExercise();
    await new TweenService().fadeIn(numpadContainer.value);
  }
  inputDisabled.value = false;
  await playAudio();
}

async function playAudio() {
  await speechService.say(currentExercise.asText);
}

function createNewExercise() {
  const difficulty = store.exercise.difficulty;
  if (store.exercise.nameOfTheGame === 'mental-arithmetic') {
    return new MathExerciseService().createAddSubExercise(difficulty as any);
  } else {
    return new MathExerciseService().createMulDivExercise(
      difficulty as any,
      store.language
    );
  }
}

async function onNumberEntered(num: number) {
  if (inputDisabled.value) {
    return;
  }
  if (String(num) === String(solution.value)[currentIndex]) {
    currentIndex++;
    inputValue.value = String(solution.value).substring(0, currentIndex);
    if (currentIndex === String(solution.value).length) {
      inputDisabled.value = true;
      new SoundService().playSuccess();
      await exerciseUtils.wait(200);
      store.$patch((store) => store.exercise.correctAnswers++);
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
