import { RouteRecordRaw } from 'vue-router';
import DifficultySelectionView from 'src/components/exercise-selection-menu/DifficultySelectionView.vue'
import RememberNumbers from 'src/components/exercises/RememberNumbers.vue'
import ScoreScreenView from 'src/components/score-screen/ScoreScreenView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('components/exercise-selection-menu/GameSelectionView.vue') }],
  },
  {
    path: '/play/:game/:difficulty',
    name: 'rememberNumbers',
    component: RememberNumbers
  },
  {
    path: '/play/:game',
    name: 'difficulty',
    component: DifficultySelectionView
  },
  {
    path: '/score-screen',
    name: 'scorescreen',
    component: ScoreScreenView
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
