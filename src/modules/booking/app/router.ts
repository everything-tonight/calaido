import type { RouteRecordRaw } from 'vue-router'

const routes = [
  {
    path: '/booking',
    component: async () => (await import(':modules/core/layouts/dashboard-layout')).DashboardLayout,
    children: [
      {
        path: '',
        name: 'booking',
        component: async () => (await import(':modules/booking/pages/booking')).BookingPage,
      },
    ],
  },
] satisfies RouteRecordRaw[]

export {
  routes,
}
