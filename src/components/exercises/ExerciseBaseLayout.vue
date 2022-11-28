<template>
  <div
    class="column flex-auto relative-position"
    :style="{ 'overflow-x': overflow }"
  >
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

const refEnterClass = ref('fadeIn');
const refLeaveClass = ref('fadeIn');
const overflow = ref('hidden');

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
  } else {
    refEnterClass.value = 'fadeIn';
    refLeaveClass.value = 'fadeOut';
  }
});
router.afterEach(() => {
  setTimeout(() => {
    overflow.value = 'visible';
  }, 1000);
});
</script>
