// ============================================================
// FALKA site behavior — nav, reveal, configurator, forms.
// Uses event delegation so it works with content rendered by
// falka-cms.js after page load.
// ============================================================

const FALLBACK_EMAIL = () => window.FALKA_CONTACT_EMAIL || 'hello@falka.com.au'
const FORMSPREE = () => window.FALKA_FORMSPREE_ENDPOINT || ''

// ---- Nav scroll state ----
const nav = document.getElementById('nav')
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60)
  })
}

// ---- Mobile menu ----
function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open')
}
window.toggleNav = toggleNav

document.addEventListener('click', (e) => {
  if (e.target.closest('.nav-links a')) {
    document.getElementById('navLinks')?.classList.remove('open')
  }
})

// ---- Scroll reveal (re-observes on re-render) ----
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        io.unobserve(e.target)
      }
    })
  },
  {threshold: 0.12, rootMargin: '0px 0px -60px 0px'}
)

function observeReveal() {
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => io.observe(el))
}
observeReveal()
window.addEventListener('falka:rendered', () => {
  // Any element already in viewport when rendered should reveal immediately.
  document.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible')
    } else {
      io.observe(el)
    }
  })
})

// ---- Configurator (event delegation) ----
function getState() {
  if (!window.FALKA_CONFIG_STATE) window.FALKA_CONFIG_STATE = {}
  return window.FALKA_CONFIG_STATE
}

function showStep(i) {
  const steps = document.querySelectorAll('.config-step')
  const navItems = document.querySelectorAll('.config-nav-item')
  steps.forEach((s) => s.classList.toggle('active', +s.dataset.step === i))
  navItems.forEach((n) => n.classList.toggle('active', +n.dataset.step === i))
  window.FALKA_CURRENT_STEP = i
  document.getElementById('configurator')?.scrollIntoView({behavior: 'smooth', block: 'start'})
}

document.addEventListener('click', (e) => {
  // Config option select
  const optBtn = e.target.closest('.config-option[data-group]')
  if (optBtn && !optBtn.disabled) {
    const group = optBtn.dataset.group
    const value = optBtn.dataset.value
    document.querySelectorAll(`.config-option[data-group="${group}"]`).forEach((s) => s.classList.remove('selected'))
    optBtn.classList.add('selected')
    getState()[group] = value
    const step = optBtn.closest('.config-step')
    const next = step?.querySelector('.config-actions .next')
    if (next) next.disabled = false
    const navItem = document.querySelector(`.config-nav-item[data-step="${step?.dataset.step}"]`)
    if (navItem) {
      navItem.classList.add('complete')
      const choice = navItem.querySelector('.step-choice')
      if (choice) choice.textContent = value
    }
    const summary = document.querySelector(`[data-summary="${group}"]`)
    if (summary) summary.textContent = value
    return
  }

  // Config nav item
  const navItem = e.target.closest('.config-nav-item[data-step]')
  if (navItem) {
    const target = +navItem.dataset.step
    const cur = window.FALKA_CURRENT_STEP || 0
    if (target <= cur || navItem.classList.contains('complete')) {
      showStep(target)
    }
    return
  }

  // Next button
  const nextBtn = e.target.closest('.config-actions .next')
  if (nextBtn && nextBtn.type === 'button' && !nextBtn.disabled) {
    const step = nextBtn.closest('.config-step')
    if (!step) return
    const i = +step.dataset.step
    const total = document.querySelectorAll('.config-step').length
    if (i < total - 1) showStep(i + 1)
    return
  }

  // Back button
  const backBtn = e.target.closest('.config-actions .back')
  if (backBtn && !backBtn.disabled) {
    const cur = window.FALKA_CURRENT_STEP || 0
    if (cur > 0) showStep(cur - 1)
    return
  }
})

// ---- Forms ----
function formatSpecForEmail(s) {
  const keys = window.FALKA_CONFIG_KEYS || Object.keys(s || {})
  return keys.map((k) => `${k}: ${s[k] || '\u2014'}`).join('\n')
}

async function submitForm(form, statusEl, subjectPrefix, includeSpec) {
  const fd = new FormData(form)
  const payload = Object.fromEntries(fd.entries())
  const state = getState()
  if (includeSpec) {
    payload.model = window.FALKA_BOAT?.name || ''
    payload.specification = formatSpecForEmail(state)
    Object.assign(payload, state)
  }
  statusEl.textContent = 'Sending\u2026'
  if (FORMSPREE()) {
    try {
      const res = await fetch(FORMSPREE(), {
        method: 'POST',
        headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        statusEl.textContent = "Thank you \u2014 we'll be in touch shortly."
        form.reset()
      } else {
        statusEl.textContent = 'Something went wrong. Please try again, or email us directly.'
      }
    } catch (err) {
      statusEl.textContent = 'Network error. Please email us directly.'
    }
  } else {
    const body = Object.entries(payload)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
    const subject = encodeURIComponent(`${subjectPrefix} \u2014 ${payload.name || 'Enquiry'}`)
    window.location.href = `mailto:${FALLBACK_EMAIL()}?subject=${subject}&body=${encodeURIComponent(body)}`
    statusEl.textContent = 'Opening your email client\u2026'
  }
}

document.addEventListener('submit', (e) => {
  if (e.target.matches('#configForm')) {
    e.preventDefault()
    submitForm(e.target, document.getElementById('configFormStatus'), 'FALKA Build Specification', true)
  } else if (e.target.matches('#enquireForm')) {
    e.preventDefault()
    submitForm(e.target, document.getElementById('enquireFormStatus'), 'FALKA Enquiry', false)
  }
})

// ---- Footer year ----
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()
