import { routes as BookingRoutes } from ':modules/booking/app'
import { routes as CoreRoutes } from ':modules/core/app'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...BookingRoutes,

    /**
     *  INFO Необходимо, чтобы пути модуля core были последними в списке
     */
    ...CoreRoutes,
  ],
})

export {
  router,
}
