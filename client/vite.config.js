import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase': ['firebase/app', 'firebase/firestore'],
          'liff': ['@line/liff'],
          'vendor': ['vue', 'vue-router', 'pinia'],
          'swal': ['sweetalert2'],
          'datefns': ['date-fns'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'date-fns']
  }
})