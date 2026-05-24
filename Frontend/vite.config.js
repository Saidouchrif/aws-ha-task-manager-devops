import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const allowAllHosts = env.VITE_ALLOW_ALL_HOSTS === 'true'

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      allowedHosts: allowAllHosts
        ? true
        : [
            'ha-load-balancer-113284686.us-east-1.elb.amazonaws.com'
          ]
    }
  }
})
