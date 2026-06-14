import liff from '@line/liff'

// dev / mock — ข้ามการเช็ก LIFF client
const DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'
const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2007882550-gB0lXQvK'

function renderBootError(message, debug) {
    document.title = 'Blackfitness — ไม่สามารถเปิดแอปได้'
    document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;color:#374151;flex-direction:column;gap:.75rem;padding:1.5rem;text-align:center;max-width:28rem;margin:0 auto">' +
        '<h1 style="font-size:1.25rem;margin:0;font-weight:600">ไม่สามารถเชื่อมต่อ LINE ได้</h1>' +
        '<p style="margin:0;color:#6b7280;font-size:0.875rem;line-height:1.5">' + message + '</p>' +
        (debug ? '<pre style="margin:0.5rem 0 0;font-size:11px;color:#9ca3af;white-space:pre-wrap;word-break:break-all;text-align:left;width:100%">' + debug + '</pre>' : '') +
        '</div>'
}

async function bootstrap() {
    const { createApp } = await import('vue')
    const { createPinia } = await import('pinia')
    const { default: router } = await import('./router')
    const { default: App } = await import('./App.vue')
    await import('./style.css')

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
}

async function main() {
    if (DEV_MODE) {
        await bootstrap()
        return
    }

    try {
        await liff.init({ liffId: LIFF_ID })
    } catch (error) {
        renderBootError(
            'กรุณาเปิดผ่านลิงก์ LIFF ที่ถูกต้อง หรือตรวจสอบ VITE_LIFF_ID',
            (error && error.message ? error.message : String(error)) + '\nliffId=' + LIFF_ID
        )
        return
    }

    // รองรับทั้ง LINE in-app และ external browser (Desktop / Mobile browser)
    // ผู้ใช้ Desktop กด Login แล้ว redirect ไป LINE OAuth ได้
    await bootstrap()
}

main()
