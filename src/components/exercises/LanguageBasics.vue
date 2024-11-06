<template>
  <div ref="coreExercise" class="column items-center flex-1 justify-around">
    <div
      class="flex-1 column justify-center items-center"
      v-if="store.exercise.currentQuestion < 1"
    >
      <div ref="languageIndicator" class="text-h5" v-if="!showSpeechBubble">
        <span v-if="task?.lang">{{
          $t('languageBasics.Today: lang', {
            lang: $t('languageBasics.' + task.lang),
          })
        }}</span>
      </div>
      <div
        class="column q-gutter-md items-center justify-center"
        v-if="showSpeechBubble"
      >
        <SpeechBubble
          style="background-color: lightblue"
          :show="showSpeechBubble"
          :transparentText="!showSpeechBubbleText"
          :text="currentAudio?.val || '...'"
        />
        <SpeechBubble
          :show="showSpeechBubble"
          :transparentText="!showSpeechBubbleText"
          :text="$t('languageBasics.' + currentAudio?.key)"
        />
      </div>
    </div>
    <div class="position-relative">
      <div class="column q-gutter-md" ref="buttons">
        <SpeechBubble
          class="self-center"
          style="background-color: lightblue"
          :show="true"
          :transparentText="false"
          :text="currentAudio?.val || '...'"
        />
        <SkipRepeatButtons />
        <div
          class="max-width-xs row wrap justify-center q-gutter-sm"
          :data-test="solution"
          style="margin-top: 0"
          data-testid="core-exercise"
        >
          <div v-for="(label, idx) in buttonLabels" v-bind:key="idx">
            <q-btn
              color="primary"
              @click="selectWord(idx, $event)"
              :data-testid="'button-' + label"
              :disabled="isButtonDisabled(idx)"
              class="transition-duration-md"
              >{{ $t('languageBasics.' + label) }}</q-btn
            >
          </div>
        </div>
      </div>
      <LoadingIndicator :showing="showLoadingIndicator" />
      <SolutionBanner
        :show="revealed"
        :solution="solution"
        @confirmed="onSolutionConfirmed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import SkipRepeatButtons from 'src/components/exercises/shared/SkipRepeatButtons.vue';
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import SpeechBubble from 'src/components/exercises/shared/SpeechBubble.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import {
  ExerciseService,
  LanguageBasics,
} from 'src/shared-services/exercise.service';
import { shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { preloadAudio } from 'src/util/preload-assets';

const {
  soundService,
  revealed,
  route,
  store,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
  skipCb: () => reveal(),
});

const { t } = useI18n();
let permutation: Ref<number[]> = ref([]);
const task: Ref<LanguageBasics | undefined> = ref(undefined);
let buttonLabels: Ref<string[]> = ref([]);
const buttons = ref();
let showLoadingIndicator = ref(false);
const languageIndicator = ref();
const router = useRouter();
const showSpeechBubble = ref(false);
const showSpeechBubbleText = ref(false);
const currentAudio: Ref<{ val: string; key: string; src: string } | undefined> =
  ref(undefined);

onBeforeMount(() => {
  exerciseUtils.createExercise();
});

const difficulty = computed(() => route.params.difficulty);

onMounted(async () => {
  new TweenService().setDisplay(buttons.value, 'none');
  new TweenService().setDisplay(languageIndicator.value, 'none');
});

async function start() {
  showLoadingIndicator.value = true;
  task.value = loadTask();

  showLoadingIndicator.value = false;

  await exerciseUtils.wait(500);
  new TweenService().setDisplay(languageIndicator.value, 'block');
  await new TweenService().fadeIn(languageIndicator.value, 1);
  await Promise.all([
    exerciseUtils.wait(1500),
    preloadAudio(task.value.words.map((t) => t.src)),
  ]);
  await new TweenService().fadeOut(languageIndicator.value, 1);

  if (difficulty.value !== 'veryhard') {
    showSpeechBubble.value = true;
    for (let idx = 0; idx < task.value.words.length; idx++) {
      currentAudio.value = task.value.words[idx];
      showSpeechBubbleText.value = true;
      await exerciseUtils.wait(500);
      await soundService.play({ src: currentAudio.value.src });
      await exerciseUtils.wait(500);
      showSpeechBubbleText.value = false;
      await exerciseUtils.wait(500);
    }
    showSpeechBubble.value = false;
  }

  store.beginExercise();

  shuffle(task.value.words);
  permutation.value = shuffle(
    Array.from(Array(store.exercise.totalQuestions).keys())
  );
  for (let idx = 0; idx < store.exercise.totalQuestions; idx++) {
    buttonLabels.value[idx] = task.value!.words[permutation.value[idx]].key;
  }
  nextQuestion();
}

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
  inputDisabled.value = false;

  currentAudio.value = task.value!.words[store.exercise.currentQuestion - 1];

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(buttons.value, 'flex');
    await new TweenService().fadeIn(buttons.value);
  }

  await playAudio();
}

async function playAudio() {
  await soundService.playAll([{ src: currentAudio.value!.src }], 0);
}

function loadTask(): LanguageBasics {
  const result = new ExerciseService().getLanguageBasics(
    difficulty.value as string
  );
  const sub = shuffle(result.words).splice(0, store.exercise.totalQuestions);
  return {
    lang: result.lang,
    words: sub,
  };
}

async function selectWord(idx: number, $event: Event) {
  if (inputDisabled.value) {
    return;
  }
  $event.stopPropagation();
  if (buttonLabels.value[idx] === currentAudio.value!.key) {
    inputDisabled.value = true;
    store.$patch((store) => store.exercise.correctAnswers++);
    new SoundService().playSuccess();
    await exerciseUtils.wait(250);
    nextQuestion();
  } else {
    exerciseUtils.handleMistake(reveal, buttons);
  }
}

function isButtonDisabled(idx: number) {
  return permutation.value[idx] < store.exercise.currentQuestion - 1;
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}

const solution = computed(() => {
  if (!currentAudio.value) {
    return '';
  }
  return `${t('languageBasics.' + currentAudio.value!.key)} - ${
    currentAudio.value!.val
  }`;
});
</script>
