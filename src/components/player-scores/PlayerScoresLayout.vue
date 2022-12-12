<template>
  <div class="bg-gradient flex-1 column">
    <q-toolbar class="bg-secondary text-white no-pointer-events non-selectable">
      <q-toolbar-title>{{ $t('Your ratings') }}</q-toolbar-title>
    </q-toolbar>
    <div :style="{ 'overflow-x': overflow }" class="column flex-1 items-center">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const refEnterClass = ref('fadeIn');
const refLeaveClass = ref('fadeIn');
const overflow = ref('hidden');
const router = useRouter();

router.beforeEach((to, from) => {
  overflow.value = 'hidden';
  if (to.name === 'playerprogress' && String(from.name) === 'player-scores') {
    refEnterClass.value = 'slideInRight';
    refLeaveClass.value = 'slideOutLeft';
  } else if (
    to.name === 'player-scores' &&
    String(from.name) === 'playerprogress'
  ) {
    refEnterClass.value = 'slideInLeft';
    refLeaveClass.value = 'slideOutRight';
  }
});
router.afterEach(() => {
  setTimeout(() => {
    overflow.value = 'visible';
  }, 1000);
});
</script>
