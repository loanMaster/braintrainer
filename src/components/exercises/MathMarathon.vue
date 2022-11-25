<template>
  <input :value="previousResult" disabled class="text-center text-h6">
  <div ref="numpad" class="column relative-position" @click="containerClicked">
    <NumPadWithDisplay :input-disabled="inputDisabled" :input-value="inputValue" @button-click="onNumberEntered"/>
  </div>
  <LoadingIndicator :showing="showLoadingIndicator"/>
  <SolutionBanner :show="revealed" :solution="expectedResult" @click="containerClicked"/>
</template>

<script setup lang="ts">
  import { TweenService } from 'src/shared-services//tween.service'
  import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue'
  import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue'
  import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue'
  import {Sound, SoundService} from 'src/shared-services//sound.service'
  import { ref, Ref, onBeforeMount, computed, onMounted } from 'vue'
  import {exerciseUtils} from "components/exercises/exercise.utils";
  import {createExerciseContext} from "components/exercises/register-defaults";
  import {AudioResponse, ExerciseService} from "src/shared-services/exercise.service";
  import {takeUntil} from "rxjs/operators";
  import {keyInput} from "src/util/key.input";

  const { soundService, revealed, destroy, $q, t, route, store, inputDisabled, containerClicked, difficulty } = createExerciseContext({
    playAudioCb: () => playAudio(),
    nextQuestionCb: () => nextQuestion(),
    startCb: () => nextQuestion()
  })

  const currentIndex = ref(0)
  const inputValue = ref('')
  const numpad = ref()
  const showLoadingIndicator = ref(false)

  let permutation: number[] = []
  let fetchAudio: Promise<AudioResponse[]>
  let currentAudio: AudioResponse[] = []

  let question: Sound[] = []
  const expectedResult: Ref<number | null> = ref(null)
  const previousResult: Ref<number | null> = ref(null)

  onBeforeMount(()=> {
    const numberOfQuestions = difficulty.value === 'easy' ? 20 : difficulty.value === 'normal' ? 25 : 30
    exerciseUtils.createExercise(numberOfQuestions)
    fetchAudio = new ExerciseService().fetchNumbers({
      min: 10,
      max: difficulty.value === 'hard' ? 200 : 100,
      lang: store.language,
      count: store.exercise.totalQuestions + 1
    })
  })

  onMounted(() => {
    keyInput.pipe(takeUntil(destroy)).subscribe(key => {
      if (revealed.value) {
        nextQuestion()
      }
      const number = Number(key.key)
      if (!isNaN(number)) {
        onNumberEntered(number)
      }
    })
    new TweenService().setDisplay(numpad.value, 'none')
  })

  async function nextQuestion () {
    inputValue.value = ''
    soundService.stop()
    currentIndex.value = 0
    if (!await exerciseUtils.prepareNewQuestion({ inputDisabled, soundService, revealed })) {
      return
    }
    if (store.exercise.currentQuestion > 1) {
      await new TweenService().fadeOut(numpad.value)
    }
    previousResult.value = expectedResult.value

    showLoadingIndicator.value = true
    const audioTemp = await fetchAudio
    showLoadingIndicator.value = false

    permutation = Array.from(Array(store.exercise.totalQuestions).keys())
    permutation.sort(() => Math.random() - 0.5)

    if (store.exercise.currentQuestion === 1) {
      new TweenService().setDisplay(numpad.value, 'flex')
    }
    await new TweenService().fadeIn(numpad.value)
    inputDisabled.value = false
    if (store.exercise.currentQuestion === 1) {
      currentAudio = []
      currentAudio.push(audioTemp.pop() as AudioResponse)
      currentAudio.push(audioTemp.pop() as AudioResponse)
      createInitialCalculation()
    } else {
      currentAudio = []
      currentAudio.push(audioTemp.pop() as AudioResponse)
      createCalculation()
    }
    await playAudio()
  }

  function createInitialCalculation () {
    question = []
    expectedResult.value = currentAudio[0].val as number
    question.push(currentAudio[0])
    if (currentAudio[1].val as number < expectedResult.value && Math.random() < 0.6) {
      question.push({ src: `/sounds/${store.language}_−.mp3` })
      expectedResult.value -= currentAudio[1].val as number
    } else {
      question.push({ src: `/sounds/${store.language}_+.mp3` })
      expectedResult.value += currentAudio[1].val as number
    }
    question.push(currentAudio[1])
  }

  function createCalculation () {
    question = []
    expectedResult.value = previousResult.value as number
    if (Math.random() > 0.66 && expectedResult.value < 200) {
      question.push({ src: `/sounds/${store.language}_×.mp3` })
      const randomMultiplier = difficulty.value === 'easy'
        ? 2
        : expectedResult.value > 100 ? 3 : Math.floor(Math.random() * 7 + 2)
      expectedResult.value *= randomMultiplier
      question.push({ src: `/sounds/${store.language}_${randomMultiplier}.mp3` })
    } else if (currentAudio[0].val < expectedResult.value && Math.random() < 0.6) {
      question.push({ src: `/sounds/${store.language}_−.mp3` })
      expectedResult.value -= currentAudio[0].val as number
      question.push(currentAudio[0])
    } else {
      question.push({ src: `/sounds/${store.language}_+.mp3` })
      expectedResult.value += currentAudio[0].val as number
      question.push(currentAudio[0])
    }
  }

  async function playAudio () {
    soundService.stop()
    await soundService.playAll(question, 100)
  }

  async function onNumberEntered (num: number) {
    if (revealed.value) {
      nextQuestion()
    }
    if (inputDisabled.value) {
      return
    }
    if (String(num) === String(expectedResult.value)[currentIndex.value]) {
      currentIndex.value++
      inputValue.value = String(expectedResult.value).substring(0, currentIndex.value)
      if (currentIndex.value === String(expectedResult.value).length) {
        inputDisabled.value = true
        store.$patch(store => store.exercise.correctAnswers++)
        new SoundService().playSuccess()
        await exerciseUtils.wait(150)
        nextQuestion()
      }
    } else {
      exerciseUtils.handleMistake(reveal, numpad)
    }
  }

  function reveal () {
    inputDisabled.value = true
    revealed.value = true
  }
</script>

