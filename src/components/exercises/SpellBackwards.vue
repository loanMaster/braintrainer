<template>
  <div ref="coreExercise" class="column">
    <div class="q-my-md">
      <WordDisplay
        :value="inputValue"
        :highlightIndex="currentIndex"
        :highlightColor="highlightError ? 'red' : 'black'"
      />
    </div>
    <div>
      <LetterButtons
        ref="letterButtons"
        @letter-selected="onLetterEntered"
        :numberOfButtons="6"
      />
    </div>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
  <SolutionBanner
    :show="revealed"
    :solution="solution"
    @click="containerClicked"
  />
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue';
import WordDisplay from 'src/components/exercises/shared/WordDisplay.vue';
import LetterButtons from 'src/components/exercises/shared/LetterButtons.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { Subject, takeUntil, ReplaySubject } from 'rxjs';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import {
  ExerciseService,
  HomophoneAudioResponse,
} from 'src/shared-services/exercise.service';
import { skip, take } from 'rxjs/operators';

const {
  soundService,
  revealed,
  destroy,
  $q,
  t,
  route,
  store,
  inputDisabled,
  containerClicked,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

let currentIndex = 0;
const inputValue = ref('');
let homophones: string[] = [];
let highlightError = ref(false);
const showLoadingIndicator = ref(false);

let nextAudio: Subject<HomophoneAudioResponse>;
let currentAudio: Ref<HomophoneAudioResponse | undefined> = ref();

const coreExercise = ref();
const letterButtons = ref();

onBeforeMount(() => {
  const numberOfQuestions = difficulty.value === 'easy' ? 5 : 10;
  exerciseUtils.createExercise(numberOfQuestions);
  nextAudio = new ReplaySubject<HomophoneAudioResponse>(numberOfQuestions);
  nextAudio
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe(() => loadNextAudio());
  loadNextAudio();
});

onMounted(() => {
  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    if (revealed.value) {
      nextQuestion();
      return;
    }
    if (store.letters.indexOf(key.key.toUpperCase()) > -1) {
      onLetterEntered(key.key.toUpperCase());
    }
  });
  new TweenService().setDisplay(coreExercise.value, 'none');
});

const difficulty = computed(() => {
  return route.params.difficulty;
});

async function nextQuestion() {
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
    await new TweenService().fadeOut(coreExercise.value);
  }
  showLoadingIndicator.value = true;
  currentAudio.value = (await nextAudio
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise()) as HomophoneAudioResponse;
  showLoadingIndicator.value = false;

  homophones = (currentAudio.value as HomophoneAudioResponse).val.map((value) =>
    value.toUpperCase()
  );
  currentIndex = homophones[0].length - 1;

  displayEmpty();
  updateButtonLabels();
  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
  }
  await new TweenService().fadeIn(coreExercise.value);
  inputDisabled.value = false;
  playAudio();
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

async function playAudio() {
  await soundService.play(currentAudio.value!);
}

async function loadNextAudio(): Promise<void> {
  nextAudio.next(
    await new ExerciseService().fetchHomophone({
      minLength:
        difficulty.value === 'easy' ? 3 : difficulty.value === 'normal' ? 5 : 7,
      maxLength:
        difficulty.value === 'easy'
          ? 5
          : difficulty.value === 'normal'
          ? 9
          : 16,
      lang: store.language,
      number: 1,
    })
  );
}

function selectLetter(letter: string, $event: Event) {
  $event.stopPropagation();
  onLetterEntered(letter);
}

async function onLetterEntered(letter: string) {
  if (revealed.value) {
    nextQuestion();
  }
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
