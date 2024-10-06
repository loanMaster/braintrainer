<template>
  <div
    ref="coreExercise"
    class="column items-center"
    data-testid="core-exercise"
    :data-test="isDev && getMatchingAnagram()"
  >
    <SpeechBubble
      :show="store.exercise.audioState.playingSequence"
      :text="store.exercise.audioState.meta.text"
      :transparentText="!store.exercise.audioState.playing"
    />
    <CountdownTimer
      :totalTime="25000"
      ref="countdownTimer"
      @timeout="reveal"
      class="q-mt-md"
    />
    <div class="q-my-md">
      <WordDisplay
        :value="inputValue"
        :highlightIndex="currentIndex"
        :highlightColor="highlightError ? 'red' : undefined"
      />
    </div>
    <div>
      <LetterButtons
        ref="letterButtons"
        :numberOfButtons="12"
        :disabled="inputDisabled"
        @letter-selected="onLetterEntered"
      />
    </div>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
  <SolutionBanner
    :show="revealed"
    :solution="getMatchingAnagram()"
    @confirmed="onSolutionConfirmed"
  />
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import CountdownTimer from 'src/components/exercises/shared/CountdownTimer.vue';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import WordDisplay from 'src/components/exercises/shared/WordDisplay.vue';
import LetterButtons from 'src/components/exercises/shared/LetterButtons.vue';
import SpeechBubble from 'src/components/exercises/shared/SpeechBubble.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { takeUntil, ReplaySubject } from 'rxjs';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, onBeforeMount, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { ExerciseService } from 'src/shared-services/exercise.service';
import { skip, take } from 'rxjs/operators';
import { shuffle } from 'src/util/array.utils';
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
  difficulty,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

const currentIndex = ref(0);
const inputValue = ref('');
const coreExercise = ref();
const letterButtons = ref();
const countdownTimer = ref();
const showLoadingIndicator = ref(false);
let nextAnagrams: ReplaySubject<string[]>;
let anagrams: string[] = [];
let alphabet: string[] = [];
let permutation: string[] = [];
let highlightError = false;
const router = useRouter();

onBeforeMount(() => {
  const numberOfQuestions = 10;
  exerciseUtils.createExercise(numberOfQuestions);
  nextAnagrams = new ReplaySubject<string[]>(numberOfQuestions);
  const exclude: string[] = [];
  alphabet = new ExerciseService().getAlphabet({
    lang: store.language,
  });
  nextAnagrams
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe((result) => {
      result.forEach((v) => exclude.push(v));
      loadNextAnagram(exclude);
    });
  loadNextAnagram();
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
  countdownTimer.value?.reset();
  currentIndex.value = 0;

  showLoadingIndicator.value = true;
  anagrams = (await nextAnagrams
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise()) as string[];
  showLoadingIndicator.value = false;
  anagrams = anagrams.map((v) => v.toUpperCase());
  do {
    permutation = shuffle(getMatchingAnagram().split(''));
  } while (isAnagram(permutation));
  displayEmptyInput();
  updateButtonLabels();
  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(coreExercise.value);
  inputDisabled.value = false;
  await playAudio(true);
  countdownTimer.value?.start();
}

function isAnagram(permutation: string[]): boolean {
  const toTest = permutation.join('');
  return anagrams.indexOf(toTest) > -1;
}

function updateButtonLabels() {
  const matchingAnagram = getMatchingAnagram();
  const setOfLetter: Set<string> = new Set(matchingAnagram.split(''));
  const letters: string[] = Array.from(setOfLetter);
  letterButtons.value.showAtLeast(letters);
}

async function playAudio(measureTime = false) {
  const audio = [];
  for (let idx = 0; idx < permutation.length; idx++) {
    const matchingAudio = alphabet.find(
      (a) => a.toUpperCase() === permutation[idx]
    );
    const letter = permutation[idx];
    audio.push({ text: letter, meta: { text: letter } });
  }
  await speechService.playAll(audio, 100, measureTime);
}

function loadNextAnagram(exclude?: string[]) {
  nextAnagrams.next(
    new ExerciseService().getAnagram({
      minLength:
        difficulty.value === 'easy' ? 3 : difficulty.value === 'normal' ? 5 : 6,
      maxLength:
        difficulty.value === 'easy' ? 4 : difficulty.value === 'normal' ? 6 : 7,
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
  const correct = matchesAnagram(letter);
  if (correct) {
    displayLetter(letter, false);
    currentIndex.value++;
    const anagram = getMatchingAnagram();
    if (currentIndex.value >= anagram.length) {
      inputDisabled.value = true;
      countdownTimer.value?.stop();
      new SoundService().playSuccess();
      store.$patch((store) => store.exercise.correctAnswers++);
      await exerciseUtils.wait(150);
      nextQuestion();
    }
  } else {
    displayLetter(letter, true);
    exerciseUtils.handleMistake(reveal, coreExercise);
  }
}

function displayEmptyInput() {
  const anagram = getMatchingAnagram();
  inputValue.value = '__________________________________'.substring(
    0,
    anagram.length
  );
  highlightError = false;
}

function displayLetter(letter: string, hasError: boolean) {
  const word = getMatchingAnagram();
  const nextLetter = letter.toUpperCase();
  const existingLetters = word.substring(0, currentIndex.value);
  const spaces = '__________________________________'.substring(
    currentIndex.value + 1,
    word.length
  );
  inputValue.value = existingLetters + nextLetter + spaces;
  highlightError = hasError;
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
  countdownTimer.value?.stop();
}

function getMatchingAnagram(): string {
  const text = inputValue.value
    .replaceAll(' ', '')
    .substring(0, currentIndex.value);
  for (const anagram of anagrams) {
    if (anagram.startsWith(text)) {
      return anagram;
    }
  }
  return '';
}

function matchesAnagram(letter: string): boolean {
  const text =
    inputValue.value.replaceAll(' ', '').substring(0, currentIndex.value) +
    letter;
  for (const anagram of anagrams) {
    if (anagram.startsWith(text)) {
      return true;
    }
  }
  return false;
}
</script>
