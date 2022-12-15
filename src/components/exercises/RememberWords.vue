<template>
  <div ref="buttons" class="max-width-xs row wrap justify-center q-gutter-sm">
    <div v-for="(label, idx) in buttonLabels" v-bind:key="idx">
      <q-btn
        color="primary"
        :class="textTransparent ? 'text-transparent' : ''"
        @click="selectWord(idx, $event)"
        :disabled="isButtonDisabled(idx)"
        class="transition-duration-md"
        >{{ label }}</q-btn
      >
    </div>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
  <SolutionBanner
    :show="revealed"
    :solution="solution"
    @confirmed="onSolutionConfirmed"
  />
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import {
  AudioResponse,
  ExerciseService,
} from 'src/shared-services/exercise.service';
import { skip, take, takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import { shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';

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
  startCb: () => nextQuestion(),
});

let currentIndex = ref(0);

let permutation: Ref<number[]> = ref([]);
let nextAudio: Subject<AudioResponse[]>;
let currentAudio: Ref<AudioResponse[]> = ref([]);
const sequence: Ref<string[]> = ref([]);
const reverse = ref(false);
let buttonLabels: Ref<string[]> = ref([]);
const buttons = ref();
const textTransparent = ref(false);
let showLoadingIndicator = ref(false);
const router = useRouter();

onBeforeMount(() => {
  const numberOfQuestions = 5;
  exerciseUtils.createExercise(numberOfQuestions);
  nextAudio = new ReplaySubject<AudioResponse[]>(numberOfQuestions);
  nextAudio
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe(() => loadNextAudio());
  loadNextAudio();
});

const difficulty = computed(() => route.params.difficulty);

onMounted(async () => {
  reverse.value = store.exercise.nameOfTheGame.indexOf('-rev') > -1;

  new TweenService().setDisplay(buttons.value, 'none');
  for (let idx = 0; idx < sequenceLength.value; idx++) {
    buttonLabels.value.push('?');
  }
});

const sequenceLength = computed(() => {
  return difficulty.value === 'easy'
    ? 6
    : difficulty.value === 'normal'
    ? 9
    : 12;
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
  showLoadingIndicator.value = true;
  currentAudio.value = (await nextAudio
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise()) as AudioResponse[];
  sequence.value = currentAudio.value.map((v) => v.val as string);
  if (reverse.value) {
    sequence.value = sequence.value.reverse();
  }
  showLoadingIndicator.value = false;

  permutation.value = shuffle(Array.from(Array(sequenceLength.value).keys()));

  for (let idx = 0; idx < sequenceLength.value; idx++) {
    buttonLabels.value[permutation.value[idx]] = sequence.value[idx];
  }

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(buttons.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(buttons.value);

  await playAudio(true);
  textTransparent.value = false;
  inputDisabled.value = false;
}

async function playAudio(measureTime = false) {
  await soundService.playAll(currentAudio.value, 100, measureTime);
}

async function loadNextAudio(): Promise<void> {
  nextAudio.next(
    await new ExerciseService().fetchRandomWords({
      minLength: 3,
      maxLength: 12,
      lang: store.language,
      number: sequenceLength.value,
      gender: 'FEMALE',
    })
  );
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
