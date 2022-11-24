<template>
  <div ref="numpad" class="relative-position" @click="containerClicked">
    <NumPadWithDisplay :input-disabled="inputDisabled" :input-value="inputValue" @button-click="onNumberEntered"/>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator"/>
  <SolutionBanner :show="revealed" :solution="solution" @click="containerClicked"/>
</template>

<script setup lang="ts">
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue'
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue'
import { takeUntil } from 'rxjs'
import {createExerciseContext} from "components/exercises/register-defaults";
import {Sound, SoundService} from "src/shared-services/sound.service";
import {onBeforeMount, onMounted, ref} from "vue";
import {exerciseUtils} from "components/exercises/exercise.utils";
import {TweenService} from "src/shared-services/tween.service";
import {AudioResponse, ExerciseService} from "src/shared-services/exercise.service";
import {keyInput} from "src/util/key.input";
import {ReplaySubject, Subject, take} from "rxjs";

const { soundService, revealed, destroy, t, store, inputDisabled, containerClicked, route } = createExerciseContext({
  playAudioCb: () => playAudio(),
  nextQuestionCb: () => nextQuestion(),
  startCb: () => nextQuestion()
})

let currentIndex = 0
const inputValue = ref('')
const numpad = ref()
const showLoadingIndicator = ref(false)

let nextAudio: Subject<AudioResponse[]>
let currentAudio: AudioResponse[] = []

let question: Sound[] = []
let solution = ref(0)

onBeforeMount(async() => {
  const difficulty = exerciseUtils.difficulty(route)
  const numberOfQuestions = difficulty === 'easy' ? 5 : 7
  exerciseUtils.createExercise(numberOfQuestions)
  nextAudio = new ReplaySubject<AudioResponse[]>(numberOfQuestions)
  nextAudio.pipe(take(numberOfQuestions), takeUntil(destroy)).subscribe(() => loadNextAudio())

  nextAudio.next(await new ExerciseService().fetchNumbers({
    min: difficulty === 'easy' ? 10 : difficulty === 'normal' ? 100 : 1000,
    max: difficulty === 'easy' ? 100 : difficulty === 'normal' ? 1000 : 10000,
    lang: store.language,
    count: 2
  }))
})

onMounted(async () => {
  new TweenService().setDisplay(numpad.value, 'none')

  keyInput.pipe(takeUntil(destroy)).subscribe(key => {
    if (revealed.value) {
      nextQuestion()
    }
    const number = Number(key.key)
    if (!isNaN(number)) {
      onNumberEntered(number)
    }
  })
})

async function nextQuestion () {
  inputValue.value = ''
  currentIndex = 0
  if (!await exerciseUtils.prepareNewQuestion({ inputDisabled, soundService, revealed })) {
    return
  }
  if (store.exercise.currentQuestion > 1) {
    await new TweenService().fadeOut(numpad.value)
  }
  showLoadingIndicator.value = true
  currentAudio = await nextAudio.pipe(take(1)).toPromise() as AudioResponse[]
  showLoadingIndicator.value = false
  if (store.exercise.currentQuestion === 1) {
    new TweenService().setDisplay(numpad.value, 'block')
  }
  await new TweenService().fadeIn(numpad.value)
  inputDisabled.value = false
  createCalculation()
  playAudio()
}

function createCalculation () {
  question = []
  solution.value = currentAudio[0].val as number
  question.push(currentAudio[0])
  if (currentAudio[1].val < solution.value && Math.random() < 0.6) {
    question.push({ src: `/sounds/${store.language}_−.mp3` })
    solution.value -= currentAudio[1].val as number
  } else {
    question.push({ src: `/sounds/${store.language}_+.mp3` })
    solution.value += currentAudio[1].val as number
  }
  question.push(currentAudio[1])
}

async function playAudio () {
  await soundService.playAll(question, 100)
}

async function loadNextAudio () {
  const difficulty = store.exercise.difficulty
  nextAudio.next(await new ExerciseService().fetchNumbers({
    min: difficulty === 'easy' ? 10 : difficulty === 'normal' ? 100 : 1000,
    max: difficulty === 'easy' ? 100 : difficulty === 'normal' ? 1000 : 10000,
    lang: store.language,
    count: 2
  }))
}

async function onNumberEntered (num: number) {
  if (revealed.value) {
    nextQuestion()
    return
  }
  if (inputDisabled.value) {
    return
  }
  if (String(num) === String(solution.value)[currentIndex]) {
    currentIndex++
    inputValue.value = String(solution.value).substring(0, currentIndex)
    if (currentIndex === String(solution.value).length) {
      inputDisabled.value = true
      new SoundService().playSuccess()
      await exerciseUtils.wait(200)
      store.$patch(store => store.exercise.correctAnswers++)
      new TweenService().fadeOut(numpad.value)
      nextQuestion()
    }
  } else {
    if (store.strike()) {
      new SoundService().playError()
      if (store.exercise.strikes >= 3) {
        reveal()
      }
    }
    new TweenService().wiggle(numpad.value)
  }
}

function reveal () {
  inputDisabled.value = true
  revealed.value = true
  inputValue.value = `${solution.value}`
}
</script>
