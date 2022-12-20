<template>
  <div ref="numpadContainer" class="relative-position" data-testid="core-exercise" :data-test="currentExercise?.result">
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
import { Sound, SoundService } from 'src/shared-services/sound.service';
import { onBeforeMount, onMounted, Ref, ref } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import { ReplaySubject, Subject, take } from 'rxjs';
import { skip } from 'rxjs/operators';
import {
  EquationResponse,
  MathExerciseService,
} from 'src/shared-services/math-exercise.service';
import { useRouter } from 'vue-router';

const {
  soundService,
  revealed,
  destroy,
  store,
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
let nextExercise: Subject<EquationResponse>;
let currentExercise: Ref<EquationResponse | undefined> = ref();

let question: Sound[] = [];

onBeforeMount(async () => {
  const difficulty = exerciseUtils.difficulty(route);
  const numberOfQuestions = difficulty === 'easy' ? 5 : 7;
  exerciseUtils.createExercise(numberOfQuestions);
  nextExercise = new ReplaySubject<EquationResponse>(numberOfQuestions);
  nextExercise
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe(() => fetchNextExercise());
  fetchNextExercise();
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
  currentExercise.value = (await nextExercise
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise()) as EquationResponse;
  question = currentExercise.value.audio.map((audio) => ({ audio }));
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
  await soundService.playAll(question, 100, measureTime);
}

async function fetchNextExercise() {
  const difficulty = store.exercise.difficulty;
  nextExercise.next(
    await new MathExerciseService().fetchEquation({
      difficulty,
      lang: store.language,
    })
  );
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
