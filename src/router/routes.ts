import { RouteRecordRaw } from 'vue-router';
import DifficultySelectionView from 'src/components/exercise-selection-menu/DifficultySelectionView.vue'
import RememberNumbers from 'src/components/exercises/RememberNumbers.vue'
import ScoreScreenView from 'src/components/score-screen/ScoreScreenView.vue'
import GameSelectionView from 'src/components/exercise-selection-menu/GameSelectionView.vue'
import HighscoresView from 'src/components/highscores/HighscoresView.vue'
import DocumentationView from 'src/components/documentation/DocumentationView.vue'
import PlayerScoresView from 'src/components/player-scores/PlayerScoresView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
        { path: '', component: GameSelectionView },
        {
          path: 'play',
          name: 'gameselection',
          component: GameSelectionView
        },
        {
          path: 'play/:game',
          name: 'difficulty',
          component: DifficultySelectionView
        },
        {
          path: '/play/:game/:difficulty',
          name: 'rememberNumbers',
          component: RememberNumbers
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
