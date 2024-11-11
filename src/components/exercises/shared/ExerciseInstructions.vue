<template>
  <div style="max-width: 512px">
    <q-card class="q-ma-sm">
      <q-card-section class="text-center" v-if="store.exercise.audio">
        <q-icon :name="matVolumeUp" tag="timer-outline" size="3rem"></q-icon
        ><br />
        {{
          $t(
            'This exercise works with audio. Make sure your speakers are enabled and the volume is adjusted.'
          )
        }}
      </q-card-section>
      <q-card-section class="text-center">
        {{ $t(nameOfTheGame + '.hint') }}
      </q-card-section>
      <q-card-section class="text-center">
        {{ $t('Press "START" when you are ready') }}
      </q-card-section>
      <q-separator dark />

      <q-card-actions class="justify-center">
        <q-btn
          color="primary"
          @click="confirm"
          data-testid="confirm-exercise-instructions-btn"
          :disable="disabled"
          >{{ $t('START') }}</q-btn
        >
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { matVolumeUp } from '@quasar/extras/material-icons';
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { keyInput } from 'src/util/key.input';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { useAppStore } from 'src/stores/app-store';
import { SoundService } from 'src/shared-services/sound.service';

const emits = defineEmits(['confirm']);
const route = useRoute();
const disabled = ref(false);
const destroy = new Subject<void>();
const store = useAppStore();

const soundService = new SoundService();

onMounted(() => {
  keyInput
    .pipe(
      filter((k) => k.key === 'Enter'),
      take(1),
      takeUntil(destroy)
    )
    .subscribe(() => {
      confirm();
    });
  soundService.playAll([
    {
      src:
        '/sounds/exercise-hints/' +
        store.language +
        '_' +
        nameOfTheGame.value +
        '_hint.mp3',
    },
    {
      src: '/sounds/exercise-hints/' + store.language + '_common_hint.mp3',
    },
  ]);
});

onBeforeUnmount(() => {
  soundService.stop();
  destroy.next();
  destroy.complete();
});

function confirm() {
  soundService.stop();
  disabled.value = true;
  emits('confirm');
}
const nameOfTheGame = computed(() => route.params.game);
</script>
