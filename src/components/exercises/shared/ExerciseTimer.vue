<template>
  <span class="text-h6">{{elapsedTimeFormatted}}</span><q-icon name="timer" tag="timer-outline" size="2rem"></q-icon>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import {useAppStore} from "src/stores/app-store";
import {Subject, takeUntil, interval} from "rxjs";
import {padNumber} from "src/util/padNumber";

const store = useAppStore()
const destroy = new Subject<void>();
let timeElapsed = ref(0)

onMounted(() => {
  let lastTick = Date.now()
  interval(1000).pipe(takeUntil(destroy)).subscribe(() => {
    //if (!store.pause) {
      timeElapsed.value += Date.now() - lastTick
      lastTick = Date.now()
    //}
  })
})

const elapsedTimeFormatted = computed(() => {
  const minutes = Math.floor(timeElapsed.value / 1000 / 60)
  const seconds = Math.floor((timeElapsed.value - 60000 * minutes) / 1000)
  return `${padNumber(minutes,2)}:${padNumber(seconds, 2)}`
})

onBeforeMount(() => {
  destroy.next()
  destroy.complete()
})
</script>
