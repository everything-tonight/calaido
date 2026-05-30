import type { RouteRecordRaw } from 'vue-router'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    component: async () => (await import(':modules/core/pages/not-found')).NotFoundPage,
  },
] satisfies RouteRecordRaw[]

export {
  routes,
}
