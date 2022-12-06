<template>
  <div ref="numpad" class="relative-position">
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

const {
  soundService,
  revealed,
  destroy,
  route,
  store,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
});

let currentIndex = 0;
const inputValue = ref('');

const currentAudio: Ref<{ src: string; val: number }[]> = ref([]);

const numpad = ref();

const sequenceLength = computed(() => {
  return exerciseUtils.difficulty(route) === 'easy'
    ? 6
    : exerciseUtils.difficulty(route) === 'normal'
    ? 8
    : 10;
});

onBeforeMount(() => {
  const numberOfQuestions = 5;
  exerciseUtils.createExercise(numberOfQuestions);
});

onMounted(async () => {
  keyInput.pipe(takeUntil(destroy)).subscribe((key) => {
    if (revealed.value) {
      nextQuestion();
      return;
    }
    const number = Number(key.key);
    if (!isNaN(number)) {
      onNumberEntered(number);
    }
  });

  inputDisabled.value = true;
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
    }))
  ) {
    return;
  }
  createTask();
  await playAudio();
  inputDisabled.value = false;
}

function createTask() {
  currentAudio.value = [];
  for (let i = 0; i < sequenceLength.value; i++) {
    const nextNumber = Math.floor(Math.random() * 10);
    currentAudio.value.push({
      src: `/sounds/${store.language}_${nextNumber}.mp3`,
      val: nextNumber,
    });
  }
}

function playAudio() {
  return soundService.playAll(currentAudio.value, 100);
}

async function onNumberEntered(num: number) {
  if (revealed.value) {
    nextQuestion();
  }
  if (inputDisabled.value) {
    return;
  }
  if (num === currentAudio.value[currentIndex].val) {
    inputValue.value =
      inputValue.value + String(currentAudio.value[currentIndex].val);
    currentIndex++;
    if (currentIndex === sequenceLength.value) {
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

const solution = computed(() => {
  let temp = inputValue.value;
  for (let i = temp.length; i < sequenceLength.value; i++) {
    temp += String(currentAudio.value[i]?.val);
  }
  return temp;
});
</script>
