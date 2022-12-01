<template>
  <div ref="buttons" class="row q-gutter-sm justify-center">
    <div
      v-for="(_, idx) in Array.from(
        Array(store.exercise.totalQuestions * 2).keys()
      )"
      v-bind:key="idx"
      class="my-button-wrapper"
    >
      <q-btn
        :color="isSelected(idx) ? 'accent' : 'primary'"
        class="transition-duration-md text-h5"
        :class="{ invisible: isSolved(idx) }"
        @click="buttonClick(idx, $event)"
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
import {shuffle} from "src/util/array.utils";

const { soundService, revealed, t, store, inputDisabled, route, difficulty } =
  createExerciseContext({
    playAudioCb: () => playAudio(),
    nextQuestionCb: () => nextQuestion(),
    startCb: () => nextQuestion(),
  });

let permutation: number[] = [];
let currentAudio: AudioResponse[] = [];
let nextAudio: Subject<AudioResponse[]>;
const alreadyVisited: Ref<number[]> = ref([]);
const solved: Ref<number[]> = ref([]);
const showLoadingIndicator = ref(false);
let lastAudioPlayed: Sound;

let selectedButtonIdx = ref(-1);
let secondSelectedButtonIdx = ref(-1);
const buttons = ref();

onBeforeMount(() => {
  const numberOfQuestions =
    difficulty.value === 'easy' ? 6 : difficulty.value === 'normal' ? 12 : 20;
  exerciseUtils.createExercise(numberOfQuestions);
  nextAudio = new ReplaySubject<AudioResponse[]>(1);
  loadAudio();
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
    }))
  ) {
    return;
  }
  inputDisabled.value = true;
  showLoadingIndicator.value = true;
  currentAudio = (await nextAudio
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise()) as AudioResponse[];
  showLoadingIndicator.value = false;
  permutation = Array.from(Array(store.exercise.totalQuestions).keys());
  permutation.push(...Array.from(Array(store.exercise.totalQuestions).keys()));
  shuffle(permutation)
  new TweenService().setDisplay(buttons.value, 'flex');
  await new TweenService().fadeIn(buttons.value);
  inputDisabled.value = false;
}

async function readWord(sound: Sound) {
  soundService.stop();
  lastAudioPlayed = sound;
  await soundService.play(sound);
}

function playAudio() {
  if (lastAudioPlayed) {
    readWord(lastAudioPlayed);
  }
}

async function loadAudio(): Promise<void> {
  nextAudio.next(
    await new ExerciseService().fetchRandomWords({
      minLength: 3,
      maxLength: 14,
      lang: store.language,
      number: store.exercise.totalQuestions,
      category: 'ANIMALS'
    })
  );
}

function isSelected(idx: number) {
  return (
    idx === selectedButtonIdx.value || idx === secondSelectedButtonIdx.value
  );
}

function isSolved(idx: number) {
  return solved.value.indexOf(idx) > -1;
}

async function buttonClick(idx: number, $event: Event) {
  $event.stopPropagation();
  if (
    idx === selectedButtonIdx.value ||
    idx === secondSelectedButtonIdx.value
  ) {
    readWord(currentAudio[permutation[idx]]);
    return;
  }
  if (selectedButtonIdx.value !== -1 && secondSelectedButtonIdx.value !== -1) {
    secondSelectedButtonIdx.value = -1;
    selectedButtonIdx.value = -1;
  }
  if (
    selectedButtonIdx.value > -1 &&
    permutation[idx] === permutation[selectedButtonIdx.value]
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
      await exerciseUtils.finishExercise();
    }
    selectedButtonIdx.value = -1;
    return;
  }
  readWord(currentAudio[permutation[idx]]);
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
