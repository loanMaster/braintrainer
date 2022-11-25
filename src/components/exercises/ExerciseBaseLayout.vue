<template>
  <div class="column flex-auto relative-position" :style="{ 'overflow-x': overflow }">

    <ExerciseHeader/>
    <div class="container">
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
      <div class="circle-container"><div class="circle"></div></div>
    </div>
      <router-view v-slot="{ Component }">
        <transition mode="out-in"
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
import ExerciseHeader from 'src/components/exercises/shared/ExerciseHeader.vue'
import { ref } from 'vue'
import {useRouter} from "vue-router";
const router = useRouter()

const refEnterClass = ref('fadeIn')
const refLeaveClass = ref('fadeIn')
const overflow = ref('hidden')

router.beforeEach((to, from) => {
  overflow.value = 'hidden'
  if (to.name === 'select-difficulty' && String(from.name) === 'select-exercise') {
    refEnterClass.value = 'slideInRight'
    refLeaveClass.value = 'slideOutLeft'
  } else if (String(from.name) === 'select-difficulty' && to.name === 'select-exercise') {
    refEnterClass.value = 'slideInLeft'
    refLeaveClass.value = 'slideOutRight'
  } else {
    refEnterClass.value = 'fadeIn'
    refLeaveClass.value = 'fadeOut'
  }
})
router.afterEach(() => {
  setTimeout(() => {
    overflow.value = 'visible'
  }, 1000)
})
</script>

<style lang="scss">

  .container {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: black;
  }

  .background {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    width: 100%;
    height: 100%;

    mask-image: radial-gradient(
        white 0%,
        white 30%,
        transparent 80%,
        transparent
    );
  }

  .circle-container {
    $particleNum: 200;
    $particleColor: hsl(180, 100%, 80%);

    position: absolute;
    transform: translateY(-10vh);
    animation-iteration-count: infinite;
    animation-timing-function: linear;

    .circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      mix-blend-mode: screen;
      background-image: radial-gradient(
          hsl(180, 100%, 80%),
          hsl(180, 100%, 80%) 10%,
          hsla(180, 100%, 80%, 0) 56%
      );

      animation: fadein-frames 200ms infinite, scale-frames 2s infinite;

      @keyframes fade-frames {
        0% {
          opacity: 1;
        }

        50% {
          opacity: 0.7;
        }

        100% {
          opacity: 1;
        }
      }

      @keyframes scale-frames {
        0% {
          transform: scale3d(0.4, 0.4, 1);
        }

        50% {
          transform: scale3d(2.2, 2.2, 1);
        }

        100% {
          transform: scale3d(0.4, 0.4, 1);
        }
      }
    }

    $particleBaseSize: 8;

    @for $i from 1 through $particleNum {
      &:nth-child(#{$i}) {
        $circleSize: random($particleBaseSize);
        width: $circleSize + px;
        height: $circleSize + px;

        $startPositionY: random(10) + 100;
        $framesName: "move-frames-" + $i;
        $moveDuration: 28000 + random(9000) + ms;

        animation-name: #{$framesName};
        animation-duration: $moveDuration;
        animation-delay: random(37000) + ms;

        @keyframes #{$framesName} {
          from {
            transform: translate3d(random(100) + vw, $startPositionY + vh, 0);
          }

          to {
            transform: translate3d(random(100) + vw, -$startPositionY - random(30) + vh, 0);
          }
        }

        .circle {
          animation-delay: random(4000) + ms;
        }
      }
    }
  }

</style>
