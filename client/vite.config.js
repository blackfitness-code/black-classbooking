import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Enable Vue DevTools even in production builds so the browser
  // extension can inspect the app outside of `vite dev`.
  define: {
    __VUE_PROD_DEVTOOLS__: 'true'
  },
  server: {
    port: 3000,
    host: true,
    // Allow tunnel hosts (ngrok / cloudflare) when testing on a phone
    allowedHosts: ['.ngrok-free.app', '.ngrok.io', '.trycloudflare.com', '.loca.lt']
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