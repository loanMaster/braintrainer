import { route } from 'quasar/wrappers';
import { createRouter, createWebHashHistory } from 'vue-router';

import routes from './routes';

export const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  history: createWebHashHistory(),
  routes,
  linkActiveClass: 'router-link-active',
  linkExactActiveClass: 'exact-active-link',
});

export default route(function (/* { store, ssrContext } */) {
  return router;
});
