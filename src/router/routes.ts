import { RouteRecordRaw } from 'vue-router';
import DifficultySelectionView from 'src/components/exercise-selection-menu/DifficultySelectionView.vue'
import RememberNumbers from 'src/components/exercises/RememberNumbers.vue'
import ScoreScreenView from 'src/components/score-screen/ScoreScreenView.vue'
import GameSelectionView from 'src/components/exercise-selection-menu/GameSelectionView.vue'
import ExerciseView from 'src/components/exercises/ExerciseView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
        { path: '', component: GameSelectionView },
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
        }
      ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
