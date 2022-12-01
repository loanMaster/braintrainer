<template>
  <div class="column items-center flex-1 justify-around" >
    <div class="flex-1 column justify-center items-center" v-if="store.exercise.currentQuestion < 1">
      <q-card :style="{ opacity: store.exercise.audioState.playingSequence ? '1' : '0' }" class="transition-duration-md ">
        <div class="text-h5 non-selectable q-pa-sm text-center">
          <div :style="{ color: !store.exercise.audioState.playing ? 'transparent' : 'black' }" class="transition-duration-sm">
            {{ store.exercise.audioState.tag || '...' }}
          </div>
        </div>
        <img :src="currentImage" class="q-pa-sm"/>
      </q-card>
    </div>
    <div ref="coreExercise"  class="column justify-center">
      <div class="flex-1 column justify-center items-center q-mb-md">
        <div class="text-h5 non-selectable q-pa-sm text-center">
          <div>
            {{ 'Wer ist diese Person?' }}
          </div>
        </div>
        <q-card class="transition-duration-md ">
          <img :src="currentImage" class="q-pa-sm" ref="imageToGuess"/>
        </q-card>
      </div>
      <div ref="buttons" class="row q-gutter-sm justify-center">
        <div v-for="(label, idx) in buttonLabels" v-bind:key="idx" class="row">
          <q-btn
            color="primary"
            @click="selectWord(idx, $event)"
            :disabled="inputDisabled"
            class="transition-duration-md"
            >{{ label }}</q-btn
          >
        </div>
      </div>
    </div>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator" />
  <SolutionBanner
    :show="revealed"
    :solution="solution"
    @click="containerClicked"
  />
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import SpeechBubble from 'src/components/exercises/shared/SpeechBubble.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { ExerciseService, Introduction, IntroductionResponse } from "src/shared-services/exercise.service";
import {shuffle} from "src/util/array.utils";
import {padNumber} from "src/util/padNumber";

const {
  soundService,
  revealed,
  destroy,
  t,
  route,
  store,
  inputDisabled,
  containerClicked,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => start(),
});

const currentTask: Ref<IntroductionResponse | undefined> = ref();
const personToGuess: Ref<Introduction | undefined> = ref();
let buttonLabels: Ref<string[]> = ref([])
const coreExercise = ref();
const imageToGuess = ref()
const showLoadingIndicator = ref(false)
let loadAudio: Promise<IntroductionResponse>
const nameToImageMapping: { [key: string]: string } = {}

onBeforeMount(() => {
  const numberOfQuestions = difficulty.value === 'easy' ? 5 : difficulty.value === 'normal' ? 7 : 10;
  exerciseUtils.createExercise(numberOfQuestions);
  loadAudio = new ExerciseService().fetchIntroductions({ lang: store.language, count: numberOfQuestions })
});

const difficulty = computed(() => route.params.difficulty);

onMounted(async () => {
  new TweenService().setDisplay(coreExercise.value, 'none');
});

async function start () {
  showLoadingIndicator.value = true;
  currentTask.value = await loadAudio
  const audio = currentTask.value.introductions.map(i => ({ audio: i.audio.introduction, tag: i.name }))
  const men = shuffle(Array.from(Array(20).keys()))
  const women = shuffle(Array.from(Array(20).keys()))
  currentTask.value.introductions.forEach(i => {
    nameToImageMapping[i.name] = (i.gender === 'FEMALE' ? '/images/w_' + padNumber(women.pop(), 2) : '/images/m_' + padNumber(men.pop(), 2)) + '.jpg'
  })
  showLoadingIndicator.value = false;
  shuffle(currentTask.value.introductions)
  await soundService.playAll(audio, 250)
  await exerciseUtils.wait(100);
  nextQuestion()
}

const currentImage = computed(() =>
  personToGuess?.value?.name ? nameToImageMapping[personToGuess.value.name] :
    nameToImageMapping[store.exercise.audioState.tag] || ''
)

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
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(imageToGuess.value);
  }

  personToGuess.value = currentTask.value!.introductions[store.exercise.currentQuestion - 1]
  buttonLabels.value = personToGuess.value.gender === 'FEMALE' ?
    currentTask.value!.optionalNames['FEMALE'].sort((a, b) => a.localeCompare(b)) : currentTask.value!.optionalNames['MALE'].sort((a, b) => a.localeCompare(b))

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

function selectWord(idx: number, $event: Event) {
  $event.stopPropagation();
  if (personToGuess.value!.name === buttonLabels.value[idx]) {
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
