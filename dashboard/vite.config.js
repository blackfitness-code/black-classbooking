import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/dashboard/',
  plugins: [vue()],
  server: {
    port: 3001,
    host: true,
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.trycloudflare.com', '.loca.lt']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue'],
        }
      }
    }
  }
})
