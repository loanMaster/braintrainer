import { newExercise, useAppStore } from 'stores/app-store';
import { getNameOfTheGame } from 'src/util/game.name.helper';
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';
import { SoundService } from 'src/shared-services/sound.service';
import { Ref } from 'vue';
import { TweenService } from 'src/shared-services/tween.service';
import { router } from 'src/router';

export const exerciseUtils = {
  wait: (time: number) => new Promise((resolve) => setTimeout(resolve, time)),
  difficulty: (route: RouteLocationNormalizedLoaded) =>
    route.params.difficulty as string,
  nameOfTheGame: (route: RouteLocationNormalizedLoaded) =>
    route.params.game as string,
  finishExercise: () => {
    useAppStore().finishExercise();
    router.push({
      name: 'score-screen',
      params: { language: useAppStore().language },
    });
  },
  handleMistake: function (
    reveal: () => any,
    elementToWiggle: Ref<HTMLElement>
  ) {
    if (useAppStore().strike()) {
      new SoundService().playError();
      if (useAppStore().exercise.strikes >= 3) {
        reveal();
      }
    }
    new TweenService().wiggle(elementToWiggle.value);
  },
  createExercise: (numberOfQuestions: number) => {
    useAppStore().$patch((store) => {
      store.exercise = newExercise(
        useRoute().params.game as string,
        useRoute().params.difficulty as string,
        numberOfQuestions
      );
    });
  },
  prepareNewQuestion: async ({
    inputDisabled,
    soundService,
    revealed,
  }: {
    inputDisabled: Ref<boolean>;
    revealed: Ref<boolean>;
    soundService: SoundService;
  }): Promise<boolean> => {
    inputDisabled.value = true;
    soundService.stop();
    useAppStore().$patch((store) => store.exercise.currentQuestion++);
    if (
      useAppStore().exercise.currentQuestion >
      useAppStore().exercise.totalQuestions
    ) {
      await exerciseUtils.wait(200);
      await useAppStore().finishExercise();
      await router.push({
        name: 'score-screen',
        params: { language: useAppStore().language },
      });
      return false;
    } else {
      useAppStore().$patch((store) => (store.exercise.strikes = 0));
      revealed.value = false;
      return true;
    }
  },
  getSoundForMathOp: (op: string) => {
    switch (op) {
      case '+':
        return { src: `/sounds/${useAppStore().language}_+.mp3` };
      case '-':
        return { src: `/sounds/${useAppStore().language}_−.mp3` };
      case '*':
        return { src: `/sounds/${useAppStore().language}_×.mp3` };
      default:
        return { src: `/sounds/${useAppStore().language}_÷.mp3` };
    }
  },
};
