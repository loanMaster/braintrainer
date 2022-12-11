<template>
  <div>
    <q-card class="q-ma-sm">
      <q-card-section class="text-center">
        {{ $t(nameOfTheGame + '.hint') }}
      </q-card-section>
      <q-card-section class="text-center">
        Klicke auf "START" sobald Du bereit bist.
      </q-card-section>
      <q-separator dark />

      <q-card-actions class="justify-center">
        <q-btn color="primary" @click="confirm">START</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
import {useRoute} from "vue-router";

const emits = defineEmits(['confirm']);
const route = useRoute()
function confirm() {
  emits('confirm');
}
const nameOfTheGame = computed(() => route.params.game)
</script>
