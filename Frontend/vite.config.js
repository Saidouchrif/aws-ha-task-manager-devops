import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const allowAllHosts = env.VITE_ALLOW_ALL_HOSTS === 'true'
  const apiProxyTarget = env.VITE_INTERNAL_API_URL || 'http://backend:5000'

  const apiProxy = {
    '/api': {
      target: apiProxyTarget,
      changeOrigin: true
    }
  }

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
          ],
      proxy: apiProxy
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
      proxy: apiProxy
    }
  }
})
