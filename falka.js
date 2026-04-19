// ============================================
// FALKA shared script — runs on all pages.
// ============================================
// Replace this endpoint once you've registered at https://formspree.io
// Example: 'https://formspree.io/f/xyzabcde'
const FORMSPREE_ENDPOINT = '';
const FALLBACK_EMAIL = 'hello@falka.com.au';

// Nav scroll state
const nav = document.getElementById('nav');
if (nav) {
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    });
}

function toggleNav() {
    document.getElementById('navLinks')?.classList.toggle('open');
}
window.toggleNav = toggleNav;
document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.remove('open');
    });
});

// Scroll reveal
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ============================================
// CONFIGURATOR (home page only)
// ============================================
const state = { model: '', hull: '', upholstery: '', engine: '', electronics: '', audio: '' };
let currentStep = 0;

const steps = document.querySelectorAll('.config-step');
const navItems = document.querySelectorAll('.config-nav-item');

function showStep(i) {
    steps.forEach(s => s.classList.toggle('active', +s.dataset.step === i));
    navItems.forEach(n => n.classList.toggle('active', +n.dataset.step === i));
    currentStep = i;
    document.getElementById('configurator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const target = +item.dataset.step;
        if (target <= currentStep || item.classList.contains('complete')) {
            showStep(target);
        }
    });
});

document.querySelectorAll('.config-option[data-group]').forEach(opt => {
    opt.addEventListener('click', () => {
        const group = opt.dataset.group;
        const value = opt.dataset.value;
        document.querySelectorAll(`.config-option[data-group="${group}"]`).forEach(s => s.classList.remove('selected'));
        opt.classList.add('selected');
        state[group] = value;
        const step = opt.closest('.config-step');
        const next = step.querySelector('.config-actions .next');
        if (next) next.disabled = false;
        const navItem = document.querySelector(`.config-nav-item[data-step="${step.dataset.step}"]`);
        if (navItem) {
            navItem.classList.add('complete');
            const choice = navItem.querySelector('.step-choice');
            if (choice) choice.textContent = value;
        }
        const summary = document.querySelector(`[data-summary="${group}"]`);
        if (summary) summary.textContent = value;
    });
});

document.querySelectorAll('.config-actions .next').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.type === 'submit') return;
        const step = btn.closest('.config-step');
        if (!step) return;
        const i = +step.dataset.step;
        if (i < steps.length - 1) showStep(i + 1);
    });
});

document.querySelectorAll('.config-actions .back').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentStep > 0) showStep(currentStep - 1);
    });
});

// ============================================
// FORMS
// ============================================
function formatSpecForEmail(s) {
    return [
        `Model: ${s.model || '—'}`,
        `Hull Colour: ${s.hull || '—'}`,
        `Upholstery: ${s.upholstery || '—'}`,
        `Engines: ${s.engine || '—'}`,
        `Electronics Package: ${s.electronics || '—'}`,
        `Audio Package: ${s.audio || '—'}`
    ].join('\n');
}

async function submitForm(form, statusEl, subjectPrefix, includeSpec) {
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    if (includeSpec) {
        payload.specification = formatSpecForEmail(state);
        Object.assign(payload, state);
    }
    statusEl.textContent = 'Sending…';
    if (FORMSPREE_ENDPOINT) {
        try {
            const res = await fetch(FORMSPREE_ENDPOINT, {
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                statusEl.textContent = 'Thank you — we\'ll be in touch shortly.';
                form.reset();
            } else {
                statusEl.textContent = 'Something went wrong. Please try again, or email us directly.';
            }
        } catch (err) {
            statusEl.textContent = 'Network error. Please email us directly.';
        }
    } else {
        const body = Object.entries(payload).map(([k, v]) => `${k}: ${v}`).join('\n');
        const subject = encodeURIComponent(`${subjectPrefix} — ${payload.name || 'Enquiry'}`);
        window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`;
        statusEl.textContent = 'Opening your email client…';
    }
}

const configForm = document.getElementById('configForm');
if (configForm) {
    configForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm(e.target, document.getElementById('configFormStatus'), 'FALKA Build Specification', true);
    });
}

const enquireForm = document.getElementById('enquireForm');
if (enquireForm) {
    enquireForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitForm(e.target, document.getElementById('enquireFormStatus'), 'FALKA Enquiry', false);
    });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
