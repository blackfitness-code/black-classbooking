/**
 * Custom dialog — a lightweight, on-brand replacement for SweetAlert2.
 *
 * Drop-in compatible with the subset of the SweetAlert API used in this app:
 *   Swal.fire({ title, text, html, icon, showCancelButton, showConfirmButton,
 *               confirmButtonText, cancelButtonText, confirmButtonColor, timer })
 *   → returns a Promise<{ isConfirmed, isDismissed, dismiss }>
 *
 * Usage stays identical — only the import changes:
 *   import Swal from '../utils/dialog'
 */

const PRIMARY = '#FF8C61'

const ICONS = {
  success: {
    tint: '#ecfdf5', color: '#10b981',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4.5 12.75l6 6 9-13.5"/>'
  },
  error: {
    tint: '#fef2f2', color: '#ef4444',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>'
  },
  warning: {
    tint: '#fffbeb', color: '#f59e0b',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>'
  },
  info: {
    tint: '#eff6ff', color: '#3b82f6',
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 16v-5m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
  },
  question: {
    tint: '#fff5f0', color: PRIMARY,
    path: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
  }
}

let stylesInjected = false
function injectStyles() {
  if (stylesInjected) return
  stylesInjected = true
  const css = `
.bd-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:1.5rem;
  background:rgba(17,17,17,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  opacity:0;transition:opacity .2s ease;font-family:'Kanit','Noto Sans Thai',sans-serif;}
.bd-overlay.bd-show{opacity:1;}
.bd-card{width:100%;max-width:22rem;max-height:90dvh;overflow-y:auto;background:#fff;border-radius:1.75rem;
  box-shadow:0 24px 60px rgba(0,0,0,.22);padding:2rem 1.75rem 1.5rem;text-align:center;
  transform:translateY(14px) scale(.95);opacity:0;transition:transform .28s cubic-bezier(.16,1,.3,1),opacity .25s ease;}
.bd-overlay.bd-show .bd-card{transform:translateY(0) scale(1);opacity:1;}
.bd-icon{width:4.5rem;height:4.5rem;margin:0 auto 1.25rem;border-radius:9999px;display:flex;align-items:center;justify-content:center;
  transform:scale(.4);opacity:0;transition:transform .35s cubic-bezier(.16,1.4,.4,1) .08s,opacity .25s ease .08s;}
.bd-overlay.bd-show .bd-icon{transform:scale(1);opacity:1;}
.bd-icon svg{width:2.25rem;height:2.25rem;}
.bd-title{font-size:1.2rem;font-weight:600;color:#111827;line-height:1.4;}
.bd-text{margin-top:.5rem;font-size:.9rem;color:#6b7280;line-height:1.65;}
.bd-text strong{color:#374151;font-weight:600;}
.bd-actions{margin-top:1.5rem;display:flex;gap:.625rem;}
.bd-btn{flex:1;padding:.8rem 1rem;border-radius:.9rem;font-weight:600;font-size:.9rem;cursor:pointer;border:none;
  font-family:inherit;transition:filter .15s ease,background .15s ease,transform .08s ease;}
.bd-btn:active{transform:scale(.97);}
.bd-confirm{color:#fff;box-shadow:0 6px 16px rgba(0,0,0,.12);}
.bd-confirm:hover{filter:brightness(.93);}
.bd-cancel{background:#f3f4f6;color:#374151;}
.bd-cancel:hover{background:#e5e7eb;}
.bd-progress{margin-top:1.25rem;height:3px;border-radius:9999px;background:#f1f1f1;overflow:hidden;}
.bd-progress-bar{height:100%;border-radius:9999px;width:100%;transform-origin:left;}
`
  const style = document.createElement('style')
  style.setAttribute('data-bd-dialog', '')
  style.textContent = css
  document.head.appendChild(style)
}

function fire(options = {}) {
  // tolerate string shorthand: fire('title', 'text', 'icon')
  if (typeof options === 'string') {
    options = { title: options, text: arguments[1], icon: arguments[2] }
  }
  injectStyles()

  const {
    title = '',
    text = '',
    html = '',
    icon,
    showCancelButton = false,
    showConfirmButton = true,
    confirmButtonText = 'ตกลง',
    cancelButtonText = 'ยกเลิก',
    confirmButtonColor = PRIMARY,
    timer
  } = options

  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    overlay.className = 'bd-overlay'

    const card = document.createElement('div')
    card.className = 'bd-card'
    card.setAttribute('role', 'dialog')
    card.setAttribute('aria-modal', 'true')

    let inner = ''

    // Icon
    if (icon && ICONS[icon]) {
      const ic = ICONS[icon]
      inner += `<div class="bd-icon" style="background:${ic.tint}">
        <svg viewBox="0 0 24 24" fill="none" stroke="${ic.color}">${ic.path}</svg>
      </div>`
    }

    if (title) inner += `<h2 class="bd-title">${title}</h2>`
    if (html) inner += `<div class="bd-text">${html}</div>`
    else if (text) inner += `<p class="bd-text">${escapeHtml(text)}</p>`

    // Buttons
    if (showConfirmButton || showCancelButton) {
      inner += '<div class="bd-actions">'
      if (showCancelButton) {
        inner += `<button type="button" class="bd-btn bd-cancel" data-bd="cancel">${cancelButtonText}</button>`
      }
      if (showConfirmButton) {
        inner += `<button type="button" class="bd-btn bd-confirm" data-bd="confirm" style="background:${confirmButtonColor}">${confirmButtonText}</button>`
      }
      inner += '</div>'
    }

    // Timer progress bar (toast-like)
    if (timer) {
      const barColor = icon && ICONS[icon] ? ICONS[icon].color : PRIMARY
      inner += `<div class="bd-progress"><div class="bd-progress-bar" style="background:${barColor}"></div></div>`
    }

    card.innerHTML = inner
    overlay.appendChild(card)
    document.body.appendChild(overlay)

    // animate in
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('bd-show')))

    let settled = false
    let timerId = null

    const close = (result) => {
      if (settled) return
      settled = true
      if (timerId) clearTimeout(timerId)
      document.removeEventListener('keydown', onKey)
      overlay.classList.remove('bd-show')
      setTimeout(() => {
        overlay.remove()
        resolve(result)
      }, 220)
    }

    const onKey = (e) => {
      if (e.key === 'Escape') close({ isConfirmed: false, isDismissed: true, dismiss: 'esc' })
      else if (e.key === 'Enter' && showConfirmButton) close({ isConfirmed: true, isDismissed: false })
    }
    document.addEventListener('keydown', onKey)

    // button clicks
    card.querySelectorAll('[data-bd]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.bd === 'confirm') close({ isConfirmed: true, isDismissed: false })
        else close({ isConfirmed: false, isDismissed: true, dismiss: 'cancel' })
      })
    })

    // backdrop click dismisses
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close({ isConfirmed: false, isDismissed: true, dismiss: 'backdrop' })
    })

    // auto-dismiss timer + progress animation
    if (timer) {
      const bar = card.querySelector('.bd-progress-bar')
      if (bar) {
        bar.style.transition = `transform ${timer}ms linear`
        requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.transform = 'scaleX(0)' }))
      }
      timerId = setTimeout(() => close({ isConfirmed: false, isDismissed: true, dismiss: 'timer' }), timer)
    }
  })
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default { fire }
export { fire }
