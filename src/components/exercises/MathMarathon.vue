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
      :totalTime="10000"
      @timeout="reveal"
    />
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
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
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { Sound, SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { skip, take, takeUntil } from 'rxjs/operators';
import { keyInput } from 'src/util/key.input';
import {
  ContinuationExerciseResponse,
  MathExerciseService,
} from 'src/shared-services/math-exercise.service';
import { ReplaySubject, Subject } from 'rxjs';
import { useRouter } from 'vue-router';
import {preloadAudio} from "src/util/preload-assets";

const {
  soundService,
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
});

const currentIndex = ref(0);
const inputValue = ref('');
const numpadContainer = ref();
const numpad = ref();
const showLoadingIndicator = ref(false);
const router = useRouter();

let nextExercise: Subject<ContinuationExerciseResponse>;
let currentExercise: ContinuationExerciseResponse;

let question: Sound[] = [];
const expectedResult: Ref<number | null> = ref(null);
const previousResult: Ref<number | null> = ref(null);

onBeforeMount(() => {
  const numberOfQuestions = 15;
  exerciseUtils.createExercise(numberOfQuestions);
  nextExercise = new ReplaySubject<ContinuationExerciseResponse>(
    numberOfQuestions + 1
  );
  nextExercise
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe((value: ContinuationExerciseResponse) => {
      console.log(
        value?.initial?.val +
          ' ' +
          value.operation +
          ' ' +
          value.val +
          ' -> ' +
          value.result
      );
      fetchNextExercise(value.result);
    });
  fetchNextExercise();
});

onMounted(() => {
  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    const number = Number(key.key);
    if (!isNaN(number)) {
      onNumberEntered(number);
    }
  });
  preloadAudio(['÷', '+', '×', '−'].map(k => `/sounds/${store.language}_${k}.mp3`))
  new TweenService().setDisplay(numpadContainer.value, 'none');
});

async function fetchNextExercise(current?: number) {
  nextExercise.next(
    await new MathExerciseService().fetchContinuationExercise({
      difficulty: difficulty.value as string,
      lang: store.language,
      current,
    })
  );
}

async function nextQuestion() {
  inputValue.value = '';
  soundService.stop();
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
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(numpadContainer.value);
  }
  numpad.value?.resetTimer();
  previousResult.value = expectedResult.value;

  showLoadingIndicator.value = true;
  currentExercise = (await nextExercise
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise()) as ContinuationExerciseResponse;
  expectedResult.value = currentExercise.result;
  question = currentExercise.initial
    ? [
        { audio: currentExercise.initial.audio },
        exerciseUtils.getSoundForMathOp(currentExercise.operation),
        { audio: currentExercise.audio },
      ]
    : [
        exerciseUtils.getSoundForMathOp(currentExercise.operation),
        { audio: currentExercise.audio },
      ];
  showLoadingIndicator.value = false;

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(numpadContainer.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(numpadContainer.value);
  inputDisabled.value = false;
  await playAudio(true);
  numpad.value?.startTimer();
}

async function playAudio(measureTime = false) {
  soundService.stop();
  await soundService.playAll(question, 100, measureTime);
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
      numpad.value?.stopTimer();
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
  numpad.value?.stopTimer();
}
</script>
