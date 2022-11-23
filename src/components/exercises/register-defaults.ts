import {SoundService} from "src/shared-services/sound.service";
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";
import { ref, onBeforeUnmount } from 'vue'
import {Subject} from "rxjs";
import {useAppStore} from "stores/app-store";
import {useRoute} from "vue-router";

export function createExerciseContext({ playAudioCb, nextQuestionCb, startCb }: { playAudioCb: () => any, nextQuestionCb: () => any, startCb: () => any }) {
  const store = useAppStore()
  const $q = useQuasar()
  const { t } = useI18n()
  const route = useRoute()
  const soundService = new SoundService()
  const inputDisabled = ref(false)
  const revealed = ref(false)
  const destroy = new Subject<void>();

  onBeforeUnmount(() => {
    soundService.stop()
    soundService.deactivate()
    store.$patch(store => store.exercise.state = 'created')
    destroy.next()
    destroy.complete()
  })

  store.$onAction(({ name, after }) => {
    after(async () => {
      if (name === 'pause' || name === 'resume') {
        soundService.pause(store.isPaused)
      }
      if (name === 'beginExercise') {
        startCb()
      }
      if (name === 'repeatAudio') {
        if (!soundService.isPlaying()) {
          const revealedWhenStarting = revealed.value
          inputDisabled.value = true
          await playAudioCb()
          if (!revealedWhenStarting) {
            inputDisabled.value = false
          }
        }
      }
    })
  })

  function containerClicked () {
    if (revealed.value) {
      nextQuestionCb()
    }
  }

  return {
    soundService,
    revealed,
    inputDisabled,
    destroy,
    store,
    $q,
    route,
    containerClicked,
    t
  }
}
