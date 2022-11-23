import {RouteRecordRaw} from 'vue-router';
import DifficultySelectionView from 'src/components/exercises/exercise-selection-menu/DifficultySelectionView.vue'
import RememberNumbers from 'src/components/exercises/RememberNumbers.vue'
import ScoreScreenView from 'src/components/score-screen/ScoreScreenView.vue'
import GameSelectionView from 'src/components/exercises/exercise-selection-menu/GameSelectionView.vue'
import HighscoresView from 'src/components/highscores/HighscoresView.vue'
import ExerciseView from 'src/components/exercises/ExerciseView.vue'
import DocumentationView from 'src/components/documentation/DocumentationView.vue'
import PlayerScoresView from 'src/components/player-scores/PlayerScoresView.vue'
import ExerciseBaseLayout from 'src/components/exercises/ExerciseBaseLayout.vue'
import MainLayout from 'src/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {path: '', component: GameSelectionView},
      {
        path: '/play',
        component: ExerciseBaseLayout,
        children: [
          {
            path: '',
            name: 'select-exercise',
            component: GameSelectionView
          },
          {
            path: '/play/select-difficulty/:game',
            name: 'select-difficulty',
            component: DifficultySelectionView
          },
          {
            path: '/play/:game/:difficulty',
            component: ExerciseView,
            name: 'exercise',
            children: [{
              path: '',
              name: 'rememberNumbers',
              component: RememberNumbers
            }]
          }
        ]
      },
      {
        path: '/score-screen',
        name: 'scorescreen',
        component: ScoreScreenView
      },
      {
        path: '/highscores',
        name: 'highscores',
        component: HighscoresView
      },
      {
        path: '/documentation',
        name: 'DocumentationView',
        component: DocumentationView
      },
      {
        path: '/player-scores',
        name: 'PlayerScores',
        component: PlayerScoresView
      }
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
