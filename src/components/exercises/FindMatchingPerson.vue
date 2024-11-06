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
            {{ store.exercise.audioState.meta?.text || '...' }}
          </div>
        </div>
        <img :src="currentImage" class="q-pa-sm" />
      </q-card>
    </div>
    <div ref="coreExercise" class="column justify-center">
      <SkipRepeatButtons />
      <q-card>
        <div class="text-h5 non-selectable text-center q-mt-sm q-mx-sm">
          <div>
            {{ $t('Find the matching person') }}
          </div>
        </div>
        <div
          class="q-pa-sm relative-position"
          :data-test="solution"
          data-testid="core-exercise"
        >
          <q-carousel swipeable animated v-model="slide" thumbnails infinite>
            <q-carousel-slide
              v-for="person in options"
              :name="person"
              :key="person"
              :img-src="person"
            >
            </q-carousel-slide>
          </q-carousel>
        </div>
        <div class="q-mx-auto text-center">
          <q-btn
            color="primary"
            @click="onImageSelected"
            data-testid="select-image-button"
            :disable="inputDisabled"
            >Weiter</q-btn
          >
        </div>
      </q-card>
    </div>
  </div>
  <SolutionBanner :show="revealed" @confirmed="onSolutionConfirmed">
    <q-avatar>
      <img :src="solution" />
    </q-avatar>
  </SolutionBanner>
</template>

<script setup lang="ts">
import SkipRepeatButtons from 'src/components/exercises/shared/SkipRepeatButtons.vue';
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import { SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import {} from 'src/shared-services/exercise.service';
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
  store,
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
let options: Ref<string[]> = ref([]);
const slide = ref('');
const coreExercise = ref();
const showLoadingIndicator = ref(false);
const nameToImageMapping: { [key: string]: string } = {};
const router = useRouter();

onBeforeMount(() => {
  exerciseUtils.createExercise();
  currentTask.value = new PersonIntroductionService().createIntroductions(
    store.language,
    store.exercise.totalQuestions
  );
});

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
        ? 'images/w_' + padNumber(women.pop()!, 2)
        : 'images/m_' + padNumber(men.pop()!, 2)) + '.jpg';
  });
  await preloadAssets(Object.values(nameToImageMapping));
  await exerciseUtils.wait(1000);
  showLoadingIndicator.value = false;
  shuffle(currentTask.value!.introductions);
  store.beginExercise();
  await speechService.playAll(speech, 100);
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
    await new TweenService().fadeOut(coreExercise.value);
  }

  personToGuess.value =
    currentTask.value!.introductions[store.exercise.currentQuestion - 1];
  options.value = [nameToImageMapping[personToGuess.value.name]];
  options.value.push(
    ...currentTask
      .value!.introductions.filter(
        (i) => i.gender === personToGuess.value!.gender
      )
      .map((i) => nameToImageMapping[i.name])
  );
  options.value = [...new Set(options.value)].splice(0, 4);
  while (options.value.length < 4) {
    const randomIdx = Math.floor(Math.random() * 20);
    const randomImage = `images/${
      personToGuess.value.gender === 'FEMALE' ? 'w' : 'm'
    }_${padNumber(randomIdx, 2)}.jpg`;
    if (options.value.indexOf(randomImage) === -1) {
      options.value.push(randomImage);
    }
  }
  options.value = shuffle(options.value);
  slide.value = options.value[0];

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
  }
  await new TweenService().fadeIn(coreExercise.value);

  inputDisabled.value = false;
  await playAudio();
}

async function playAudio() {
  if (personToGuess.value && personToGuess.value.name) {
    return speechService.say(personToGuess.value.name);
  }
}

function onImageSelected() {
  if (nameToImageMapping[personToGuess.value!.name] === slide.value) {
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

const solution = computed(
  () => nameToImageMapping[personToGuess?.value?.name || '']
);
</script>
