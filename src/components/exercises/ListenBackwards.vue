<template>
  <div ref="buttons" class="row q-gutter-sm justify-center" data-testid="exercise-buttons">
    <div v-for="(label, idx) in buttonLabels" v-bind:key="idx" class="row">
      <q-btn
        color="primary"
        @click="selectWord(label, $event)"
        :disabled="inputDisabled"
        :data-test="(isDev && solution === label) ? 'correct-button' : 'incorrect-button'"
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
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import { takeUntil } from 'rxjs';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { SoundService } from 'src/shared-services/sound.service';
import { computed, onBeforeMount, onMounted, ref, Ref } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { TweenService } from 'src/shared-services/tween.service';
import {
  AudioResponse,
  ExerciseService,
} from 'src/shared-services/exercise.service';
import { ReplaySubject, Subject, take } from 'rxjs';
import { skip } from 'rxjs/operators';
import { shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';

const {
  soundService,
  revealed,
  destroy,
  store,
  inputDisabled,
  onSolutionConfirmed,
  isDev,
  route,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

let nextAudio: Subject<AudioResponse>;
let currentAudio: Ref<AudioResponse | undefined> = ref(undefined);
const buttons = ref();
const showLoadingIndicator = ref(false);
const router = useRouter();
const buttonLabels: Ref<string[]> = ref([]);

onBeforeMount(() => {
  const numberOfQuestions = 10;
  exerciseUtils.createExercise(numberOfQuestions);
  nextAudio = new ReplaySubject<AudioResponse>(numberOfQuestions);
  nextAudio
    .pipe(take(numberOfQuestions), takeUntil(destroy))
    .subscribe(() => loadNextAudio());
  loadNextAudio();
});

const numberOfOptions = computed(() => {
  return difficulty.value === 'easy'
    ? 4
    : difficulty.value === 'normal'
    ? 6
    : 8;
});

const difficulty = computed(() => exerciseUtils.difficulty(route)!);

onMounted(async () => {
  new TweenService().setDisplay(buttons.value, 'none');
  for (let idx = 0; idx < numberOfOptions.value; idx++) {
    buttonLabels.value.push('?');
  }
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
    await new TweenService().fadeOut(buttons.value);
  }
  showLoadingIndicator.value = true;
  currentAudio.value = await nextAudio
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise();
  showLoadingIndicator.value = false;

  const permutation = shuffle(Array.from(Array(numberOfOptions.value).keys()));
  const alts: string[] = (currentAudio.value as AudioResponse).alts as string[];
  for (let idx = 0; idx < numberOfOptions.value; idx++) {
    buttonLabels.value[idx] = alts[permutation[idx]];
  }

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(buttons.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(buttons.value);
  await playAudio(true);
  inputDisabled.value = false;
}

async function playAudio(measureTime = false) {
  await soundService.play({
    ...(currentAudio.value as AudioResponse),
    meta: { measureTime },
  });
}

async function loadNextAudio(): Promise<void> {
  nextAudio.next(
    await new ExerciseService().fetchWordsBackwards({
      minLength:
        difficulty.value === 'easy' ? 3 : difficulty.value === 'normal' ? 4 : 5,
      maxLength:
        difficulty.value === 'easy'
          ? 5
          : difficulty.value === 'normal'
          ? 6
          : 20,
      lang: store.language,
      number: numberOfOptions.value,
    })
  );
}

async function selectWord(label: string, $event: Event) {
  $event.stopPropagation();
  if (
    (currentAudio.value?.val as string).toUpperCase() === label.toUpperCase()
  ) {
    inputDisabled.value = true;
    new SoundService().playSuccess();
    store.$patch((store) => store.exercise.correctAnswers++);
    await exerciseUtils.wait(200);
    new TweenService().fadeOut(buttons.value);
    nextQuestion();
  } else {
    exerciseUtils.handleMistake(reveal, buttons);
  }
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}

const solution = computed(() => {
  return currentAudio.value?.val;
});
</script>
