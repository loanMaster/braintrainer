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
import FindMatchingPerson from 'src/components/exercises/FindMatchingPerson.vue';
import AudioMemory from 'src/components/exercises/AudioMemory.vue';
import SpellBackwards from 'src/components/exercises/SpellBackwards.vue';
import ListenBackwards from 'src/components/exercises/ListenBackwards.vue';
import MentalArithmetic from 'src/components/exercises/MentalArithmetic.vue';
import SolveEquation from 'src/components/exercises/SolveEquation.vue';
import ScoreScreenView from 'src/components/score-screen/ScoreScreenView.vue';
import GameSelectionView from 'src/components/exercises/exercise-selection-menu/GameSelectionView.vue';
import HighscoresView from 'src/components/highscores/HighscoresView.vue';
import ExerciseView from 'src/components/exercises/ExerciseView.vue';
import PlayerScoresLayout from 'src/components/player-scores/PlayerScoresLayout.vue';
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
                component: RememberNumbers,
              },
              {
                path: ':game(remember-numbers-rev)',
                name: 'remember-numbers-rev',
                component: RememberNumbers,
              },
              {
                path: ':game(mental-arithmetic)',
                name: 'mental-arithmetic',
                component: MentalArithmetic,
              },
              {
                path: ':game(mental-arithmetic-mul)',
                name: 'mental-arithmetic-mul',
                component: MentalArithmetic,
              },
              {
                path: ':game(solve-equation)',
                name: 'solve-equation',
                component: SolveEquation,
              },
              {
                path: ':game(listen-backwards)',
                name: 'listen-backwards',
                component: ListenBackwards,
              },
              {
                path: ':game(remember-words)',
                name: 'remember-words',
                component: RememberWords,
              },
              {
                path: ':game(remember-words-rev)',
                name: 'remember-words-rev',
                component: RememberWords,
              },
              {
                path: ':game(spell-backwards)',
                name: 'spell-backwards',
                component: SpellBackwards,
              },
              {
                path: ':game(memory)',
                name: 'memory',
                component: AudioMemory,
              },
              {
                path: ':game(memory-animals)',
                name: 'memory-animals',
                component: AudioMemory,
              },
              {
                path: ':game(word-scramble)',
                name: 'word-scramble',
                component: WordScramble,
              },
              {
                path: ':game(math-marathon)',
                name: 'math-marathon',
                component: MathMarathon,
              },
              {
                path: ':game(find-relative)',
                name: 'find-relative',
                component: FindRelative,
              },
              {
                path: ':game(remember-names)',
                name: 'remember-names',
                component: RememberNames,
              },
              {
                path: ':game(find-matching-person)',
                name: 'find-matching-person',
                component: FindMatchingPerson,
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
        path: 'player-scores',
        name: 'player-scores',
        component: PlayerScoresLayout,
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
