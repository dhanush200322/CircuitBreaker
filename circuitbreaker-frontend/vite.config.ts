import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/gateway': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gateway/, '')
      },
      '/actuator': {
        target: 'http://localhost:8083/actuator',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/actuator/, '')
      },
      '/eureka-api': {
        target: 'http://localhost:8080/eureka',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/eureka-api/, ''),
        headers: {
          'Accept': 'application/json'
        }
      }
    }
  }
})
