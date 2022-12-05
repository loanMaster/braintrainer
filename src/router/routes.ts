import { RouteRecordRaw } from 'vue-router';
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
import MainLayout from 'src/layouts/MainLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/:language(es|de)?',
    component: MainLayout,
    children: [
      { path: '', component: GameSelectionView },
      {
        path: 'play',
        component: ExerciseBaseLayout,
        children: [
          {
            path: '',
            name: 'select-exercise',
            component: GameSelectionView,
          },
          {
            path: ':difficulty(easy|normal|hard)',
            component: ExerciseView,
            name: 'exercise',
            children: [
              {
                path: ':game(remembernumbers)',
                name: 'RememberNumbers',
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
        name: 'scorescreen',
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
        children: [
          {
            path: '',
            name: 'playerscores',
            component: PlayerScoresView,
          },
          {
            path: ':game/:difficulty',
            name: 'playerprogress',
            component: PlayerProgressView,
          }
        ]
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
