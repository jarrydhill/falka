// ============================================================
// FALKA CMS client — fetches content from Sanity and renders
// it into the static page templates.
// Runs on all three pages (home + FALKA 01 + FALKA 02).
// No framework — plain ES2020 + fetch + template rendering.
// ============================================================

const PROJECT_ID = '1gdzw1s6'
const DATASET = 'production'
const CDN = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${DATASET}`

// GROQ queries — fetched with projection to minimise response size.
const Q = {
  brand: encodeURIComponent(`*[_id == "brandSettings"][0]{
    heroEyebrow, heroHeadline, heroSubtitle, "heroImageUrl": heroImage.asset->url,
    philosophyEyebrow, philosophyHeadline, philosophyBody, philosophyStats,
    pillarsEyebrow, pillarsHeadline, pillars,
    rangeEyebrow, rangeHeadline, rangeSubtitle,
    configuratorEyebrow, configuratorHeadline, configuratorSubtitle,
    craftEyebrow, craftHeadline, craftLead, "craftImageUrl": craftImage.asset->url, craftPillars,
    enquireEyebrow, enquireHeadline, enquireBody, contactEmail, formspreeEndpoint,
    companyName, metaDescription
  }`),

  boats: encodeURIComponent(`*[_type == "boat" && status != "draft"] | order(order asc){
    _id, name, "slug": slug.current, status, order, shortLabel,
    "rangeCardImageUrl": rangeCardImage.asset->url,
    rangeCardSpecs
  }`),

  boatBySlug: (slug) =>
    encodeURIComponent(`*[_type == "boat" && slug.current == "${slug}"][0]{
      _id, name, "slug": slug.current, status, order, shortLabel,
      headline, scene, description, features,
      "heroImageUrl": heroImage.asset->url,
      "rangeCardImageUrl": rangeCardImage.asset->url,
      "gallery": gallery[]{"url": asset->url, caption},
      rangeCardSpecs, specs,
      configurator,
      layoutOptions,
      "signatureFeatures": signatureFeatures[]{
        eyebrow, headline, body, imagePosition, "imageUrl": image.asset->url
      }
    }`),
}

async function q(query) {
  const res = await fetch(`${CDN}?query=${query}`)
  if (!res.ok) throw new Error(`Sanity ${res.status}`)
  const {result} = await res.json()
  return result
}

// ---- tiny template helpers ----
const $ = (sel, root = document) => root.querySelector(sel)
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

function esc(s) {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]))
}

function headline(h) {
  if (!h) return ''
  const primary = esc(h.primary || '')
  const accent = h.accent ? ` <span class="accent">${esc(h.accent)}</span>` : ''
  return primary + accent
}

function imgUrl(base, {w, h, fit} = {}) {
  if (!base) return ''
  const u = new URL(base)
  if (w) u.searchParams.set('w', String(w))
  if (h) u.searchParams.set('h', String(h))
  if (fit) u.searchParams.set('fit', fit)
  u.searchParams.set('auto', 'format')
  return u.toString()
}

function bindText(sel, value) {
  const el = $(sel)
  if (el && value != null) el.textContent = value
}

function bindHTML(sel, html) {
  const el = $(sel)
  if (el && html != null) el.innerHTML = html
}

function bindAttr(sel, attr, value) {
  const el = $(sel)
  if (el && value != null) el.setAttribute(attr, value)
}

// ============================================================
// Home page render
// ============================================================
async function renderHome() {
  const [brand, boats] = await Promise.all([q(Q.brand), q(Q.boats)])
  if (!brand) return

  // Nav logo: no change
  // Hero
  bindText('.hero-eyebrow', brand.heroEyebrow)
  bindHTML('.hero-title', headline(brand.heroHeadline))
  bindText('.hero-subtitle', brand.heroSubtitle)
  if (brand.heroImageUrl) {
    bindAttr('.hero-media img', 'src', imgUrl(brand.heroImageUrl, {w: 2400}))
  }

  // Philosophy
  bindText('.philosophy .eyebrow', brand.philosophyEyebrow)
  bindHTML('.philosophy h2', headline(brand.philosophyHeadline))
  const philoInner = $('.philosophy-inner')
  if (philoInner && brand.philosophyBody) {
    $$('.philosophy-inner > p:not(.eyebrow):not(.section-text)').forEach((p) => p.remove())
    const h2 = $('.philosophy-inner h2')
    let insertAfter = h2
    brand.philosophyBody.forEach((para, i) => {
      const p = document.createElement('p')
      p.className = `reveal reveal-d${i + 2}`
      p.textContent = para
      insertAfter.after(p)
      insertAfter = p
    })
  }
  const statsGrid = $('.philosophy-stats')
  if (statsGrid && brand.philosophyStats) {
    statsGrid.innerHTML = brand.philosophyStats
      .map(
        (s, i) => `
      <div class="stat reveal reveal-d${i + 2}">
        <div class="stat-value">${esc(s.value)}</div>
        <div class="stat-label">${esc(s.label)}</div>
      </div>`
      )
      .join('')
  }

  // Pillars
  bindText('.pillars .eyebrow', brand.pillarsEyebrow)
  bindHTML('.pillars h2', headline(brand.pillarsHeadline))
  const pillarsGrid = $('.pillars-grid')
  if (pillarsGrid && brand.pillars) {
    pillarsGrid.innerHTML = brand.pillars.map((p, i) => renderPillarCard(p, i)).join('')
  }

  // Range
  bindText('.range .eyebrow', brand.rangeEyebrow)
  bindHTML('.range .display', headline(brand.rangeHeadline))
  bindText('.range-intro .lead', brand.rangeSubtitle)
  const rangeGrid = $('.range-grid')
  if (rangeGrid && boats) {
    rangeGrid.innerHTML = boats.map((b, i) => renderRangeCard(b, i)).join('')
  }

  // Craft
  bindText('.craft .eyebrow', brand.craftEyebrow)
  bindHTML('.craft h2', headline(brand.craftHeadline))
  bindText('.craft .lead', brand.craftLead)
  if (brand.craftImageUrl) {
    bindAttr('.craft-image img', 'src', imgUrl(brand.craftImageUrl, {w: 1200}))
  }
  const craftPillars = $('.craft-pillars')
  if (craftPillars && brand.craftPillars) {
    craftPillars.innerHTML = brand.craftPillars
      .map(
        (p, i) => `
      <div class="craft-pillar reveal reveal-d${Math.min(i + 2, 4)}">
        <h4>${esc(p.title)}</h4>
        <p>${esc(p.description)}</p>
      </div>`
      )
      .join('')
  }

  // Enquire
  bindText('.enquire .eyebrow', brand.enquireEyebrow)
  bindHTML('.enquire h2', headline(brand.enquireHeadline))
  bindText('.enquire-inner > p:not(.eyebrow)', brand.enquireBody)

  // Persist contact email + formspree for forms
  if (brand.contactEmail) window.FALKA_CONTACT_EMAIL = brand.contactEmail
  if (brand.formspreeEndpoint) window.FALKA_FORMSPREE_ENDPOINT = brand.formspreeEndpoint

  // Kick reveal observer over the new nodes
  window.dispatchEvent(new Event('falka:rendered'))
}

function renderPillarCard(p, i) {
  const icons = {
    check: `<svg viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="24" r="20"/><path d="M15 24 L22 31 L34 17"/></svg>`,
    shield: `<svg viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6 L40 12 V26 C40 34 33 41 24 44 C15 41 8 34 8 26 V12 Z"/><path d="M17 24 L22 29 L31 19"/></svg>`,
    hull: `<svg viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round"><path d="M4 32 Q12 26 24 30 Q36 34 44 28"/><path d="M6 22 L24 10 L42 22"/><path d="M12 22 L12 32"/><path d="M36 22 L36 32"/></svg>`,
    knot: `<svg viewBox="0 0 48 48" stroke-linecap="round" stroke-linejoin="round"><path d="M8 24 H40"/><path d="M32 16 L40 24 L32 32"/><circle cx="12" cy="24" r="3"/></svg>`,
  }
  return `
    <div class="pillar-card reveal reveal-d${Math.min(i + 2, 4)}">
      <div class="pillar-icon">${icons[p.icon || 'check'] || icons.check}</div>
      <h4>${esc(p.title)}</h4>
      <p>${esc(p.description)}</p>
    </div>`
}

function renderRangeCard(b, i) {
  const statusLabel = b.status === 'live' ? 'Available' : 'In Development'
  const href = b.status === 'live' ? `${b.slug}.html` : '#'
  const tag = b.status === 'live' ? 'a' : 'div'
  const cls =
    b.status === 'live' ? `range-card available reveal reveal-d${Math.min(i + 2, 4)}` : `range-card coming reveal reveal-d${Math.min(i + 2, 4)}`
  const media =
    b.status === 'live' && b.rangeCardImageUrl
      ? `<img src="${esc(imgUrl(b.rangeCardImageUrl, {w: 800}))}" alt="${esc(b.name)} — running">`
      : `<img src="falka-images/coming-soon-bg.jpeg" alt="${esc(b.name)} — coming soon" class="coming-bg"><span class="coming-overlay">${esc(b.name.replace(/\D/g, ''))}</span>`
  const specs = (b.rangeCardSpecs || [])
    .map(
      (s) => `
    <div class="spec-row"><span class="spec-k">${esc(s.label)}</span><span class="spec-v">${esc(s.value)}</span></div>`
    )
    .join('')
  const [num, nameAccent] = splitName(b.name)
  const linkText =
    b.status === 'live' ? `Explore ${esc(b.name)}` : 'Register Interest'
  const openTag = `<${tag}${tag === 'a' ? ` href="${esc(href)}"` : ''} class="${cls}">`
  const closeTag = `</${tag}>`
  return `
    ${openTag}
      <div class="range-card-media">
        ${media}
        ${b.status === 'live' ? `<span class="range-card-status">${esc(statusLabel)}</span>` : `<span class="range-card-status">${esc(statusLabel)}</span>`}
      </div>
      <div class="range-card-body">
        <p class="range-card-number">Model ${esc(nameAccent)}</p>
        <h3 class="range-card-title">${esc(num)} <span class="accent">${esc(nameAccent)}</span></h3>
        <p class="range-card-sub">${esc(b.shortLabel || '')}</p>
        <div class="range-card-specs">${specs}</div>
        <span class="range-card-link">${linkText} <span class="arrow"></span></span>
      </div>
    ${closeTag}`
}

function splitName(name) {
  // "FALKA 01" → ["FALKA", "01"]
  const m = (name || '').match(/^(\S+)\s+(.+)$/)
  if (!m) return [name, '']
  return [m[1], m[2]]
}

// ============================================================
// Product (boat) page render
// ============================================================
async function renderBoat(slug) {
  const boat = await q(Q.boatBySlug(slug))
  if (!boat) {
    document.body.innerHTML = '<p style="padding:4rem;text-align:center;">Boat not found.</p>'
    return
  }

  // Hero
  bindText('.model-hero-label .label', boat.shortLabel)
  bindText('.model-hero-label .num', boat.name)
  if (boat.heroImageUrl) {
    bindAttr('.model-hero img', 'src', imgUrl(boat.heroImageUrl, {w: 2400}))
    bindAttr('.model-hero img', 'alt', boat.name)
  }

  // Title + copy
  bindText('.model-grid .eyebrow', `The ${boat.name.replace(/^FALKA\s+/, '')}`)
  bindHTML('.model-grid h2', headline(boat.headline))
  const lead1 = $$('.model-grid .lead')[0]
  if (lead1 && boat.scene) lead1.textContent = boat.scene
  const lead2 = $$('.model-grid .lead')[1]
  if (lead2 && boat.description) lead2.textContent = boat.description

  // Features list
  const featureList = $('.model-features')
  if (featureList && boat.features) {
    featureList.innerHTML = boat.features.map((f) => `<li>${esc(f)}</li>`).join('')
  }

  // Spec table
  const specTable = $('.spec-table')
  if (specTable && boat.specs) {
    const h4 = specTable.querySelector('h4')
    const rows = boat.specs
      .map(
        (s) =>
          `<div class="spec-row-detail"><span class="k">${esc(s.label)}</span><span class="v">${esc(s.value)}</span></div>`
      )
      .join('')
    specTable.innerHTML = (h4 ? h4.outerHTML : '<h4>Principal Specification</h4>') + rows
  }

  // Gallery
  const gallery = $('.model-gallery')
  if (gallery && boat.gallery && boat.gallery.length) {
    gallery.innerHTML = boat.gallery
      .slice(0, 3)
      .map((g) => `<div><img src="${esc(imgUrl(g.url, {w: 1400}))}" alt="${esc(g.caption || boat.name)}"></div>`)
      .join('')
  }

  // Layouts block (optional)
  const layoutsGrid = document.querySelector('.layouts-02-grid')
  if (layoutsGrid) {
    if (boat.layoutOptions && boat.layoutOptions.length) {
      layoutsGrid.innerHTML = boat.layoutOptions.map(renderLayoutCard).join('')
      layoutsGrid.closest('.reveal')?.classList.remove('hidden')
    } else {
      const wrap = layoutsGrid.closest('div[style]')
      if (wrap) wrap.style.display = 'none'
    }
  }

  // Signature features (optional)
  renderSignatureFeatures(boat.signatureFeatures || [])

  // Configurator
  renderConfigurator(boat)

  // Persist for forms + configurator submit
  window.FALKA_BOAT = boat

  window.dispatchEvent(new Event('falka:rendered'))
}

function renderLayoutCard(l) {
  const tagCls = l.recommended ? 'layout-02-tag recommended' : 'layout-02-tag'
  const cardCls = l.recommended ? 'layout-02 recommended' : 'layout-02'
  const stats = (l.stats || [])
    .map((s) => `<li><span>${esc(s.label)}</span><strong>${esc(s.value)}</strong></li>`)
    .join('')
  return `
    <div class="${cardCls}">
      <p class="${tagCls}">${esc(l.tag || '')}</p>
      <h4>${esc((l.title || '').toUpperCase())}</h4>
      <p class="layout-02-desc">${esc(l.description || '')}</p>
      <ul class="layout-02-stats">${stats}</ul>
    </div>`
}

function renderSignatureFeatures(features) {
  // Remove existing signature blocks
  $$('.overnighter-feature').forEach((el) => el.remove())
  if (!features.length) return
  const gallery = $('.model-gallery')
  const anchor = gallery || $('.model-content')
  if (!anchor) return
  features.forEach((f) => {
    const el = document.createElement('div')
    el.className = 'overnighter-feature reveal'
    el.style.marginTop = '5rem'
    el.innerHTML = `
      <div class="overnighter-image">
        <img src="${esc(imgUrl(f.imageUrl, {w: 1400}))}" alt="${esc(f.headline?.primary || '')}">
      </div>
      <div class="overnighter-body">
        <p class="eyebrow light">${esc(f.eyebrow || '')}</p>
        <h3 style="font-family: var(--font-display); font-size: clamp(1.4rem, 2.4vw, 1.85rem); font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: -0.005em;">${headline(f.headline)}</h3>
        <p style="color: rgba(245,241,234,0.72); font-weight: 300; line-height: 1.65; font-size: 1rem;">${esc(f.body || '')}</p>
      </div>`
    anchor.parentNode.insertBefore(el, anchor)
  })
}

function renderConfigurator(boat) {
  const root = $('.config-panel')
  if (!root || !boat.configurator) return

  const c = boat.configurator
  const steps = [
    {key: 'hull', label: 'Hull Colour', options: c.hullColours, hint: 'All gelcoat finishes are marine-grade isophthalic.'},
    {key: 'upholstery', label: 'Upholstery', options: c.upholsteryOptions, hint: 'Marine-grade materials. UV-stable, mildew-resistant.'},
    {key: 'engine', label: 'Engines', options: c.engines, hint: `${boat.name} is a displacement cat. 13 knot cruise, 20 knot top regardless of power. Engine choice is about fuel economy, range, and reserve in weather.`},
    {key: 'electronics', label: 'Electronics', options: c.electronicsPackages, hint: 'All packages are Garmin-based with full NMEA 2000 integration.'},
    {key: 'audio', label: 'Audio', options: c.audioPackages, hint: 'Fusion head units with JL Audio speakers. App-controlled via Fusion-Link.'},
  ].filter((s) => s.options && s.options.length)

  // Build sidebar nav
  const nav = $('.config-nav')
  if (nav) {
    nav.innerHTML =
      steps
        .map(
          (s, i) => `
      <li class="config-nav-item${i === 0 ? ' active' : ''}" data-step="${i}">
        <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="step-label">${esc(s.label)}</span>
        <span class="step-choice" data-choice="${s.key}"></span>
      </li>`
        )
        .join('') +
      `
      <li class="config-nav-item" data-step="${steps.length}">
        <span class="step-num">${String(steps.length + 1).padStart(2, '0')}</span>
        <span class="step-label">Your Details</span>
      </li>`
  }

  // Build panel
  const panelSteps = steps
    .map((step, i) => {
      const opts = step.options
        .map((o) => {
          const badge = o.tier
            ? `<span class="config-tier-badge${o.isFlagship ? ' flagship' : ''}">${esc(o.tier)}</span>`
            : ''
          const swatch = o.swatchHex
            ? `<div class="config-option-swatch" style="background: linear-gradient(135deg, ${esc(o.swatchHex)}, ${esc(o.swatchGradientTo || o.swatchHex)});"></div>`
            : ''
          const features = (o.features || [])
            .map((f) => `<li>${esc(f)}</li>`)
            .join('')
          const featuresBlock = features ? `<ul class="config-option-features">${features}</ul>` : ''
          const meta = o.meta ? `<div class="config-option-meta">${esc(o.meta)}</div>` : ''
          const desc = o.description ? `<div class="config-option-desc">${esc(o.description)}</div>` : ''
          return `
        <button type="button" class="config-option" data-group="${step.key}" data-value="${esc(o.title)}">
          ${badge}
          ${swatch}
          <div class="config-option-title">${esc(o.title)}</div>
          ${desc}
          ${featuresBlock}
          ${meta}
        </button>`
        })
        .join('')
      return `
    <div class="config-step${i === 0 ? ' active' : ''}" data-step="${i}">
      <h3>${esc(`Choose your ${step.label.toLowerCase()}`)}</h3>
      <p class="hint">${esc(step.hint)}</p>
      <div class="config-options">${opts}</div>
      <div class="config-actions">
        <button type="button" class="back"${i === 0 ? ' disabled' : ''}>&larr; Back</button>
        <button type="button" class="next" disabled>Continue &rarr;</button>
      </div>
    </div>`
    })
    .join('')

  // Details step (final)
  const summaryLines = steps
    .map(
      (s) => `
    <div class="summary-line"><span class="k">${esc(s.label)}</span><span class="v" data-summary="${s.key}">&mdash;</span></div>`
    )
    .join('')

  const detailsStep = `
    <div class="config-step" data-step="${steps.length}">
      <h3>Your details</h3>
      <p class="hint">We&rsquo;ll come back within two business days with a real quote and next steps.</p>
      <div class="config-summary">
        <h4>Your ${esc(boat.name)} Specification</h4>
        ${summaryLines}
      </div>
      <form class="config-form" id="configForm" novalidate>
        <div><label for="cf_name">Name</label><input type="text" id="cf_name" name="name" required></div>
        <div><label for="cf_email">Email</label><input type="email" id="cf_email" name="email" required></div>
        <div><label for="cf_phone">Phone</label><input type="tel" id="cf_phone" name="phone" required></div>
        <div><label for="cf_state">State</label>
          <select id="cf_state" name="state" required>
            <option value="">Select&hellip;</option>
            <option>NSW</option><option>VIC</option><option>QLD</option><option>WA</option>
            <option>SA</option><option>TAS</option><option>ACT</option><option>NT</option>
          </select>
        </div>
        <div class="full">
          <label for="cf_use">Primary intended use</label>
          <select id="cf_use" name="use">
            <option value="">Select&hellip;</option>
            <option>Family &amp; friends</option>
            <option>Fishing</option>
            <option>Touring / overnighting</option>
            <option>Charter</option>
            <option>Other</option>
          </select>
        </div>
        <div class="full"><label for="cf_notes">Anything else you want us to know</label><textarea id="cf_notes" name="notes"></textarea></div>
        <div class="full config-actions" style="border-top: 1px solid var(--hairline); padding-top: 2rem;">
          <button type="button" class="back">&larr; Back</button>
          <button type="submit" class="next">Send Specification &rarr;</button>
        </div>
        <p class="form-status" id="configFormStatus"></p>
      </form>
    </div>`

  root.innerHTML = panelSteps + detailsStep

  // Persist steps keys for falka.js
  window.FALKA_CONFIG_KEYS = steps.map((s) => s.key)
  window.FALKA_CONFIG_STATE = Object.fromEntries(steps.map((s) => [s.key, '']))
}

// ============================================================
// Page detection + bootstrap
// ============================================================
async function bootstrap() {
  const path = location.pathname
  const isHome = path === '/' || /\/index(\.html)?$/.test(path)
  const slugMatch = path.match(/\/(falka-\d+)(\.html)?$/)

  try {
    if (isHome) {
      await renderHome()
    } else if (slugMatch) {
      await renderBoat(slugMatch[1])
    }
  } catch (err) {
    console.error('[FALKA CMS] render failed:', err)
    // Page still usable with static fallback content in HTML.
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap)
} else {
  bootstrap()
}
