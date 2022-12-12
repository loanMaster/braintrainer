<template>
  <div>
    <q-card class="q-ma-sm">
      <q-card-section class="text-center">
        {{ $t(nameOfTheGame + '.hint') }}
      </q-card-section>
      <q-card-section class="text-center">
        {{ $t('Press "START" when you are ready') }}
      </q-card-section>
      <q-separator dark />

      <q-card-actions class="justify-center">
        <q-btn color="primary" @click="confirm">{{ $t('START') }}</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import {keyInput} from "src/util/key.input";
import {filter, take, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";

const emits = defineEmits(['confirm']);
const route = useRoute();
const destroy = new Subject<void>()

onMounted(() => {
  keyInput.pipe(filter(k => k.key === 'Enter'), take(1), takeUntil(destroy)).subscribe(() => {
    confirm()
  });
})

onBeforeUnmount(() => {
  destroy.next()
  destroy.complete()
})

function confirm() {
  emits('confirm');
}
const nameOfTheGame = computed(() => route.params.game);
</script>
