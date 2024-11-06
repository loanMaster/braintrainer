<template>
  <div class="column items-center flex-1 justify-around">
    <div ref="coreExercise" class="column flex-1 justify-around q-mb-sm">
      <div class="relative-position flex justify-center">
        <InlineSvg
          ref="worldMap"
          style="max-width: 100%; width: 100vw; max-height: 55vh"
          src="images/world-map.svg"
          fill="black"
        >
        </InlineSvg>
        <div class="absolute-full column justify-center items-center">
          <SpeechBubble
            :show="store.exercise.audioState.playing"
            :text="country"
            :transparentText="!store.exercise.audioState.playing"
          />
        </div>
      </div>
      <SkipRepeatButtons />
      <div
        style="flex: 1 1 0"
        class="flex align-center content-center"
        ref="exerciseButtons"
      >
        <div ref="letterButtonsWrapper" class="flex-1 justify-center">
          <LetterButtons
            ref="letterButtons"
            :numberOfButtons="numberOfLetterButtons"
            :disabled="inputDisabled"
            :style="{ display: activeButtons === 'letter' ? 'flex' : 'none' }"
            @letter-selected="onLetterEntered"
          />
        </div>
        <div
          class="row q-gutter-sm justify-center flex-1 full-width"
          ref="wordButtons"
          :style="{ display: activeButtons === 'word' ? 'flex' : 'none' }"
        >
          <div
            v-for="(label, idx) in buttonLabels"
            v-bind:key="idx"
            class="row"
          >
            <q-btn
              color="primary"
              @click="selectWord(idx, $event)"
              :disabled="inputDisabled"
              :data-test="
                isCorrectButton(idx) ? 'correct-button' : 'incorrect-button'
              "
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
    </div>
    <LoadingIndicator :showing="showLoadingIndicator" />
  </div>
</template>

<script setup lang="ts">
import SkipRepeatButtons from 'src/components/exercises/shared/SkipRepeatButtons.vue';
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import SpeechBubble from 'src/components/exercises/shared/SpeechBubble.vue';
import LetterButtons from 'src/components/exercises/shared/LetterButtons.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useRouter } from 'vue-router';
import InlineSvg from 'vue-inline-svg';
import {
  CountryAndCapital,
  GeographyService,
} from './service/countries.service';
import { preloadAudio } from 'src/util/preload-assets';
import { useAppStore } from 'stores/app-store';

const { soundService, revealed, store, inputDisabled, onSolutionConfirmed } =
  createExerciseContext({
    playAudioCb: () => playAudio(),
    nextQuestionCb: () => nextQuestion(),
    startCb: () => start(),
    skipCb: () => reveal(),
  });

const task: Ref<CountryAndCapital[]> = ref([]);
let buttonLabels: Ref<string[]> = ref([]);
const wordButtons = ref();
const worldMap = ref();
const coreExercise = ref();
let showLoadingIndicator = ref(false);
const router = useRouter();
const letterButtons = ref();
const letterButtonsWrapper = ref();
const exerciseButtons = ref();
const activeButtons: Ref<'letter' | 'word'> = ref('letter');

onBeforeMount(() => {
  exerciseUtils.createExercise();
});

onMounted(async () => {
  new TweenService().setDisplay(coreExercise.value, 'none');
});

async function start() {
  showLoadingIndicator.value = true;
  task.value = new GeographyService().getCountriesAndGeographies(
    store.language,
    store.exercise.totalQuestions
  );
  await preloadAudio(
    task.value.map((c) => `sounds/countries/${store.language}_${c.country}.mp3`)
  );
  showLoadingIndicator.value = false;

  store.beginExercise();

  nextQuestion();
}

function updateButtons() {
  let capitalOptions = [getCurrentTask().capital];
  if (store.exercise.difficulty !== 'normal') {
    capitalOptions.push(
      ...new GeographyService().getCapitalsByFirstLetter(
        store.language,
        getCurrentTask().capital[0]
      )
    );
  }
  capitalOptions = [...new Set(capitalOptions)];
  do {
    const randomCapital = new GeographyService().getRandomCapital(
      store.language
    );
    if (capitalOptions.indexOf(randomCapital) === -1) {
      capitalOptions.push(randomCapital);
    }
  } while (capitalOptions.length < 5);
  capitalOptions = capitalOptions.splice(0, 5);
  capitalOptions.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  buttonLabels.value = capitalOptions;
  letterButtons.value.showAtLeast([getCurrentTask().capital[0]]);
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
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(exerciseButtons.value);
    activeButtons.value =
      store.exercise.difficulty === 'normal' ? 'word' : 'letter';
    updateButtons();
  } else {
    updateButtons();
    activeButtons.value =
      store.exercise.difficulty === 'normal' ? 'word' : 'letter';
    new TweenService().setDisplay(coreExercise.value, 'flex');
  }
  await new TweenService().fadeIn(exerciseButtons.value);
  highlightCountry(getCurrentTask().countryEn);
  await playAudio();
}

async function playAudio() {
  await soundService.play({
    src: `sounds/countries/${store.language}_${country.value}.mp3`,
    meta: { tag: country.value },
  });
}

function highlightCountry(countryName: string) {
  const circle = worldMap.value.$el.querySelector('circle.highlight');
  circle.setAttribute('stroke', 'none');
  const highlighted = [...worldMap.value.$el.querySelectorAll('[fill="red"]')];
  highlighted.forEach((h: HTMLElement) => h.removeAttribute('fill'));
  const country: HTMLElement = [
    ...worldMap.value.$el.querySelectorAll('title'),
  ].find((t: HTMLElement) => t.innerHTML === countryName);
  if (!country) {
    console.log(`country not fount ${countryName}`);
  } else {
    const parent: SVGGElement = country.parentElement! as any;
    parent.setAttribute('fill', 'red');
    const box = parent.getBBox();
    if (box.width < 50 || box.height < 50) {
      circle.setAttribute('stroke', 'red');
      circle.setAttribute('cx', Math.floor(box.x + box.width / 2));
      circle.setAttribute('cy', Math.floor(box.y + box.height / 2));
      circle.setAttribute('r', Math.max(box.width, box.height) + 5);
    }
  }
}

function isCorrectButton(idx: number) {
  return buttonLabels.value[idx] === getCurrentTask().capital;
}

function onLetterEntered(letter: string) {
  if (inputDisabled.value) {
    return;
  }
  if (
    task.value.length === 0 ||
    task.value.length < store.exercise.currentQuestion ||
    store.exercise.currentQuestion === 0
  ) {
    return;
  }
  if (letter === getCurrentTask().capital[0]) {
    activeButtons.value = 'word';
  } else {
    handleMistake(reveal, letterButtonsWrapper);
  }
}

async function selectWord(idx: number, $event: Event) {
  if (inputDisabled.value) {
    return;
  }
  $event.stopPropagation();
  if (isCorrectButton(idx)) {
    inputDisabled.value = true;
    store.$patch((store) => store.exercise.correctAnswers++);
    new SoundService().playSuccess();
    await exerciseUtils.wait(250);
    nextQuestion();
  } else {
    handleMistake(reveal, wordButtons);
  }
}

function handleMistake(reveal: () => any, elementToWiggle: Ref<HTMLElement>) {
  if (useAppStore().strike()) {
    new SoundService().playError();
    reveal();
  }
  new TweenService().wiggle(elementToWiggle.value);
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
}

function getCurrentTask() {
  if (
    task.value.length === 0 ||
    task.value.length < store.exercise.currentQuestion ||
    store.exercise.currentQuestion === 0
  ) {
    return {} as CountryAndCapital;
  }
  return task.value[store.exercise.currentQuestion - 1];
}

const solution = computed(() => {
  return getCurrentTask().capital;
});

const country = computed(() => {
  return getCurrentTask().country;
});

const numberOfLetterButtons = computed(() => {
  return store.exercise.difficulty === 'veryhard' ? 6 : 2;
});
</script>
