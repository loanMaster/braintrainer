<template>
  <div class="column flex-auto relative-position full-width items-center">
    <ExerciseHUD class="self-stretch"/>
    <div
      ref="instructionsWrapper"
      class="column justify-center flex-auto content-center"
    >
      <div ref="instructions">
        <ExerciseInstructions @confirm="start" />
      </div>
    </div>
    <div ref="exercise" class="column justify-center flex-auto content">
      <router-view></router-view>
    </div>
    <ExerciseFooter />
  </div>
</template>

<script setup lang="ts">
import ExerciseInstructions from 'src/components/exercises/shared/ExerciseInstructions.vue';
import ExerciseHUD from 'src/components/exercises/shared/ExerciseHUD.vue';
import ExerciseFooter from 'src/components/exercises/shared/ExerciseFooter.vue';
import { TweenService } from 'src/shared-services/tween.service';
import { onMounted, ref } from 'vue';
import { useAppStore } from 'stores/app-store';

const instructions = ref();
const exercise = ref();
const instructionsWrapper = ref();
const store = useAppStore();

onMounted(async () => {
  await new TweenService().setDisplay(exercise.value, 'none');
  await new TweenService().animateCSS(instructions.value, 'bounceInDown', 1.25);
});

async function start() {
  await new TweenService().animateCSS(instructions.value, 'bounceOutUp', 1);
  new TweenService().setDisplay(instructionsWrapper.value, 'none');
  new TweenService().setDisplay(exercise.value, 'flex');
  store.beginExercise();
}
</script>
