<template>
  <div
    class="column flex-auto relative-position"
    :style="{ 'overflow-x': overflow, 'max-width': '100%' }"
  >
    <MovingColorsBackground
      :style="{ opacity: notPlaying ? '1' : '0.25' }"
      style="transition-property: opacity; transition-duration: 1s"
    />
    <ExerciseHeader />
    <router-view v-slot="{ Component }">
      <transition
        mode="out-in"
        :leave-active-class="'animated ' + refLeaveClass"
        :enter-active-class="'animated ' + refEnterClass"
        appear
        :duration="{ leave: 300, enter: 300 }"
      >
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import ExerciseHeader from 'src/components/exercises/shared/ExerciseHeader.vue';
import MovingColorsBackground from 'src/components/backgrounds/MovingColorsBackground.vue';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();

const refEnterClass = ref('fadeIn');
const refLeaveClass = ref('fadeIn');
const overflow = ref('hidden');
const route = useRoute();

router.beforeEach((to, from) => {
  overflow.value = 'hidden';
  if (
    to.name === 'select-difficulty' &&
    String(from.name) === 'select-exercise'
  ) {
    refEnterClass.value = 'slideInRight';
    refLeaveClass.value = 'slideOutLeft';
  } else if (
    String(from.name) === 'select-difficulty' &&
    to.name === 'select-exercise'
  ) {
    refEnterClass.value = 'slideInLeft';
    refLeaveClass.value = 'slideOutRight';
  } else if (String(from.name) === 'select-difficulty') {
    refEnterClass.value = 'fadeIn';
    refLeaveClass.value = 'slideOutLeft';
  } else {
    refEnterClass.value = 'fadeIn';
    refLeaveClass.value = 'fadeOut';
  }
});

const notPlaying = computed(() => {
  return route.name === 'select-difficulty' || route.name === 'select-exercise';
});

router.afterEach(() => {
  setTimeout(() => {
    overflow.value = 'visible';
  }, 1000);
});
</script>
