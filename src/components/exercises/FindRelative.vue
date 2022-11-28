<template>
  <div ref="buttons" class="row q-gutter-sm justify-center">
    <div v-for="(label, idx) in buttonLabels" v-bind:key="idx" class="row">
      <q-btn
        color="primary"
        :class="textTransparent ? 'text-transparent' : ''"
        @click="selectWord(idx, $event)"
        :disabled="isButtonDisabled(idx)"
        class="transition-duration-md"
        >{{ $t(label) }}</q-btn
      >
    </div>
  </div>
  <SolutionBanner
    :show="revealed"
    :solution="solution"
    @click="containerClicked"
  />
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services//tween.service';
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { Sound, SoundService } from 'src/shared-services//sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import {
  AudioResponse,
  ExerciseService,
} from 'src/shared-services/exercise.service';
import { skip, take, takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import {
  possibleRelations,
  RelationshipService,
  RelationshipTask,
} from 'src/shared-services/relationship.service';
import { useAppStore } from 'stores/app-store';

const {
  soundService,
  revealed,
  destroy,
  $q,
  t,
  route,
  store,
  inputDisabled,
  containerClicked,
} = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion(),
});

let currentIndex = ref(0);

let permutation: Ref<number[]> = ref([]);
let currentTask: Ref<
  | {
      queue: string[];
      solutions: string[];
      audio: Sound[];
      texts: string[];
    }
  | undefined
> = ref();
let buttonLabels: Ref<string[]> = ref(possibleRelations
  .concat("Nephew", "Niece", "Grandmother", "Grandfather", "Grandchild", "Uncle", "Aunt")
  .map(v => 'your_' + v))
buttonLabels.value.push('You')
const buttons = ref();
const textTransparent = ref(false);

onBeforeMount(() => {
  const numberOfQuestions = 5;
  exerciseUtils.createExercise(numberOfQuestions);
});

const difficulty = computed(() => route.params.difficulty);

onMounted(async () => {
  new TweenService().setDisplay(buttons.value, 'none');
});

const sequenceLength = computed(() => {
  return difficulty.value === 'easy'
    ? 6
    : difficulty.value === 'normal'
    ? 9
    : 12;
});
const male_names = ['Bob', 'Charlie', 'David']
const female_names = ['Alice', 'Eve', 'Judy']

async function nextQuestion() {
  currentIndex.value = 0;
  textTransparent.value = true;
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
    await new TweenService().fadeOut(buttons.value);
  }
  const task = new RelationshipService().createExercise(
    difficulty.value as string
  );
  const isFemale = new RelationshipService().getGender(task.queue[0]) === 'f'
  const character = isFemale ?
    female_names[Math.floor((Math.random() * female_names.length))] :  male_names[Math.floor((Math.random() * male_names.length))]
  const translatedCharacter = t(character)
  const texts = [t(`{name}_is`, { name: translatedCharacter }), t('subj_' + task.queue[0])];
  for (let i = 1; i < task.queue.length - 1; i++) {
    texts.push(t('poss_' + task.queue[i]));
  }
  texts.push(t('of_your_' + task.queue[task.queue.length - 1]));

  const audio = texts.map((text) => {
    return { src: `/sounds/relatives/${useAppStore().language}_${text}.mp3` };
  });

  currentTask.value = {
    queue: task.queue,
    solutions: task.solutions,
    audio,
    texts,
  };

  /*for (let idx = 0; idx < sequenceLength.value; idx++) {
      buttonLabels.value[permutation.value[idx]] = currentAudio.value[idx].val as string
    }*/

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(buttons.value, 'flex');
  }
  await new TweenService().fadeIn(buttons.value);

  await playAudio();
  textTransparent.value = false;
  inputDisabled.value = false;
}

async function playAudio() {
  soundService.stop();
  await soundService.playAll(currentTask.value!.audio, 100);
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
  return currentTask.value?.solutions.join(', ');
});
</script>
