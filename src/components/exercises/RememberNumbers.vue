<template>
  <div class="column flex-auto">
    <ExerciseHeader
      @repeat="repeat"
    />
    <div class="column justify-center column flex-auto content-center" @click="containerClicked">
      <div ref="numpad" class="relative-position">
       <NumPadWithDisplay  :input-disabled="inputDisabled" :input-value="inputValue" @button-click="onNumberEntered"/>
      </div>
    </div>
  </div>
  <q-footer class="bg-accent text-white no-pointer-events">
    <q-toolbar>
      <q-toolbar-title>Footer</q-toolbar-title>
    </q-toolbar>
  </q-footer>
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services//tween.service'
import { keyInput } from 'src/util/key.input'
import ExerciseHeader from 'src/components/exercises/shared/ExerciseHeader.vue'
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue'
import { takeUntil } from 'rxjs'
import { SoundService } from 'src/shared-services//sound.service'
import { ref, onBeforeMount, computed, onMounted, onBeforeUnmount } from 'vue'
import {useAppStore} from "stores/app-store";
import {exerciseUtils} from "components/exercises/exercise.utils";
import { Subject } from 'rxjs'
import {useRoute} from "vue-router";
import {SubscriptionCallbackMutation, SubscriptionCallbackMutationPatchObject} from "pinia";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";

const store = useAppStore()
const $q = useQuasar()
const { t } = useI18n()

let currentIndex = 0
const inputValue = ref('')
const route = useRoute()

let currentAudio: { src: string; val: number }[] = []

const soundService = new SoundService()
const inputDisabled = ref(false) // -> to state
const revealed = ref(false) // -> to state

const destroy = new Subject<void>();
const numpad = ref()

const sequenceLength = computed(() => {
  return exerciseUtils.difficulty(route) === 'easy' ? 6 : exerciseUtils.difficulty(route) === 'normal' ? 8 : 10
})

onBeforeMount(() => {
  const numberOfQuestions = 5
  exerciseUtils.beginExercise(numberOfQuestions)
})

onMounted(async () => {
  keyInput.pipe(takeUntil(destroy)).subscribe(key => {
    if (revealed.value) {
      nextQuestion()
    }
    const number = Number(key.key)
    if (!isNaN(number)) {
      onNumberEntered(number)
    }
  })

  if (!soundService.isAudioContextRunning()) {
    inputDisabled.value = true
    $q.dialog({
      message: t('Start exercise now?'),
      cancel: t('No'),
      ok: t('Yes'),
      persistent: true
    }).onOk(async () => {
      inputDisabled.value = false
      await new TweenService().fadeOut(numpad.value, 0)
      nextQuestion()
    })
  } else {
    await new TweenService().fadeOut(numpad.value, 0)
    nextQuestion()
  }
})

onBeforeUnmount(() => {
  soundService.stop()
  destroy.next()
  destroy.complete()
})

async function nextQuestion () {
  soundService.stop()
  inputDisabled.value = true
  revealed.value = false
  inputValue.value = ''
  currentIndex = 0
  store.$patch(store => store.exercise.currentQuestion++)
  if (store.exercise.currentQuestion > store.exercise.totalQuestions) {
    await exerciseUtils.finishExercise()
    return
  }
  await new TweenService().fadeOut(numpad.value)
  store.$patch(store => store.exercise.strikes = 0)
  createTask()
  await new TweenService().fadeIn(numpad.value)
  await playAudio()
  inputDisabled.value = false
}

function createTask () {
  currentAudio = []
  for (let i = 0; i < sequenceLength.value; i++) {
    const nextNumber = Math.floor(Math.random() * 10)
    currentAudio.push({ src: `/sounds/${store.language}_${nextNumber}.mp3`, val: nextNumber })
  }
}

function playAudio () {
  return soundService.playAll(currentAudio, 100)
}

async function onNumberEntered (num: number) {
  if (revealed.value) {
    nextQuestion()
  }
  if (inputDisabled.value) {
    return
  }
  if (num === currentAudio[currentIndex].val) {
    inputValue.value = inputValue.value + String(currentAudio[currentIndex].val)
    currentIndex++
    if (currentIndex === sequenceLength.value) {
      inputDisabled.value = true
      store.$patch((state) => state.exercise.correctAnswers++)
      new TweenService().fadeOut(numpad.value)
      new SoundService().playSuccess()
      await exerciseUtils.wait(100)
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
  inputValue.value = '('
  for (let i = 0; i < sequenceLength.value; i++) {
    inputValue.value = inputValue.value + String(currentAudio[i].val)
  }
  inputValue.value += ')'
}

function containerClicked () {
  if (revealed.value) {
    nextQuestion()
  }
}

store.$subscribe((mutation: SubscriptionCallbackMutation<any>) => {
  if ((mutation as SubscriptionCallbackMutationPatchObject<any>).payload &&
    (mutation as SubscriptionCallbackMutationPatchObject<any>).payload.pause !== undefined) {
    soundService.pause(store.exercise.paused || false)
  }
})

async function repeat() {
  if (!soundService.isPlaying()) {
    inputDisabled.value = true
    await playAudio()
    inputDisabled.value = false
  }
}
</script>
