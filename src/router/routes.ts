import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import DifficultySelectionView from 'src/components/exercises/exercise-selection-menu/DifficultySelectionView.vue';
import ScoreScreenView from 'src/components/score-screen/ScoreScreenView.vue';
import GameSelectionView from 'src/components/exercises/exercise-selection-menu/GameSelectionView.vue';
import ExerciseView from 'src/components/exercises/ExerciseView.vue';
import ExerciseBaseLayout from 'src/components/exercises/ExerciseBaseLayout.vue';
import StartScreen from 'src/components/start/StartScreen.vue';
import MainLayout from 'src/layouts/MainLayout.vue';
import { useAppStore } from 'stores/app-store';

const exerciseFinishedGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (useAppStore().exercise.state !== 'finished') {
    next({ name: 'home', params: { language: useAppStore().language } });
  } else {
    next();
  }
};

const routes: RouteRecordRaw[] = [
  {
    path: '/:language(de|en)?',
    component: MainLayout,
    children: [
      {
        path: 'user-settings',
        name: 'user-settings',
        component: () => import('src/components/auth/UserSettings.vue'),
      },
      { path: '', component: StartScreen, name: 'home' },
      {
        path: 'train',
        component: ExerciseBaseLayout,
        children: [
          {
            path: '',
            name: 'select-exercise',
            component: GameSelectionView,
          },
          {
            path: ':difficulty(normal|hard|veryhard)',
            component: ExerciseView,
            name: 'exercise',
            children: [
              {
                path: ':game(remember-numbers)',
                name: 'remember-numbers',
                component: () =>
                  import('src/components/exercises/RememberNumbers.vue'),
              },
              {
                path: ':game(remember-numbers-rev)',
                name: 'remember-numbers-rev',
                component: () =>
                  import('src/components/exercises/RememberNumbers.vue'),
              },
              {
                path: ':game(mental-arithmetic)',
                name: 'mental-arithmetic',
                component: () =>
                  import('src/components/exercises/MentalArithmetic.vue'),
              },
              {
                path: ':game(mental-arithmetic-mul)',
                name: 'mental-arithmetic-mul',
                component: () =>
                  import('src/components/exercises/MentalArithmetic.vue'),
              },
              {
                path: ':game(solve-equation)',
                name: 'solve-equation',
                component: () =>
                  import('src/components/exercises/SolveEquation.vue'),
              },
              {
                path: ':game(remember-words)',
                name: 'remember-words',
                component: () =>
                  import('src/components/exercises/RememberWords.vue'),
              },
              {
                path: ':game(remember-words-rev)',
                name: 'remember-words-rev',
                component: () =>
                  import('src/components/exercises/RememberWords.vue'),
              },
              {
                path: ':game(spell-backwards)',
                name: 'spell-backwards',
                component: () =>
                  import('src/components/exercises/SpellBackwards.vue'),
              },
              {
                path: ':game(language-basics)',
                name: 'language-basics',
                component: () =>
                  import('src/components/exercises/LanguageBasics.vue'),
              },
              {
                path: ':game(voices-memory)',
                name: 'voices-memory',
                component: () =>
                  import('src/components/exercises/AudioMemory.vue'),
              },
              {
                path: ':game(picture-memory)',
                name: 'picture-memory',
                component: () =>
                  import('src/components/exercises/PictureMemory.vue'),
              },
              {
                path: ':game(countries-and-capitals)',
                name: 'countries-and-capitals',
                component: () =>
                  import('src/components/exercises/CountriesAndCapitals.vue'),
              },
              {
                path: ':game(memory)',
                name: 'memory',
                component: () =>
                  import('src/components/exercises/AudioMemory.vue'),
              },
              {
                path: ':game(memory-animals)',
                name: 'memory-animals',
                component: () =>
                  import('src/components/exercises/AudioMemory.vue'),
              },
              {
                path: ':game(word-scramble)',
                name: 'word-scramble',
                component: () =>
                  import('src/components/exercises/WordScramble.vue'),
              },
              {
                path: ':game(math-marathon)',
                name: 'math-marathon',
                component: () =>
                  import('src/components/exercises/MathMarathon.vue'),
              },
              {
                path: ':game(find-relative)',
                name: 'find-relative',
                component: () =>
                  import('src/components/exercises/FindRelative.vue'),
              },
              {
                path: ':game(remember-names)',
                name: 'remember-names',
                component: () =>
                  import('src/components/exercises/RememberNames.vue'),
              },
              {
                path: ':game(find-matching-person)',
                name: 'find-matching-person',
                component: () =>
                  import('src/components/exercises/FindMatchingPerson.vue'),
              },
            ],
          },
          {
            path: 'select-difficulty/:game',
            name: 'select-difficulty',
            component: DifficultySelectionView,
          },
        ],
      },
      {
        path: 'score-screen',
        name: 'score-screen',
        component: ScoreScreenView,
        beforeEnter: exerciseFinishedGuard,
      },
      {
        path: 'player-scores',
        name: 'player-scores',
        component: () =>
          import('src/components/player-scores/PlayerScoresLayout.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
