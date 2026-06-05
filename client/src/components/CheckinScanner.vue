<template>
  <div>
    <!-- Scanner viewport -->
    <div class="relative rounded-3xl overflow-hidden bg-black aspect-square max-w-sm mx-auto shadow-xl">
      <video ref="videoEl" class="w-full h-full object-cover" playsinline muted></video>

      <!-- corner brackets + scan line -->
      <div v-if="scanning && !result" class="absolute inset-0 pointer-events-none">
        <div class="absolute inset-6">
          <span class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/90 rounded-tl-xl"></span>
          <span class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/90 rounded-tr-xl"></span>
          <span class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/90 rounded-bl-xl"></span>
          <span class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/90 rounded-br-xl"></span>
        </div>
        <div class="scan-line absolute left-8 right-8 h-0.5 bg-primary shadow-[0_0_10px_2px_rgba(0,0,0,0.4)]"></div>
      </div>

      <!-- status pill -->
      <div v-if="scanning && !result" class="absolute top-3 left-1/2 -translate-x-1/2">
        <span class="flex items-center gap-1.5 bg-black/50 backdrop-blur text-white text-xs font-medium px-3 py-1.5 rounded-full">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          กำลังสแกน — ส่อง QR บัตรสมาชิก
        </span>
      </div>

      <!-- BIG result overlay (glanceable) -->
      <transition name="result">
        <div
          v-if="result"
          :class="[
            'absolute inset-0 flex flex-col items-center justify-center text-center p-6',
            result.ok ? 'bg-green-500/95' : 'bg-red-500/95'
          ]"
        >
          <div class="relative mb-3">
            <img
              v-if="result.pictureUrl"
              :src="result.pictureUrl"
              class="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            >
            <div v-else class="w-24 h-24 rounded-full bg-white/25 border-4 border-white flex items-center justify-center">
              <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
            </div>
            <div class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow">
              <svg v-if="result.ok" class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              <svg v-else class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </div>
          </div>
          <p class="text-white text-2xl font-extrabold leading-tight drop-shadow">{{ result.title }}</p>
          <p v-if="result.name" class="text-white text-lg font-semibold mt-1">{{ result.name }}</p>
          <p v-if="result.detail" class="text-white/90 text-sm mt-1">{{ result.detail }}</p>
        </div>
      </transition>

      <!-- camera-off / error state -->
      <div v-if="!scanning" class="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gray-900">
        <svg class="w-14 h-14 text-white/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <p class="text-white/70 text-sm">{{ errorMsg || 'กดปุ่มด้านล่างเพื่อเปิดกล้อง' }}</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex justify-center gap-3 mt-4">
      <button
        v-if="!scanning"
        @click="start"
        class="btn-primary flex items-center gap-2 px-6"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm13 0h3m-3 3v3m3-3h-3m3 3h-3"/></svg>
        เปิดกล้องสแกน
      </button>
      <button
        v-else
        @click="stop"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        หยุดสแกน
      </button>
    </div>

    <!-- Unsupported notice -->
    <p v-if="unsupported" class="text-center text-xs text-orange-500 mt-3">
      {{ errorMsg || 'ไม่สามารถเริ่มสแกนได้' }} — ต้องเปิดผ่าน HTTPS และอนุญาตการใช้กล้อง
    </p>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

// result = { ok, title, name, detail, pictureUrl } shown as a big overlay
defineProps({ result: { type: Object, default: null } })

const emit = defineEmits(['detected'])

const videoEl = ref(null)
const scanning = ref(false)
const unsupported = ref(false)
const errorMsg = ref('')

let stream = null
let detector = null        // native BarcodeDetector (if available)
let jsQR = null            // fallback decoder loaded from CDN
let canvas = null
let ctx = null
let rafId = null
let lastValue = ''
let lastTime = 0

// Load jsQR from CDN once (no npm install needed)
function loadJsQR() {
  if (window.jsQR) { jsQR = window.jsQR; return Promise.resolve() }
  if (jsQR) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
    s.onload = () => { jsQR = window.jsQR; resolve() }
    s.onerror = () => reject(new Error('load jsQR failed'))
    document.head.appendChild(s)
  })
}

async function start() {
  errorMsg.value = ''
  unsupported.value = false

  // Native detector as a fast path (if available)
  if ('BarcodeDetector' in window) {
    try { detector = new window.BarcodeDetector({ formats: ['qr_code'] }) }
    catch { detector = null }
  }

  // Always prepare jsQR + canvas as a reliable cross-browser decoder
  try {
    await loadJsQR()
    canvas = document.createElement('canvas')
    ctx = canvas.getContext('2d', { willReadFrequently: true })
  } catch {
    if (!detector) {
      unsupported.value = true
      errorMsg.value = 'โหลดตัวสแกนไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต'
      return
    }
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    unsupported.value = true
    errorMsg.value = 'เบราว์เซอร์ไม่รองรับการเปิดกล้อง (ต้องเปิดผ่าน HTTPS)'
    return
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    videoEl.value.srcObject = stream
    await videoEl.value.play()
    scanning.value = true
    scanLoop()
  } catch (e) {
    errorMsg.value = e?.name === 'NotAllowedError'
      ? 'ไม่ได้รับอนุญาตให้ใช้กล้อง'
      : 'ไม่สามารถเปิดกล้องได้'
    stop()
  }
}

function emitIfNew(value) {
  const now = Date.now()
  if (value && (value !== lastValue || now - lastTime > 2500)) {
    lastValue = value
    lastTime = now
    emit('detected', value)
  }
}

let lastScanAt = 0
const SCAN_INTERVAL = 100        // throttle decode (~10 fps)
const MAX_DIM = 640              // downscale longest side before decoding

function decodeWithJsQR(video) {
  if (!jsQR || !ctx) return null
  if (video.readyState < video.HAVE_ENOUGH_DATA) return null
  const vw = video.videoWidth, vh = video.videoHeight
  if (!vw || !vh) return null
  const scale = Math.min(1, MAX_DIM / Math.max(vw, vh))
  const w = Math.round(vw * scale)
  const h = Math.round(vh * scale)
  canvas.width = w
  canvas.height = h
  ctx.drawImage(video, 0, 0, w, h)
  const img = ctx.getImageData(0, 0, w, h)
  // attemptBoth = also try inverted (light QR on dark bg)
  const code = jsQR(img.data, w, h, { inversionAttempts: 'attemptBoth' })
  return code && code.data ? code.data : null
}

async function scanLoop() {
  if (!scanning.value || !videoEl.value) return
  const video = videoEl.value
  const now = performance.now()

  if (now - lastScanAt >= SCAN_INTERVAL) {
    lastScanAt = now
    try {
      let value = null
      // fast path
      if (detector) {
        const codes = await detector.detect(video)
        if (codes && codes.length) value = codes[0].rawValue
      }
      // reliable fallback (also runs if detector found nothing)
      if (!value) value = decodeWithJsQR(video)
      if (value) emitIfNew(value)
    } catch { /* ignore per-frame errors */ }
  }
  rafId = requestAnimationFrame(scanLoop)
}

function stop() {
  scanning.value = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
    stream = null
  }
  if (videoEl.value) videoEl.value.srcObject = null
}

onUnmounted(stop)

defineExpose({ stop })
</script>

<style scoped>
.scan-line {
  top: 2rem;
  animation: scan 2s ease-in-out infinite;
}
@keyframes scan {
  0%, 100% { top: 2rem; }
  50% { top: calc(100% - 2rem); }
}
.result-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.result-leave-active { transition: opacity 0.2s ease; }
.result-enter-from { opacity: 0; transform: scale(1.06); }
.result-leave-to { opacity: 0; }
</style>
