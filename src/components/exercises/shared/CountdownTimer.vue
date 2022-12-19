<template>
  <q-circular-progress
    show-value
    :value="remainingTime"
    :animation-speed="state === 'STARTED' ? '500' : '0'"
    :max="totalTime"
    font-size="1rem"
    center-color="yellow-1"
    size="50px"
    :class="{ 'slow-transition': state === 'STARTED' }"
    :style="{ color: color }"
  >
    {{ remainingTimeFormatted }}
  </q-circular-progress>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { interval } from 'rxjs';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { useAppStore } from 'stores/app-store';

const destroy = new Subject<void>();
const store = useAppStore();
const state = ref('CREATED');

const props = defineProps({
  totalTime: Number,
});
const remainingTime = ref(0);
const emits = defineEmits(['timeout']);
let lastTick = Date.now();

onMounted(() => {
  remainingTime.value = props.totalTime || -1;

  interval(100)
    .pipe(
      filter(
        () =>
          state.value === 'STARTED' &&
          store.exercise.state === 'started' &&
          !store.exercise.paused
      ),
      takeUntil(destroy)
    )
    .subscribe(() => {
      remainingTime.value -= Date.now() - lastTick;
      lastTick = Date.now();
      if (remainingTime.value < 0) {
        stop();
        remainingTime.value = 0;
        emits('timeout');
      }
    });
});

onBeforeUnmount(() => {
  destroy.next();
  destroy.complete();
});

function start() {
  lastTick = Date.now();
  state.value = 'STARTED';
}

function stop() {
  state.value = 'STOPPED';
  remainingTime.value -= Date.now() - lastTick;
}

function reset() {
  remainingTime.value = props.totalTime || -1;
  state.value = 'STOPPED';
}

store.$onAction(({ name, after }) => {
  after(() => {
    if (name === 'pause') {
      remainingTime.value -= Date.now() - lastTick;
    }
    if (name === 'resume' || name === 'beginExercise') {
      lastTick = Date.now();
    }
  });
});

const remainingTimeFormatted = computed(() =>
  (Math.max(0, remainingTime.value) / 1000).toFixed(1)
);

const color = computed(() => {
  const fraction = remainingTime.value / (props.totalTime || 1000);
  if (fraction < 0.25) {
    return 'red';
  } else if (fraction < 0.5) {
    return 'orange';
  }
  return 'green';
});

defineExpose({ start, stop, reset });
</script>

<style lang="scss" scoped>
.slow-transition.q-circular-progress {
  transition-duration: 1s;
  transition-property: color;
}
</style>
