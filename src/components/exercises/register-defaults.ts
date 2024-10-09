import { SoundService } from 'src/shared-services/sound.service';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { ref, onBeforeUnmount, computed, onMounted } from 'vue';
import { Subject } from 'rxjs';
import { useAppStore } from 'stores/app-store';
import { useRoute } from 'vue-router';
import { keyInput } from 'src/util/key.input';
import { filter, takeUntil } from 'rxjs/operators';
import { SpeechService } from 'src/shared-services/speech.service';

export function createExerciseContext({
  playAudioCb,
  nextQuestionCb,
  startCb,
  skipCb,
}: {
  playAudioCb: () => any;
  nextQuestionCb: () => any;
  startCb: () => any;
  skipCb: () => any;
}) {
  const store = useAppStore();
  const $q = useQuasar();
  const { t } = useI18n();
  const route = useRoute();
  const soundService = new SoundService();
  const speechService = new SpeechService();

  const inputDisabled = ref(true);
  const revealed = ref(false);
  const destroy = new Subject<void>();
  const isDev = ref(dev);

  const difficulty = computed(() => {
    return route.params.difficulty;
  });

  onBeforeUnmount(() => {
    speechService.stop();
    soundService.stop();
    soundService.deactivate();
    store.$patch((store) => (store.exercise.state = 'created'));
    destroy.next();
    destroy.complete();
  });

  store.$onAction(({ name, after }) => {
    after(async () => {
      if (name === 'pause' || name === 'resume') {
        speechService.pause(store.exercise.paused);
      }
      if (name === 'playerReady') {
        startCb();
      }
      if (name === 'repeatAudio') {
        if (!speechService.isPlaying()) {
          const revealedWhenStarting = revealed.value;
          inputDisabled.value = true;
          await playAudioCb();
          if (!revealedWhenStarting) {
            inputDisabled.value = false;
          }
        }
      }
      if (name === 'skip') {
        skipCb();
      }
    });
  });

  function onSolutionConfirmed() {
    if (revealed.value) {
      nextQuestionCb();
    }
  }

  keyInput
    .pipe(
      filter((k) => k.key === 'Escape' || k.key === 'Enter'),
      takeUntil(destroy)
    )
    .subscribe(() => {
      if (revealed.value) {
        onSolutionConfirmed();
      }
    });

  return {
    soundService,
    speechService,
    revealed,
    inputDisabled,
    destroy,
    store,
    $q,
    route,
    onSolutionConfirmed,
    difficulty,
    isDev,
    t,
  };
}
