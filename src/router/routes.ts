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
import { useAuthStore } from 'stores/auth-store';
import { useAppStore } from 'stores/app-store';

const loginGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (!useAuthStore().isLoggedIn) {
    next({ name: 'login', params: { language: useAppStore().language } });
  } else if (!useAuthStore().isConfirmed) {
    next({
      name: 'verification-pending',
      params: { language: useAppStore().language },
    });
  } else {
    next();
  }
};

const guestMaxPlayGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (
    (useAppStore().noOfGamesPlayedAsGuest > 1 || useAuthStore().hasAccount) &&
    (!useAuthStore().isLoggedIn || !useAuthStore().isConfirmed)
  ) {
    next({ name: 'login', params: { language: useAppStore().language } });
  } else {
    next();
  }
};

const routes: RouteRecordRaw[] = [
  {
    path: '/:language(es|de|en)?',
    component: MainLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('src/components/auth/LoginView.vue'),
        beforeEnter: (
          to: RouteLocationNormalized,
          from: RouteLocationNormalized,
          next: NavigationGuardNext
        ) => {
          if (useAuthStore().isLoggedIn && useAuthStore().isConfirmed) {
            next({
              name: 'user-settings',
              params: { language: useAppStore().language },
            });
          } else if (useAuthStore().isLoggedIn && !useAuthStore().isConfirmed) {
            next({
              name: 'verification-pending',
              params: { language: useAppStore().language },
            });
          } else {
            next();
          }
        },
      },
      {
        path: 'signup',
        name: 'signup',
        component: () => import('src/components/auth/SignupView.vue'),
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('src/components/auth/ResetPassword.vue'),
      },
      {
        path: 'set-new-password',
        name: 'set-new-password',
        component: () => import('src/components/auth/SetNewPassword.vue'),
      },
      {
        path: 'verification-pending',
        name: 'verification-pending',
        component: () => import('src/components/auth/VerificationPending.vue'),
      },
      {
        path: 'user-settings',
        name: 'user-settings',
        component: () => import('src/components/auth/UserSettings.vue'),
        beforeEnter: loginGuard,
      },
      { path: '', component: StartScreen, name: 'home' },
      {
        path: 'train',
        component: ExerciseBaseLayout,
        beforeEnter: guestMaxPlayGuard,
        children: [
          {
            path: '',
            name: 'select-exercise',
            component: GameSelectionView,
            beforeEnter: guestMaxPlayGuard,
          },
          {
            path: ':difficulty(easy|normal|hard)',
            component: ExerciseView,
            beforeEnter: guestMaxPlayGuard,
            name: 'exercise',
            children: [
              {
                path: ':game(remember-numbers)',
                name: 'remember-numbers',
                component: () => import('src/components/exercises/RememberNumbers.vue'),
              },
              {
                path: ':game(remember-numbers-rev)',
                name: 'remember-numbers-rev',
                component: () => import('src/components/exercises/RememberNumbers.vue'),
              },
              {
                path: ':game(mental-arithmetic)',
                name: 'mental-arithmetic',
                component: () => import('src/components/exercises/MentalArithmetic.vue'),
              },
              {
                path: ':game(mental-arithmetic-mul)',
                name: 'mental-arithmetic-mul',
                component: () => import('src/components/exercises/MentalArithmetic.vue'),
              },
              {
                path: ':game(solve-equation)',
                name: 'solve-equation',
                component: () => import('src/components/exercises/SolveEquation.vue'),
              },
              {
                path: ':game(listen-backwards)',
                name: 'listen-backwards',
                component: () => import('src/components/exercises/ListenBackwards.vue'),
              },
              {
                path: ':game(remember-words)',
                name: 'remember-words',
                component: () => import('src/components/exercises/RememberWords.vue'),
              },
              {
                path: ':game(remember-words-rev)',
                name: 'remember-words-rev',
                component: () => import('src/components/exercises/RememberWords.vue'),
              },
              {
                path: ':game(spell-backwards)',
                name: 'spell-backwards',
                component: () => import('src/components/exercises/SpellBackwards.vue'),
              },
              {
                path: ':game(memory)',
                name: 'memory',
                component: () => import('src/components/exercises/AudioMemory.vue'),
              },
              {
                path: ':game(memory-animals)',
                name: 'memory-animals',
                component: () => import('src/components/exercises/AudioMemory.vue'),
              },
              {
                path: ':game(word-scramble)',
                name: 'word-scramble',
                component: () => import('src/components/exercises/WordScramble.vue'),
              },
              {
                path: ':game(math-marathon)',
                name: 'math-marathon',
                component: () => import('src/components/exercises/MathMarathon.vue'),
              },
              {
                path: ':game(find-relative)',
                name: 'find-relative',
                component: () => import('src/components/exercises/FindRelative.vue'),
              },
              {
                path: ':game(remember-names)',
                name: 'remember-names',
                component: () => import('src/components/exercises/RememberNames.vue'),
              },
              {
                path: ':game(find-matching-person)',
                name: 'find-matching-person',
                component: () => import('src/components/exercises/FindMatchingPerson.vue'),
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
      },
      {
        path: 'highscores',
        name: 'highscores',
        component: () => import('src/components/highscores/HighscoresView.vue'),
      },
      {
        path: 'player-scores',
        name: 'player-scores',
        component: () => import('src/components/player-scores/PlayerScoresLayout.vue'),
        beforeEnter: loginGuard
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
