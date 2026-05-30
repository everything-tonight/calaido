import path from 'node:path'
import VitePluginTailwindCSS from '@tailwindcss/vite'
import VitePluginVue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import VitePluginVueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => {
  const PROJECT_ROOT_DIR = path.resolve(__dirname)

  const ENV_PREFIX_CLIENT = 'CLIENT'
  const ENV_PREFIX_SERVER = 'SERVER'

  const {
    SERVER_HOST,
    SERVER_PORT,
  } = loadEnv(mode, '.', ENV_PREFIX_SERVER)

  return {
    server: {
      host: SERVER_HOST,
      strictPort: true,
      port: Number.parseInt(SERVER_PORT),
    },
    envPrefix: ENV_PREFIX_CLIENT,
    plugins: [
      VitePluginVue(),
      VitePluginVueDevTools(),
      VitePluginTailwindCSS(),
    ],
    resolve: {
      alias: {
        ':app': path.resolve(PROJECT_ROOT_DIR, 'src', 'app'),
        ':modules': path.resolve(PROJECT_ROOT_DIR, 'src', 'modules'),
      },
    },
  }
})
