<template>
  <div
    ref="coreExercise"
    class="column items-center"
    :data-test="isDev && solution"
    data-testid="core-exercise"
  >
    <div class="q-my-md">
      <WordDisplay
        :value="inputValue"
        :highlightIndex="currentIndex"
        :highlightColor="highlightError ? 'red' : undefined"
      />
    </div>
    <SkipRepeatButtons />
    <div>
      <LetterButtons
        ref="letterButtons"
        :disabled="inputDisabled"
        @letter-selected="onLetterEntered"
        :numberOfButtons="6"
      />
    </div>
  </div>
  <SolutionBanner
    :show="revealed"
    :solution="solution"
    @confirmed="onSolutionConfirmed"
  />
</template>

<script setup lang="ts">
import SkipRepeatButtons from 'src/components/exercises/shared/SkipRepeatButtons.vue';
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import WordDisplay from 'src/components/exercises/shared/WordDisplay.vue';
import LetterButtons from 'src/components/exercises/shared/LetterButtons.vue';
import { Subject, takeUntil, ReplaySubject } from 'rxjs';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import {
  ExerciseService,
  WordList,
} from 'src/shared-services/exercise.service';
import { skip, take } from 'rxjs/operators';
import { useRouter } from 'vue-router';
import { SpeechService } from 'src/shared-services/speech.service';

const {
  soundService,
  revealed,
  destroy,
  isDev,
  store,
  difficulty,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => speak(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
  skipCb: () => reveal(),
});

let currentIndex = 0;
const inputValue = ref('');
let homophones: string[] = [];
let highlightError = ref(false);

let nextWord: Subject<WordList>;
let currentWord: Ref<WordList | undefined> = ref();
const router = useRouter();
const coreExercise = ref();
const letterButtons = ref();

onBeforeMount(() => {
  const numberOfQuestions = difficulty.value === 'normal' ? 5 : 10;
  exerciseUtils.createExercise(numberOfQuestions);
  nextWord = new ReplaySubject<WordList>(numberOfQuestions);
  const exclude: string[] = [];
  nextWord
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe((result) => {
      result.val.forEach((v) => exclude.push(v));
      fetchNextWord(exclude);
    });
  fetchNextWord();
});

onMounted(() => {
  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    if (store.letters.indexOf(key.key.toUpperCase()) > -1) {
      onLetterEntered(key.key.toUpperCase());
    }
  });
  new TweenService().setDisplay(coreExercise.value, 'none');
});

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
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(coreExercise.value);
  }
  currentWord.value = await nextWord
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise();

  homophones = currentWord.value!.val.map((value) => value.toUpperCase());
  currentIndex = homophones[0].length - 1;

  displayEmpty();
  updateButtonLabels();
  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(coreExercise.value);
  inputDisabled.value = false;
  await speak(true);
}

function updateButtonLabels() {
  const nextLetter = solution.value[currentIndex];
  const previousLetter =
    currentIndex + 1 < homophones[0].length
      ? solution.value[currentIndex + 1]
      : '';
  if (nextLetter === previousLetter) {
    return;
  }
  letterButtons.value.showAtLeast([solution.value[currentIndex]]);
}

async function speak() {
  await new SpeechService().say(currentWord.value!.val[0]);
}

function fetchNextWord(exclude?: string[]) {
  nextWord.next(
    new ExerciseService().randomHomophone({
      minLength:
        difficulty.value === 'normal' ? 3 : difficulty.value === 'hard' ? 5 : 7,
      maxLength:
        difficulty.value === 'normal'
          ? 5
          : difficulty.value === 'hard'
          ? 9
          : 16,
      lang: store.language,
      number: 1,
      exclude,
    })
  );
}

async function onLetterEntered(letter: string) {
  if (inputDisabled.value) {
    return;
  }
  const correct = matchesHomophone(letter);
  if (correct) {
    displayLetter(letter, false);
    currentIndex--;
    if (currentIndex < 0) {
      inputDisabled.value = true;
      new SoundService().playSuccess();
      await exerciseUtils.wait(150);
      store.$patch((store) => store.exercise.correctAnswers++);
      nextQuestion();
    } else {
      updateButtonLabels();
    }
  } else {
    displayLetter(letter, true);
    exerciseUtils.handleMistake(reveal, coreExercise);
  }
}

function displayEmpty() {
  inputValue.value = '__________________________________'.substring(
    0,
    currentIndex + 1
  );
  highlightError.value = false;
}

function displayLetter(letter: string, hasError: boolean) {
  const nextLetter = letter.toUpperCase();
  const existingLetters = solution.value.substring(currentIndex + 1);
  const spaces = '__________________________________'.substring(
    0,
    currentIndex
  );
  inputValue.value = spaces + nextLetter + existingLetters;
  highlightError.value = hasError;
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}

const solution = computed(() => {
  const text = inputValue.value.replaceAll(' ', '').substring(currentIndex + 1);
  for (const homophone of homophones) {
    if (homophone.substring(currentIndex + 1) === text) {
      return homophone;
    }
  }
  return '';
});

function matchesHomophone(letter: string): boolean {
  const text =
    letter + inputValue.value.replaceAll(' ', '').substring(currentIndex + 1);
  for (const homophone of homophones) {
    if (homophone.substring(currentIndex) === text) {
      return true;
    }
  }
  return false;
}
</script>
