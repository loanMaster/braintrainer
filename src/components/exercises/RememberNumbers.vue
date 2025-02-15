<template>
  <div
    ref="numpad"
    class="relative-position"
    :data-test="solution"
    data-testid="core-exercise"
  >
    <NumPadWithDisplay
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
import { TweenService } from 'src/shared-services/tween.service';
import { keyInput } from 'src/util/key.input';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue';
import { takeUntil } from 'rxjs';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useRouter } from 'vue-router';
import { preloadAudio } from 'src/util/preload-assets';

const {
  soundService,
  revealed,
  destroy,
  store,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
  skipCb: () => reveal(),
});

let currentIndex = 0;
const inputValue = ref('');

const currentAudio: Ref<{ src: string; val: number }[]> = ref([]);
const sequence: Ref<number[]> = ref([]);
const reverse = ref(false);
const router = useRouter();
const numpad = ref();

onBeforeMount(() => {
  exerciseUtils.createExercise();
});

onMounted(async () => {
  reverse.value = store.exercise.nameOfTheGame.indexOf('-rev') > -1;

  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    const number = Number(key.key);
    if (!isNaN(number)) {
      onNumberEntered(number);
    }
  });

  inputDisabled.value = true;

  const preload = Array.from(new Array(10).keys()).map(
    (k) => `sounds/maths/${store.language}_${k}.mp3`
  );
  preloadAudio(preload);
  new TweenService().setDisplay(numpad.value, 'none');
});

async function start() {
  new TweenService().setDisplay(numpad.value, 'block');
  await new TweenService().fadeIn(numpad.value);
  nextQuestion();
}

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
  createTask();

  if (store.exercise.currentQuestion === 1) {
    store.beginExercise();
  }
  await playAudio();
  inputDisabled.value = false;
}

function createTask() {
  currentAudio.value = [];
  for (let i = 0; i < store.exercise.sequenceLength; i++) {
    const nextNumber = Math.floor(Math.random() * 10);
    currentAudio.value.push({
      src: `sounds/maths/${store.language}_${nextNumber}.mp3`,
      val: nextNumber,
    });
  }
  sequence.value = currentAudio.value.map((v) => v.val);
  if (reverse.value) {
    sequence.value = sequence.value.reverse();
  }
}

function playAudio() {
  return soundService.playAll(currentAudio.value, 100);
}

async function onNumberEntered(num: number) {
  if (inputDisabled.value) {
    return;
  }
  if (num === sequence.value[currentIndex]) {
    inputValue.value = inputValue.value + String(sequence.value[currentIndex]);
    currentIndex++;
    if (currentIndex === store.exercise.sequenceLength) {
      inputDisabled.value = true;
      store.$patch((state) => state.exercise.correctAnswers++);
      new SoundService().playSuccess();
      await exerciseUtils.wait(175); // optimize sound!
      nextQuestion();
    }
  } else {
    exerciseUtils.handleMistake(reveal, numpad);
  }
}

function reveal() {
  revealed.value = true;
  inputDisabled.value = true;
}

const solution = computed(() => sequence.value.join(''));
</script>
