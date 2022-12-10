import { route } from 'quasar/wrappers';
import { createRouter, createWebHistory } from 'vue-router';

import routes from './routes';
import { shouldRefreshToken } from 'stores/token.utils';
import { useAuthStore } from 'stores/auth-store';

export const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'exact-active-link',
});

export default route(function (/* { store, ssrContext } */) {
  router.beforeEach(async () => {
    if (
      useAuthStore().isLoggedIn &&
      shouldRefreshToken(useAuthStore().accessToken)
    ) {
      await useAuthStore().refreshAccessToken();
    }
    return true;
  });

  return router;
});
