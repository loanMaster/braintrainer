<template>
  <div class="column items-center flex-1 justify-around">
    <div
      class="flex-1 column justify-center items-center"
      v-if="store.exercise.currentQuestion < 1"
    >
      <q-card
        :style="{
          opacity: store.exercise.audioState.playingSequence ? '1' : '0',
        }"
        class="transition-duration-md"
      >
        <div class="text-h5 non-selectable q-pa-sm text-center">
          <div
            :style="{
              color: !store.exercise.audioState.playing
                ? 'transparent'
                : undefined,
            }"
            class="transition-duration-sm"
          >
            {{ store.exercise.audioState.meta.text || '...' }}
          </div>
        </div>
        <img :src="currentImage" class="q-pa-sm" />
      </q-card>
    </div>
    <div ref="coreExercise" class="column justify-center">
      <div class="flex-1 column justify-center items-center q-mb-md">
        <div class="text-h5 non-selectable q-pa-sm text-center">
          <div>
            {{ $t('Who is this person?') }}
          </div>
        </div>
        <q-card class="transition-duration-md">
          <img :src="currentImage" class="q-pa-sm" ref="imageToGuess" />
        </q-card>
      </div>
      <div
        ref="buttons"
        class="row q-gutter-sm justify-center"
        data-testid="exercise-buttons"
      >
        <div v-for="(label, idx) in buttonLabels" v-bind:key="idx" class="row">
          <q-btn
            color="primary"
            @click="selectWord(idx, $event)"
            :disabled="inputDisabled"
            :data-test="
              isDev && isCorrectButton(idx)
                ? 'correct-button'
                : 'incorrect-button'
            "
            class="transition-duration-md"
            >{{ label }}</q-btn
          >
        </div>
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
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { shuffle } from 'src/util/array.utils';
import { padNumber } from 'src/util/format-number';
import { preloadAssets } from 'src/util/preload-assets';
import { useRouter } from 'vue-router';
import {
  Introduction,
  Introductions,
  PersonIntroductionService,
} from 'src/shared-services/person-introduction.service';

const {
  soundService,
  speechService,
  revealed,
  route,
  store,
  isDev,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
  skipCb: () => reveal(),
});

const currentTask: Ref<Introductions | undefined> = ref();
const personToGuess: Ref<Introduction | undefined> = ref();
let buttonLabels: Ref<string[]> = ref([]);
const coreExercise = ref();
const imageToGuess = ref();
const showLoadingIndicator = ref(false);
const nameToImageMapping: { [key: string]: string } = {};
const router = useRouter();

onBeforeMount(() => {
  const numberOfQuestions =
    difficulty.value === 'normal' ? 5 : difficulty.value === 'hard' ? 7 : 10;
  exerciseUtils.createExercise(numberOfQuestions);
  currentTask.value = new PersonIntroductionService().createIntroductions(
    store.language,
    numberOfQuestions
  );
});

const difficulty = computed(() => route.params.difficulty);

onMounted(async () => {
  new TweenService().setDisplay(coreExercise.value, 'none');
});

async function start() {
  showLoadingIndicator.value = true;
  const speech = currentTask.value!.introductions.map((i) => ({
    text: i.text,
    meta: { text: i.name },
  }));
  const men = shuffle(Array.from(Array(20).keys()));
  const women = shuffle(Array.from(Array(20).keys()));
  currentTask.value!.introductions.forEach((i) => {
    nameToImageMapping[i.name] =
      (i.gender === 'FEMALE'
        ? '/images/w_' + padNumber(women.pop()!, 2)
        : '/images/m_' + padNumber(men.pop()!, 2)) + '.jpg';
  });
  await preloadAssets(Object.values(nameToImageMapping));
  showLoadingIndicator.value = false;
  shuffle(currentTask.value!.introductions);
  await exerciseUtils.wait(1000);
  store.beginExercise();
  await speechService.playAll(speech, 100, true);
  await exerciseUtils.wait(150);
  nextQuestion();
}

const currentImage = computed(() =>
  personToGuess?.value?.name
    ? nameToImageMapping[personToGuess.value.name]
    : nameToImageMapping[store.exercise.audioState.meta.text as string] || ''
);

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
    await new TweenService().fadeOut(imageToGuess.value);
  }

  personToGuess.value =
    currentTask.value!.introductions[store.exercise.currentQuestion - 1];
  buttonLabels.value =
    personToGuess.value.gender === 'FEMALE'
      ? currentTask.value!.optionalNames['FEMALE'].sort((a, b) =>
          a.localeCompare(b)
        )
      : currentTask.value!.optionalNames['MALE'].sort((a, b) =>
          a.localeCompare(b)
        );

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
    await new TweenService().fadeIn(coreExercise.value);
  } else {
    await new TweenService().fadeIn(imageToGuess.value);
  }

  inputDisabled.value = false;
  await playAudio();
}

async function playAudio() {
  // no-op
}

function isCorrectButton(idx: number) {
  return personToGuess.value!.name === buttonLabels.value[idx];
}

function selectWord(idx: number, $event: Event) {
  $event.stopPropagation();
  if (isCorrectButton(idx)) {
    inputDisabled.value = true;
    store.$patch((store) => store.exercise.correctAnswers++);
    new SoundService().playSuccess();
    nextQuestion();
  } else {
    exerciseUtils.handleMistake(reveal, coreExercise);
  }
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}

const solution = computed(() => personToGuess?.value?.name || '');
</script>
