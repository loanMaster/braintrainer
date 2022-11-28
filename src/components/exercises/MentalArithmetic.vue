<template>
  <div ref="numpad" class="relative-position" @click="containerClicked">
    <NumPadWithDisplay
      :input-disabled="inputDisabled"
      :input-value="inputValue"
      @button-click="onNumberEntered"
    />
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
  <SolutionBanner
    :show="revealed"
    :solution="solution"
    @click="containerClicked"
  />
</template>

<script setup lang="ts">
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue';
import { takeUntil } from 'rxjs';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { Sound, SoundService } from 'src/shared-services/sound.service';
import { onBeforeMount, onMounted, ref } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import { ReplaySubject, Subject, take } from 'rxjs';
import { skip } from 'rxjs/operators';
import {
  MathExerciseResponse,
  MathExerciseService,
} from 'src/shared-services/math-exercise.service';

const {
  soundService,
  revealed,
  destroy,
  t,
  store,
  inputDisabled,
  containerClicked,
  route,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

let currentIndex = 0;
const inputValue = ref('');
const numpad = ref();
const showLoadingIndicator = ref(false);

let nextExercise: Subject<MathExerciseResponse>;
let currentExercise: MathExerciseResponse;

let question: Sound[] = [];
let solution = ref(0);

onBeforeMount(async () => {
  const difficulty = exerciseUtils.difficulty(route);
  const numberOfQuestions = difficulty === 'easy' ? 5 : 7;
  exerciseUtils.createExercise(numberOfQuestions);
  nextExercise = new ReplaySubject<MathExerciseResponse>(numberOfQuestions);
  nextExercise
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe(() => fetchNextExercise());
  fetchNextExercise();
});

onMounted(async () => {
  new TweenService().setDisplay(numpad.value, 'none');

  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    if (revealed.value) {
      nextQuestion();
    }
    const number = Number(key.key);
    if (!isNaN(number)) {
      onNumberEntered(number);
    }
  });
});

async function nextQuestion() {
  inputValue.value = '';
  currentIndex = 0;
  if (
    !(await exerciseUtils.prepareNewQuestion({
      inputDisabled,
      soundService,
      revealed,
    }))
  ) {
    return;
  }
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(numpad.value);
  }
  showLoadingIndicator.value = true;
  currentExercise = (await nextExercise
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise()) as MathExerciseResponse;
  question = [
    { audio: currentExercise.first.audio },
    exerciseUtils.getSoundForMathOp(currentExercise.operation),
    { audio: currentExercise.second.audio },
  ];
  solution.value = currentExercise.result;
  showLoadingIndicator.value = false;
  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(numpad.value, 'block');
  }
  await new TweenService().fadeIn(numpad.value);
  inputDisabled.value = false;
  playAudio();
}

async function playAudio() {
  await soundService.playAll(question, 100);
}

async function fetchNextExercise() {
  const difficulty = store.exercise.difficulty;
  nextExercise.next(
    await new MathExerciseService().fetchMatMulExercise({
      difficulty,
      lang: store.language,
    })
  );
}

async function onNumberEntered(num: number) {
  if (revealed.value) {
    nextQuestion();
    return;
  }
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
      new TweenService().fadeOut(numpad.value);
      nextQuestion();
    }
  } else {
    exerciseUtils.handleMistake(reveal, numpad);
  }
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
  inputValue.value = `${solution.value}`;
}
</script>
