import {
  NavigationGuardNext,
  RouteLocationNormalized,
  RouteRecordRaw,
} from 'vue-router';
import DifficultySelectionView from 'src/components/exercises/exercise-selection-menu/DifficultySelectionView.vue';
import RememberNumbers from 'src/components/exercises/RememberNumbers.vue';
import WordScramble from 'src/components/exercises/WordScramble.vue';
import MathMarathon from 'src/components/exercises/MathMarathon.vue';
import RememberWords from 'src/components/exercises/RememberWords.vue';
import FindRelative from 'src/components/exercises/FindRelative.vue';
import RememberNames from 'src/components/exercises/RememberNames.vue';
import AudioMemory from 'src/components/exercises/AudioMemory.vue';
import SpellBackwards from 'src/components/exercises/SpellBackwards.vue';
import ListenBackwards from 'src/components/exercises/ListenBackwards.vue';
import MentalArithmetic from 'src/components/exercises/MentalArithmetic.vue';
import SolveEquation from 'src/components/exercises/SolveEquation.vue';
import ScoreScreenView from 'src/components/score-screen/ScoreScreenView.vue';
import GameSelectionView from 'src/components/exercises/exercise-selection-menu/GameSelectionView.vue';
import HighscoresView from 'src/components/highscores/HighscoresView.vue';
import ExerciseView from 'src/components/exercises/ExerciseView.vue';
import DocumentationView from 'src/components/documentation/DocumentationView.vue';
import PlayerScoresView from 'src/components/player-scores/PlayerScoresView.vue';
import PlayerScoresLayout from 'src/components/player-scores/PlayerScoresLayout.vue';
import PlayerProgressView from 'src/components/player-scores/PlayerProgressView.vue';
import ExerciseBaseLayout from 'src/components/exercises/ExerciseBaseLayout.vue';
import StartScreen from 'src/components/start/StartScreen.vue';
import LoginView from 'src/components/auth/LoginView.vue';
import ResetPassword from 'src/components/auth/ResetPassword.vue';
import VerificationPending from 'src/components/auth/VerificationPending.vue';
import SetNewPassword from 'src/components/auth/SetNewPassword.vue';
import SignUpView from 'src/components/auth/SignUpView.vue';
import UserSettings from 'src/components/auth/UserSettings.vue';
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
        component: LoginView,
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
        component: SignUpView,
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: ResetPassword,
      },
      {
        path: 'set-new-password',
        name: 'set-new-password',
        component: SetNewPassword,
      },
      {
        path: 'verification-pending',
        name: 'verification-pending',
        component: VerificationPending,
      },
      {
        path: 'user-settings',
        name: 'user-settings',
        component: UserSettings,
        beforeEnter: loginGuard,
      },
      { path: '', component: StartScreen, name: 'home' },
      {
        path: 'play',
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
                path: ':game(remembernumbers)',
                name: 'remembernumbers',
                component: RememberNumbers,
              },
              {
                path: ':game(mentalarithmetic)',
                name: 'mentalarithmetic',
                component: MentalArithmetic,
              },
              {
                path: ':game(solveequation)',
                name: 'solveequation',
                component: SolveEquation,
              },
              {
                path: ':game(listenbackwards)',
                name: 'listenbackwards',
                component: ListenBackwards,
              },
              {
                path: ':game(rememberwords)',
                name: 'rememberwords',
                component: RememberWords,
              },
              {
                path: ':game(spellbackwards)',
                name: 'spellbackwards',
                component: SpellBackwards,
              },
              {
                path: ':game(memory)',
                name: 'memory',
                component: AudioMemory,
              },
              {
                path: ':game(wordscramble)',
                name: 'wordscramble',
                component: WordScramble,
              },
              {
                path: ':game(mathmarathon)',
                name: 'mathmarathon',
                component: MathMarathon,
              },
              {
                path: ':game(findrelative)',
                name: 'findrelative',
                component: FindRelative,
              },
              {
                path: ':game(remembernames)',
                name: 'remembernames',
                component: RememberNames,
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
        component: HighscoresView,
      },
      {
        path: 'documentation',
        name: 'documentation',
        component: DocumentationView,
      },
      {
        path: 'player-scores',
        name: '',
        component: PlayerScoresLayout,
        beforeEnter: loginGuard,
        children: [
          {
            path: '',
            name: 'player-scores',
            component: PlayerScoresView,
          },
          {
            path: ':game/:difficulty',
            name: 'playerprogress',
            component: PlayerProgressView,
          },
        ],
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
