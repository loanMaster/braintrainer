<template>
  <div ref="coreExercise" class="column items-center flex-1 justify-around">
    <div class="flex-1 row justify-center items-center">
      <SpeechBubble
        :show="store.exercise.audioState.playingSequence"
        :transparentText="!store.exercise.audioState.playing"
        :text="store.exercise.audioState.meta.text || '...'"
      />
    </div>
    <div style="flex: 2">
      <SkipRepeatButtons />
      <div class="text-h5 q-my-md row justify-center">
        {{ whoIs }}
      </div>
      <div
        ref="buttons"
        data-testid="exercise-buttons"
        class="max-width-xs row wrap justify-center q-gutter-sm"
      >
        <div
          v-for="(option, idx) in buttonOptions"
          v-bind:key="idx"
          class="row"
        >
          <q-btn
            color="primary"
            :data-test="
              isCorrectBtn(idx) ? 'correct-button' : 'incorrect-button'
            "
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
import SkipRepeatButtons from 'src/components/exercises/shared/SkipRepeatButtons.vue';
import { TweenService } from 'src/shared-services/tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import SpeechBubble from 'src/components/exercises/shared/SpeechBubble.vue';
import { Sound, SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useAppStore } from 'stores/app-store';
import { RelativesService } from 'src/shared-services/relatives.service';
import { randomElement, shuffle } from 'src/util/array.utils';
import { useRouter } from 'vue-router';
import { preloadAudio } from 'src/util/preload-assets';
import { ReplaySubject, Subject, take, takeUntil } from 'rxjs';
import { skip } from 'rxjs/operators';

const {
  soundService,
  revealed,
  t,
  store,
  inputDisabled,
  destroy,
  onSolutionConfirmed,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
  skipCb: () => reveal(),
});

let currentTask: Ref<
  | {
      queue: string[];
      solutions: string[];
      gender: string;
      person: string;
      audio: Sound[];
      texts: string[];
    }
  | undefined
> = ref();

let nextTask: Subject<
  | {
      queue: string[];
      solutions: string[];
      gender: string;
      audio: Sound[];
      person: string;
      texts: string[];
    }
  | undefined
>;

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
const router = useRouter();

onBeforeMount(() => {
  exerciseUtils.createExercise();
});

onMounted(async () => {
  new TweenService().setDisplay(coreExercise.value, 'none');
  nextTask = new ReplaySubject<
    | {
        queue: string[];
        solutions: string[];
        person: string;
        gender: string;
        audio: Sound[];
        texts: string[];
      }
    | undefined
  >(store.exercise.totalQuestions + 1);
  nextTask
    .pipe(take(store.exercise.totalQuestions), takeUntil(destroy))
    .subscribe(() => fetchNextExercise());
  fetchNextExercise();
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
  currentTask.value = await nextTask
    .pipe(skip(store.exercise.currentQuestion - 1), take(1))
    .toPromise();

  const relativesService = new RelativesService();
  buttonOptions.value = [...currentTask.value!.solutions];
  while (buttonOptions.value.length < 6) {
    const randomRelative = randomElement(relations);
    if (
      buttonOptions.value.indexOf(randomRelative) === -1 &&
      (relativesService.getGender(randomRelative) === 'n' ||
        relativesService.getGender(randomRelative) ===
          currentTask.value!.gender)
    ) {
      buttonOptions.value.push(randomRelative);
    }
  }
  shuffle(buttonOptions.value);

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
    store.beginExercise();
  }
  await new TweenService().fadeIn(coreExercise.value);

  inputDisabled.value = false;
  await playAudio();
}

async function fetchNextExercise() {
  const relativesService = new RelativesService();
  const task = relativesService.createRelationshipTree(
    store.exercise.sequenceLength
  );
  const person =
    task.gender === 'f'
      ? female_names[Math.floor(Math.random() * female_names.length)]
      : male_names[Math.floor(Math.random() * male_names.length)];
  const texts = [
    t('findRelatives.{name}_is', {
      name: t('findRelatives.' + person),
    }),
    t('findRelatives.subj_' + task.queue[0]),
  ];
  for (let i = 1; i < task.queue.length - 1; i++) {
    texts.push(t('findRelatives.poss_' + task.queue[i]));
  }
  texts.push(t('findRelatives.of_your_' + task.queue[task.queue.length - 1]));

  const audio = texts.map((text) => {
    return {
      src: `sounds/relatives/${useAppStore().language}_${text}.mp3`,
      meta: { text },
    };
  });

  await preloadAudio(audio.map((s) => s.src as string));

  nextTask.next({
    queue: task.queue,
    solutions: task.solutions,
    person,
    gender: task.gender,
    audio,
    texts,
  });
}

async function playAudio() {
  soundService.stop();
  await soundService.playAll(currentTask.value!.audio, 100);
}

function isCorrectBtn(idx: number) {
  return currentTask.value!.solutions.indexOf(buttonOptions.value[idx]) > -1;
}

function selectWord(idx: number, $event: Event) {
  $event.stopPropagation();
  if (isCorrectBtn(idx)) {
    inputDisabled.value = true;
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
}

const whoIs = computed(() => {
  return t('findRelatives.Who is {name}?', {
    name: t('findRelatives.' + currentTask.value?.person || male_names[0]),
  });
});

const solution = computed(() => {
  return currentTask.value?.solutions
    .map((s) => t('findRelatives.my_' + s))
    .join(' / ');
});
</script>
