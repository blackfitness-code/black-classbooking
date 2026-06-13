import liff from '@line/liff'

// DEV_MODE ต้องตรงกับ stores/liff.js — ตอน dev/mock ข้ามการเช็ก LIFF
const DEV_MODE = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_PROFILE === 'true'
const LIFF_ID = import.meta.env.VITE_LIFF_ID || '2007882550-gB0lXQvK'

// แสดงหน้า 404 เปล่า ๆ แล้วจบ — ไม่โหลด Vue / ไม่ดึงข้อมูลใด ๆ
// debug = ข้อความ diagnostic ชั่วคราว (ลบออกภายหลัง)
function render404(debug) {
    document.title = '404 Not Found'
    document.body.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;color:#374151;flex-direction:column;gap:.5rem;padding:1rem;text-align:center">' +
        '<h1 style="font-size:3rem;margin:0">404</h1>' +
        '<p style="margin:0;color:#6b7280">Not Found</p>' +
        (debug ? '<pre style="margin:1rem 0 0;font-size:11px;color:#9ca3af;white-space:pre-wrap;word-break:break-all">' + debug + '</pre>' : '') +
        '</div>'
}

// โหลดแอปจริงเฉพาะตอนถูกเรียกผ่าน LINE LIFF เท่านั้น
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
    // dev / mock — ข้ามการเช็ก ให้รันได้ปกติ
    if (DEV_MODE) {
        await bootstrap()
        return
    }

    try {
        await liff.init({ liffId: LIFF_ID })
    } catch (error) {
        // init ไม่ผ่าน = เข้าไม่ได้ผ่าน LIFF → 404
        render404('init failed: ' + (error && error.message ? error.message : String(error)) + '\nliffId=' + LIFF_ID)
        return
    }

    // ต้องเปิดจากภายในแอป LINE (LIFF) เท่านั้น ไม่งั้น 404
    if (!liff.isInClient()) {
        let ctx = null
        try { ctx = liff.getContext() } catch { /* ignore */ }
        render404(
            'not in client\n' +
            'isInClient=' + liff.isInClient() + '\n' +
            'isLoggedIn=' + liff.isLoggedIn() + '\n' +
            'context.type=' + (ctx && ctx.type) + '\n' +
            'url=' + window.location.href
        )
        return
    }

    await bootstrap()
}

main()
