<template>
  <div class="column flex-auto relative-position">
    <ExerciseHeader
      @repeat="repeat"
    />
    <div class="column justify-center column flex-auto content-center" @click="containerClicked">
      <div ref="numpad" class="relative-position">
       <NumPadWithDisplay :input-disabled="inputDisabled" :input-value="inputValue" @button-click="onNumberEntered"/>
      </div>
      <SolutionBanner :show="revealed" :solution="solution" @click="containerClicked"/>
    </div>
  </div>
  <ExerciseFooter/>
</template>

<script setup lang="ts">
import { TweenService } from 'src/shared-services//tween.service'
import { keyInput } from 'src/util/key.input'
import ExerciseFooter from 'src/components/exercises/shared/ExerciseFooter.vue'
import SolutionBanner from 'src/components/exercises/shared/SolutionBanner.vue'
import ExerciseHeader from 'src/components/exercises/shared/ExerciseHeader.vue'
import NumPadWithDisplay from 'src/components/exercises/shared/NumPadWithDisplay.vue'
import { takeUntil } from 'rxjs'
import { SoundService } from 'src/shared-services//sound.service'
import { ref, Ref, onBeforeMount, computed, onMounted, onBeforeUnmount } from 'vue'
import {useAppStore} from "stores/app-store";
import {exerciseUtils} from "components/exercises/exercise.utils";
import { Subject } from 'rxjs'
import {useRoute} from "vue-router";
import {SubscriptionCallbackMutation, SubscriptionCallbackMutationPatchObject} from "pinia";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";
import {repeatX} from "components/exercises/register-defaults";

const store = useAppStore()
const $q = useQuasar()
const { t } = useI18n()

let currentIndex = 0
const inputValue = ref('')
const route = useRoute()

const currentAudio: Ref<{ src: string; val: number }[]> = ref([])

const soundService = new SoundService()
const inputDisabled = ref(false)
const revealed = ref(false)

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

  inputDisabled.value = true
  $q.dialog({
    message: t('Merken Sie sich die Ziffern und wiederholen Sie sie in der gleichen Reihenfolge. Klicken Sie auf "OK" sobaldZ Sie bereit sind.'),
    ok: t('OK'),
    persistent: true
  }).onOk(async () => {
    inputDisabled.value = false
    nextQuestion()
  })
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
  store.$patch(store => store.exercise.strikes = 0)
  createTask()
  await playAudio()
  inputDisabled.value = false
}

function createTask () {
  currentAudio.value = []
  for (let i = 0; i < sequenceLength.value; i++) {
    const nextNumber = Math.floor(Math.random() * 10)
    currentAudio.value.push({ src: `/sounds/${store.language}_${nextNumber}.mp3`, val: nextNumber })
  }
}

function playAudio () {
  return soundService.playAll(currentAudio.value, 100)
}

async function onNumberEntered (num: number) {
  if (revealed.value) {
    nextQuestion()
  }
  if (inputDisabled.value) {
    return
  }
  if (num === currentAudio.value[currentIndex].val) {
    inputValue.value = inputValue.value + String(currentAudio.value[currentIndex].val)
    currentIndex++
    if (currentIndex === sequenceLength.value) {
      inputDisabled.value = true
      store.$patch((state) => state.exercise.correctAnswers++)
      new SoundService().playSuccess()
      await exerciseUtils.wait(150)
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
  revealed.value = true
  inputDisabled.value = true
}

const solution = computed(() => {
  let temp = inputValue.value
  for (let i = temp.length; i < sequenceLength.value; i++) {
    temp += String(currentAudio.value[i]?.val)
  }
  return temp
})

function containerClicked () {
  if (revealed.value) {
    nextQuestion()
  }
}

store.$subscribe((mutation: SubscriptionCallbackMutation<any>) => {
  if ((mutation as SubscriptionCallbackMutationPatchObject<any>).payload &&
    (mutation as SubscriptionCallbackMutationPatchObject<any>).payload.pause !== undefined) {
    soundService.pause(store.pause || false)
  }
})

async function repeat() {
  if (!soundService.isPlaying()) {
    const revealedWhenStarting = revealed.value
    inputDisabled.value = true
    await playAudio()
    if (!revealedWhenStarting) {
      inputDisabled.value = false
    }
  }
}
</script>
