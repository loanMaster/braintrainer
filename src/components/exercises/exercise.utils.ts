import {newExercise, useAppStore} from "stores/app-store";
import {getNameOfTheGame} from "src/util/game.name.helper";
import {RouteLocationNormalizedLoaded, useRoute} from "vue-router";
import {NavService} from "src/router/nav.service";
import {calculateRating} from "src/util/calculate-rating";

export const exerciseUtils = {
  wait: (time: number)  => new Promise(resolve => setTimeout(resolve, time)),
  difficulty: (route: RouteLocationNormalizedLoaded) => route.params.difficulty as string,
  nameOfTheGame: (route: RouteLocationNormalizedLoaded) => getNameOfTheGame(route.params.game as string),
  finishExercise: () => {
    useAppStore().finishExercise()
    new NavService().navigateTo({
      name: 'score'
    })
  },
  beginExercise: (numberOfQuestions: number) => {
    useAppStore().$patch({
      exercise: newExercise(
        getNameOfTheGame(useRoute().params.game as string),
        useRoute().params.difficulty as string,
        numberOfQuestions
      )
    })
  }
}
