<template>
  <div ref="coreExercise" class="column items-center flex-1 justify-around">
    <div class="flex-1 row justify-center items-center">
      <SpeechBubble
        :show="store.exercise.audioState.playingSequence"
        :transparentText="!store.exercise.audioState.playing"
        :text="store.exercise.audioState.meta.text || '...'"
      />
    </div>
    <CountdownTimer :totalTime="10000" ref="countdownTimer" @timeout="reveal" />
    <div style="flex: 2">
      <div class="text-h5 q-my-md row justify-center">
        {{ whoIs }}
      </div>
      <div
        ref="buttons"
        class="max-width-xs row wrap justify-center q-gutter-sm"
      >
        <div
          v-for="(option, idx) in buttonOptions"
          v-bind:key="idx"
          class="row"
        >
          <q-btn
            color="primary"
            @click="selectWord(idx, $event)"
            :disabled="inputDisabled"
            class="transition-duration-md"
            >{{ $t('findRelatives.my_' + option) }}</q-btn
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
import CountdownTimer from 'src/components/exercises/shared/CountdownTimer.vue';
import SpeechBubble from 'src/components/exercises/shared/SpeechBubble.vue';
import { Sound, SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useAppStore } from 'stores/app-store';
import { RelativesService } from 'components/exercises/service/relatives.service';
import { randomElement, shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';

const {
  soundService,
  revealed,
  t,
  route,
  store,
  inputDisabled,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

let currentTask: Ref<
  | {
      queue: string[];
      solutions: string[];
      audio: Sound[];
      texts: string[];
    }
  | undefined
> = ref();

const male_names = ['Bob', 'Charlie', 'David'];
const female_names = ['Alice', 'Eve', 'Judy'];

const relations = [
  'Grandmother',
  'Grandfather',
  'Mother',
  'Father',
  'Uncle',
  'Aunt',
  'Cousin',
  'You',
  'Brother',
  'Sister',
  'Son',
  'Daughter',
  'Niece',
  'Nephew',
  'Grandchild',
];
let buttonOptions: Ref<string[]> = ref([]);
const coreExercise = ref();
const character = ref(male_names[0]);
const countdownTimer = ref();
const router = useRouter();

onBeforeMount(() => {
  const numberOfQuestions = 5;
  exerciseUtils.createExercise(numberOfQuestions);
});

const difficulty = computed(() => route.params.difficulty);

onMounted(async () => {
  new TweenService().setDisplay(coreExercise.value, 'none');
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
    await new TweenService().fadeOut(coreExercise.value);
  }
  countdownTimer.value?.reset();

  const relativesService = new RelativesService();
  const task = relativesService.createRelationshipTree(
    difficulty.value as string
  );
  character.value =
    task.gender === 'f'
      ? female_names[Math.floor(Math.random() * female_names.length)]
      : male_names[Math.floor(Math.random() * male_names.length)];
  const texts = [
    t('findRelatives.{name}_is', {
      name: t('findRelatives.' + character.value),
    }),
    t('findRelatives.subj_' + task.queue[0]),
  ];
  for (let i = 1; i < task.queue.length - 1; i++) {
    texts.push(t('findRelatives.poss_' + task.queue[i]));
  }
  texts.push(t('findRelatives.of_your_' + task.queue[task.queue.length - 1]));

  buttonOptions.value = [...task.solutions];
  while (buttonOptions.value.length < 5) {
    const randomRelative = randomElement(relations);
    if (
      buttonOptions.value.indexOf(randomRelative) === -1 &&
      (relativesService.getGender(randomRelative) === 'n' ||
        relativesService.getGender(randomRelative) === task.gender)
    ) {
      buttonOptions.value.push(randomRelative);
    }
  }
  shuffle(buttonOptions.value);

  const audio = texts.map((text) => {
    return {
      src: `/sounds/relatives/${useAppStore().language}_${text}.mp3`,
      meta: { text },
    };
  });

  currentTask.value = {
    queue: task.queue,
    solutions: task.solutions,
    audio,
    texts,
  };

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(coreExercise.value);

  inputDisabled.value = false;
  await playAudio();
  countdownTimer.value?.start();
}

async function playAudio() {
  soundService.stop();
  await soundService.playAll(currentTask.value!.audio, 100, true);
}

function selectWord(idx: number, $event: Event) {
  $event.stopPropagation();
  if (currentTask.value!.solutions.indexOf(buttonOptions.value[idx]) > -1) {
    inputDisabled.value = true;
    countdownTimer.value?.stop();
    store.$patch((store) => store.exercise.correctAnswers++);
    new TweenService().fadeOut(coreExercise.value);
    new SoundService().playSuccess();
    nextQuestion();
  } else {
    exerciseUtils.handleMistake(reveal, coreExercise);
  }
}

function reveal() {
  inputDisabled.value = true;
  revealed.value = true;
  countdownTimer.value?.stop();
}

const whoIs = computed(() => {
  return t('findRelatives.Who is {name}?', {
    name: t('findRelatives.' + character.value),
  });
});

const solution = computed(() => {
  return currentTask.value?.solutions
    .map((s) => t('findRelatives.my_' + s))
    .join(' / ');
});
</script>
