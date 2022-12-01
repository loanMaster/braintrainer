<template>
  <div ref="coreExercise" class="column items-center flex-1 justify-around">
    <div class="flex-1 row justify-center items-center">
      <SpeechBubble :show="store.exercise.playingSequence"
                    :transparentText="!store.exercise.audioState.playing"
                    :text="store.exercise.audioState.tag || '...'"/>
    </div>
    <div style="flex: 2">
      <div class="text-h5 q-mb-md row justify-center">
        {{ whoIs }}
      </div>
      <div ref="buttons" class="row q-gutter-sm justify-center">
        <div v-for="(label, idx) in buttonLabels" v-bind:key="idx" class="row">
          <q-btn
            color="primary"
            @click="selectWord(idx, $event)"
            :disabled="inputDisabled"
            class="transition-duration-md"
            >{{ $t( label) }}</q-btn
          >
        </div>
      </div>
    </div>
  </div>
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
import { Sound, SoundService } from 'src/shared-services/sound.service';
import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue';
import { exerciseUtils } from 'components/exercises/exercise.utils';
import { createExerciseContext } from 'components/exercises/register-defaults';
import { useAppStore } from 'stores/app-store';
import { RelativesService } from "components/exercises/service/relatives.service";

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

const male_names = ['Bob', 'Charlie', 'David']
const female_names = ['Alice', 'Eve', 'Judy']

const relations = [
  "Grandmother",
  "Grandfather",
  "Mother",
  "Father",
  "Uncle",
  "Aunt",
  "Cousin",
  "You",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Niece",
  "Nephew",
  "Grandchild"
]
let buttonLabels: Ref<string[]> = ref(relations.map(v => 'findRelatives.my_' + v))
const coreExercise = ref();
const character = ref(male_names[0])

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
    }))
  ) {
    return;
  }
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(coreExercise.value);
  }
  const task = new RelativesService().createRelationshipTree(
    difficulty.value as string
  );
  character.value = task.gender === 'f' ?
    female_names[Math.floor((Math.random() * female_names.length))] :  male_names[Math.floor((Math.random() * male_names.length))]
  const texts = [t(`findRelatives.{name}_is`, { name: t('findRelatives.' + character.value) }), t('findRelatives.subj_' + task.queue[0])];
  for (let i = 1; i < task.queue.length - 1; i++) {
    texts.push(t('findRelatives.poss_' + task.queue[i]));
  }
  texts.push(t('findRelatives.of_your_' + task.queue[task.queue.length - 1]));

  const audio = texts.map((text) => {
    return { src: `/sounds/relatives/${useAppStore().language}_${text}.mp3`, tag: text };
  });

  currentTask.value = {
    queue: task.queue,
    solutions: task.solutions,
    audio,
    texts,
  };

  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(coreExercise.value, 'flex');
  }
  await new TweenService().fadeIn(coreExercise.value);

  inputDisabled.value = false;
  await playAudio();
}

async function playAudio() {
  soundService.stop();
  await soundService.playAll(currentTask.value!.audio, 100);
}

function selectWord(idx: number, $event: Event) {
  $event.stopPropagation();
  if (currentTask.value!.solutions.indexOf(relations[idx]) > -1) {
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
  return t('findRelatives.Who is {name}?', { name: t('findRelatives.' + character.value) })
})

const solution = computed(() => {
  return currentTask.value?.solutions.map(s => t('findRelatives.my_' + s)).join(' / ');
});
</script>
