import { createApp } from 'vue'
import App from './App.vue'
import { pinia } from './plugins/pinia'
import { piniaColada } from './plugins/pinia-colada'
import { unhead } from './plugins/unhead'
import { router } from './plugins/vue-router'
import './assets/styles/main.css'

const app = createApp(App)

app
  .use(router)
  .use(unhead)
  .use(pinia)
  .use(piniaColada)

app.mount('#app')
