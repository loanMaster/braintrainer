<template>
  <div ref="buttons" class="max-width-xs row wrap justify-center">
    <SkipRepeatButtons :disabled="inputDisabled" />
    <div
      class="max-width-xs row wrap justify-center q-gutter-sm"
      :data-test="solution"
      data-testid="core-exercise"
    >
      <div v-for="(label, idx) in buttonLabels" v-bind:key="idx">
        <q-btn
          color="primary"
          :class="textTransparent ? 'text-transparent' : ''"
          @click="selectWord(idx, $event)"
          :data-testid="'button-' + label"
          :disabled="isButtonDisabled(idx)"
          class="transition-duration-md"
          >{{ label }}</q-btn
        >
      </div>
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
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { ExerciseService } from 'src/shared-services/exercise.service';
import { shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';

const {
  soundService,
  speechService,
  revealed,
  store,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
  skipCb: () => reveal(),
});

const currentIndex = ref(0);
const permutation: Ref<number[]> = ref([]);
const currentExercise: Ref<string[]> = ref([]);
const sequence: Ref<string[]> = ref([]);
const reverse = ref(false);
const buttonLabels: Ref<string[]> = ref([]);
const buttons = ref();
const textTransparent = ref(false);
const router = useRouter();

onBeforeMount(() => {
  exerciseUtils.createExercise();
});

onMounted(async () => {
  reverse.value = store.exercise.nameOfTheGame.indexOf('-rev') > -1;

  new TweenService().setDisplay(buttons.value, 'none');
  for (let idx = 0; idx < sequenceLength.value; idx++) {
    buttonLabels.value.push('?');
  }
});

const sequenceLength = computed(() => {
  return store.exercise.sequenceLength!;
});

async function nextQuestion() {
  currentIndex.value = 0;
  textTransparent.value = true;
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
    await new TweenService().fadeOut(buttons.value);
  }
  currentExercise.value = getNextExercise();
  sequence.value = currentExercise.value.map((v) => v as string);
  if (reverse.value) {
    sequence.value = sequence.value.reverse();
  }

  permutation.value = shuffle(Array.from(Array(sequenceLength.value).keys()));

  for (let idx = 0; idx < sequenceLength.value; idx++) {
    buttonLabels.value[permutation.value[idx]] = sequence.value[idx];
  }

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(buttons.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(buttons.value);

  await playAudio();
  textTransparent.value = false;
  inputDisabled.value = false;
}

async function playAudio() {
  await speechService.say(
    Array.from(currentExercise.value)
      .splice(currentIndex.value, currentExercise.value.length)
      .join('. ')
  );
}

function getNextExercise(): string[] {
  return new ExerciseService().getRandomWords({
    minLength: store.exercise.minLength!,
    maxLength: store.exercise.maxLength!,
    lang: store.language,
    number: sequenceLength.value,
  });
}

function selectWord(idx: number, $event: Event) {
  $event.stopPropagation();
  if (idx === permutation.value[currentIndex.value]) {
    currentIndex.value++;
    if (currentIndex.value === sequenceLength.value) {
      inputDisabled.value = true;
      store.$patch((store) => store.exercise.correctAnswers++);
      new TweenService().fadeOut(buttons.value);
      new SoundService().playSuccess();
      nextQuestion();
    }
  } else {
    exerciseUtils.handleMistake(reveal, buttons);
  }
}

function isButtonDisabled(idx: number) {
  return (
    inputDisabled.value || permutation.value.indexOf(idx) < currentIndex.value
  );
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}

const solution = computed(() => {
  return sequence.value.join(' - ');
});
</script>
