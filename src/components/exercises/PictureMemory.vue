<template>
  <div
    ref="buttons"
    class="row justify-center max-width-xs"
    data-testid="memory-buttons"
  >
    <div
      v-for="(_, idx) in Array.from(
        Array(store.exercise.totalQuestions * 2).keys()
      )"
      style="margin: 0; padding: 2px"
      :style="{
        width: store.exercise.difficulty === 'veryhard' ? '15%' : '20%',
      }"
      v-bind:key="idx"
    >
      <button
        class="transition-duration-md text-h5 bg-primary picture-memory"
        :style="{
          opacity: isSolved(idx) ? 0 : inputDisabled ? 0.5 : 1,
          transitionDelay: isSolved(idx) ? '100ms' : 0,
        }"
        @click="buttonClick(idx, $event)"
        style="
          padding: 0;
          border-radius: 5px;
          border-color: transparent;
          cursor: pointer;
        "
        :data-test="isDev ? 'button-' + buttonValue(idx) : ''"
      >
        <img
          :src="'/images/memory/' + buttonValue(idx) + '.jpg'"
          style="
            width: 100%;
            padding: none;
            transition-duration: 300ms;
            vertical-align: middle;
            transition-property: all;
          "
          :style="{ opacity: revealButton(idx) ? 1 : 0 }"
        />
      </button>
    </div>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
</template>

<script setup lang="ts">
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { SoundService } from 'src/shared-services/sound.service';
import { onBeforeMount, onMounted, ref, Ref } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { TweenService } from 'src/shared-services/tween.service';
import { useAppStore } from 'stores/app-store';
import { shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';
import { preloadAssets } from 'src/util/preload-assets';

const { soundService, revealed, store, inputDisabled, difficulty, isDev } =
  createExerciseContext({
    playAudioCb: () => undefined,
    nextQuestionCb: () => nextQuestion(),
    startCb: () => nextQuestion(),
    skipCb: () => undefined,
  });

let permutation: number[] = [];
let fileList: Ref<string[]> = ref([]);
const alreadyVisited: Ref<number[]> = ref([]);
const solved: Ref<number[]> = ref([]);
const showLoadingIndicator = ref(false);

let selectedButtonIdx = ref(-1);
let secondSelectedButtonIdx = ref(-1);
const buttons = ref();
const router = useRouter();

onBeforeMount(() => {
  const numberOfQuestions =
    difficulty.value === 'normal' ? 6 : difficulty.value === 'hard' ? 12 : 20;
  exerciseUtils.createExercise(numberOfQuestions, false);
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
  fileList.value = loadExercise();
  await preloadAssets(
    fileList.value.map((name) => '/images/memory/' + name + '.jpg')
  );
  permutation = Array.from(Array(store.exercise.totalQuestions).keys());
  permutation.push(...Array.from(Array(store.exercise.totalQuestions).keys()));
  shuffle(permutation);
  new TweenService().setDisplay(buttons.value, 'flex');
  await new TweenService().fadeIn(buttons.value);
  store.beginExercise();
  inputDisabled.value = false;
}

function loadExercise(): string[] {
  return shuffle([
    'bear',
    'bee',
    'butterfly',
    'cat',
    'cow',
    'crocodile',
    'dog',
    'elefant',
    'fawn',
    'fish',
    'fox',
    'hamster',
    'horse',
    'ice_bear',
    'lion',
    'parrot',
    'pelican',
    'rabbit',
    'snake',
    'zebra',
  ]).slice(0, store.exercise.totalQuestions);
}

function isSolved(idx: number) {
  return solved.value.indexOf(idx) > -1;
}

function buttonValue(buttonIndex: number) {
  if (!permutation || permutation.length === 0 || fileList.value.length === 0) {
    return 'cat';
  }
  return fileList.value[permutation[buttonIndex]];
}

function isSelected(idx: number) {
  return (
    idx === selectedButtonIdx.value || idx === secondSelectedButtonIdx.value
  );
}

function revealButton(idx: number) {
  return (
    idx === selectedButtonIdx.value ||
    idx === secondSelectedButtonIdx.value ||
    isSolved(idx)
  );
}

async function buttonClick(idx: number, $event: Event) {
  $event.stopPropagation();
  if (
    inputDisabled.value ||
    isSolved(idx) ||
    idx === selectedButtonIdx.value ||
    idx === secondSelectedButtonIdx.value
  ) {
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
