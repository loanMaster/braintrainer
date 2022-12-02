<template>
  <div class="animated-bg"/>
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
  } else if (String(from.name) === 'select-difficulty') {
    refEnterClass.value = 'fadeIn';
    refLeaveClass.value = 'slideOutLeft';
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

<style lang="scss">
  @mixin dots($count) {
  $text-shadow: ();
    @for $i from 0 through $count {
      $text-shadow: $text-shadow,
      (-.5+(random()) * 3) + em
    (-.5+(random()) * 3) + em
    7px
    hsla(random() * 360, 100%, 50%,.9);
    }
    text-shadow: $text-shadow;
  }

  .animated-bg {
    display: block;
    font-size: 52px;
    color: transparent;
  }

  .animated-bg::before, .animated-bg::after,
  .animated-bg::before, .animated-bg::after {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 3em;
    height: 3em;
    content: '.';
    mix-blend-mode: screen;
    animation: 44s -27s move infinite ease-in-out alternate;
  }

  .animated-bg::before {
  @include dots(40);
    animation-duration: 44s;
    animation-delay: -27s;
  }

  .animated-bg::after {
  @include dots(40);
    animation-duration: 43s;
    animation-delay: -32s;
  }

  .animated-bg::before {
  @include dots(40);
    animation-duration: 42s;
    animation-delay: -23s;
  }

  .animated-bg::after {
  @include dots(40);
    animation-duration: 41s;
    animation-delay: -19s;
  }

  @keyframes move {
    from {
      transform: rotate(0deg) scale(12) translateX(-20px);
    }
    to {
      transform: rotate(360deg) scale(18) translateX(20px);
    }
  }
</style>
