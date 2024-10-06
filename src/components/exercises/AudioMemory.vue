<template>
  <div
    ref="buttons"
    class="row q-gutter-sm justify-center max-width-xs"
    data-testid="memory-buttons"
  >
    <div
      v-for="(_, idx) in Array.from(
        Array(store.exercise.totalQuestions * 2).keys()
      )"
      v-bind:key="idx"
      class="my-button-wrapper"
    >
      <q-btn
        :color="isSelected(idx) ? 'secondary' : 'primary'"
        class="transition-duration-md text-h5"
        :class="{ invisible: isSolved(idx) }"
        @click="buttonClick(idx, $event)"
        :data-test="isDev ? 'button-' + buttonValue(idx) : ''"
        :disabled="inputDisabled || isSolved(idx)"
        >🔉</q-btn
      >
    </div>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
</template>

<script setup lang="ts">
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { Sound, SoundService } from 'src/shared-services/sound.service';
import { onBeforeMount, onMounted, ref, Ref } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { TweenService } from 'src/shared-services/tween.service';
import {
  AudioResponse,
  ExerciseService,
} from 'src/shared-services/exercise.service';
import { ReplaySubject, Subject, take } from 'rxjs';
import { skip } from 'rxjs/operators';
import { useAppStore } from 'stores/app-store';
import { shuffle } from 'src/util/array.utils';
import { useRoute, useRouter } from 'vue-router';
import { preloadAudio } from 'src/util/preload-assets';

const {
  soundService,
  speechService,
  revealed,
  store,
  inputDisabled,
  difficulty,
  isDev,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

let permutation: number[] = [];
let wordList: Ref<{ src: string; val: string }[]> = ref([]);
const alreadyVisited: Ref<number[]> = ref([]);
const solved: Ref<number[]> = ref([]);
const showLoadingIndicator = ref(false);
let lastPlayed: { src: string; val: string };

let selectedButtonIdx = ref(-1);
let secondSelectedButtonIdx = ref(-1);
const buttons = ref();
const router = useRouter();

onBeforeMount(() => {
  const numberOfQuestions =
    useRoute().params.game === 'voices-memory'
      ? difficulty.value === 'easy'
        ? 4
        : difficulty.value === 'normal'
        ? 5
        : 6
      : difficulty.value === 'easy'
      ? 6
      : difficulty.value === 'normal'
      ? 12
      : 20;
  exerciseUtils.createExercise(numberOfQuestions);
});

onMounted(async () => {
  new TweenService().setDisplay(buttons.value, 'none');
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
  inputDisabled.value = true;
  showLoadingIndicator.value = true;
  showLoadingIndicator.value = false;
  wordList.value =
    store.exercise.nameOfTheGame === 'voices-memory'
      ? await loadExerciseVoiceMemory()
      : loadExercise();
  if (store.exercise.nameOfTheGame === 'voices-memory') {
    permutation = Array.from(Array(store.exercise.totalQuestions * 2).keys());
  } else {
    permutation = Array.from(Array(store.exercise.totalQuestions).keys());
    permutation.push(
      ...Array.from(Array(store.exercise.totalQuestions).keys())
    );
  }
  shuffle(permutation);
  new TweenService().setDisplay(buttons.value, 'flex');
  await new TweenService().fadeIn(buttons.value);
  inputDisabled.value = false;
}

async function readWord(word: { src: string; val: string }) {
  speechService.stop();
  soundService.stop();
  lastPlayed = word;
  if (store.exercise.nameOfTheGame === 'voices-memory') {
    await soundService.play(word);
  } else {
    await speechService.say(word.src);
  }
}

function playAudio() {
  if (lastPlayed) {
    readWord(lastPlayed);
  }
}

function loadExercise(): { src: string; val: string }[] {
  return new ExerciseService()
    .getRandomWords({
      minLength: 3,
      maxLength: 14,
      lang: store.language,
      number: store.exercise.totalQuestions,
      category:
        store.exercise.nameOfTheGame === 'memory-animals'
          ? 'ANIMALS'
          : undefined,
    })
    .map((w) => ({ src: w, val: w }));
}

async function loadExerciseVoiceMemory(): Promise<
  { src: string; val: string }[]
> {
  const items = new ExerciseService().getVoiceMemory(
    store.exercise.totalQuestions,
    store.language
  );
  await preloadAudio(items.map((i) => i.src));
  return items;
}

function isSelected(idx: number) {
  return (
    idx === selectedButtonIdx.value || idx === secondSelectedButtonIdx.value
  );
}

function isSolved(idx: number) {
  return solved.value.indexOf(idx) > -1;
}

function buttonValue(buttonIndex: number) {
  if (!permutation || wordList.value.length === 0) {
    return '';
  }
  return wordList.value[permutation[buttonIndex]].val;
}

async function buttonClick(idx: number, $event: Event) {
  $event.stopPropagation();
  if (
    idx === selectedButtonIdx.value ||
    idx === secondSelectedButtonIdx.value
  ) {
    readWord(wordList.value[permutation[idx]]);
    return;
  }
  if (selectedButtonIdx.value !== -1 && secondSelectedButtonIdx.value !== -1) {
    secondSelectedButtonIdx.value = -1;
    selectedButtonIdx.value = -1;
  }
  if (
    selectedButtonIdx.value > -1 &&
    buttonValue(idx) === buttonValue(selectedButtonIdx.value)
  ) {
    new SoundService().playSuccess();
    store.$patch((store) => {
      store.exercise.correctAnswers++;
      store.exercise.currentQuestion++;
    });
    solved.value.push(selectedButtonIdx.value);
    solved.value.push(idx);
    if (store.exercise.totalQuestions === store.exercise.correctAnswers) {
      await exerciseUtils.wait(150);
      await exerciseUtils.finishExercise(router);
    }
    selectedButtonIdx.value = -1;
    return;
  }
  readWord(wordList.value[permutation[idx]]);
  if (selectedButtonIdx.value === -1) {
    selectedButtonIdx.value = idx;
  } else {
    secondSelectedButtonIdx.value = idx;
    if (
      alreadyVisited.value.indexOf(idx) > -1 ||
      alreadyVisited.value.indexOf(selectedButtonIdx.value) > -1
    ) {
      useAppStore().strike();
      new TweenService().wiggle(buttons.value);
    } else {
      alreadyVisited.value.push(idx);
      alreadyVisited.value.push(selectedButtonIdx.value);
    }
  }
}
</script>
