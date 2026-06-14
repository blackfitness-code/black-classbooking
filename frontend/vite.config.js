import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'

// อ่าน version จาก package.json + เวลา build (เวลาไทย) เพื่อโชว์ในแอพ
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))
const buildTime = new Date()
  .toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok' })
  .slice(0, 16) // "YYYY-MM-DD HH:mm"

export default defineConfig({
  plugins: [vue()],
  // Enable Vue DevTools even in production builds so the browser
  // extension can inspect the app outside of `vite dev`.
  define: {
    __VUE_PROD_DEVTOOLS__: 'true',
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime)
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