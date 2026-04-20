// One-off migration: rename FALKA range to metre-based model names.
//
// Actions:
//   1. boat-falka-01      → name "FALKA 845",  slug "falka-845",  order 2
//      (was "VIKA 8" / slug "vika-8" / order 1)
//   2. boat-falka-02-open → name "FALKA 1050", slug "falka-1050", order 3
//      (was "FALKA 02 Open" / slug "falka-02-open" / order 2)
//   3. NEW boat-falka-627 → FALKA 627, status 'coming', order 1
//   4. boat-falka-02      → already status=draft, left untouched (soft-retired)
//   5. boat-falka-03      → already status=draft, left untouched (soft-retired)
//
// Safety:
//   - Uses a single transaction so all-or-nothing.
//   - Logs every write before commit.
//   - No hard deletes. Stale docs stay in Sanity history.
//
// Run: node migrate-rename.mjs

import {createClient} from '@sanity/client'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const cfgPath = path.join(os.homedir(), '.config', 'sanity', 'config.json')
const {authToken} = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))

const client = createClient({
  projectId: '1gdzw1s6',
  dataset: 'production',
  token: authToken,
  apiVersion: '2024-01-01',
  useCdn: false,
})

function banner(s) {
  console.log('\n' + '='.repeat(60))
  console.log(s)
  console.log('='.repeat(60))
}

// ---------------------------------------------------------------------------
// Pre-flight: read current state so we can log the before/after cleanly
// ---------------------------------------------------------------------------
banner('Pre-flight inspection')

const before = await client.fetch(
  `*[_type == "boat"] | order(order asc) {
    _id, name, "slug": slug.current, status, order
  }`,
)
for (const b of before) {
  console.log(`  ${b._id.padEnd(24)} ${(b.name || '').padEnd(18)} ${(b.slug || '').padEnd(18)} ${b.status.padEnd(6)} order=${b.order}`)
}

// Sanity: make sure the docs we expect are actually there
const byId = Object.fromEntries(before.map((b) => [b._id, b]))
const required = ['boat-falka-01', 'boat-falka-02-open']
for (const id of required) {
  if (!byId[id]) {
    console.error(`\nABORT: expected document ${id} is missing from the dataset.`)
    process.exit(1)
  }
}
if (byId['boat-falka-627']) {
  console.error(`\nABORT: boat-falka-627 already exists — this migration would overwrite it.`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Build the transaction
// ---------------------------------------------------------------------------
banner('Planned writes')

const tx = client.transaction()

// 1. boat-falka-01: VIKA 8 → FALKA 845
console.log('\n[patch] boat-falka-01')
console.log("  name       'VIKA 8'   → 'FALKA 845'")
console.log("  slug       'vika-8'   → 'falka-845'")
console.log('  order      1          → 2')
tx.patch('boat-falka-01', (p) =>
  p
    .set({name: 'FALKA 845'})
    .set({slug: {_type: 'slug', current: 'falka-845'}})
    .set({order: 2}),
)

// 2. boat-falka-02-open: FALKA 02 Open → FALKA 1050
console.log('\n[patch] boat-falka-02-open')
console.log("  name       'FALKA 02 Open'              → 'FALKA 1050'")
console.log("  slug       'falka-02-open'              → 'falka-1050'")
console.log('  order      2                            → 3')
console.log("  shortLabel 'The 9.80-Metre Open All-Day Cat' → 'The 9.80-Metre All-Day Cat'")
tx.patch('boat-falka-02-open', (p) =>
  p
    .set({name: 'FALKA 1050'})
    .set({slug: {_type: 'slug', current: 'falka-1050'}})
    .set({order: 3})
    .set({shortLabel: 'The 9.80-Metre All-Day Cat'}),
)

// 3. Create FALKA 627
const falka627 = {
  _id: 'boat-falka-627',
  _type: 'boat',
  name: 'FALKA 627',
  slug: {_type: 'slug', current: 'falka-627'},
  status: 'coming',
  order: 1,
  shortLabel: 'The 6-Metre Entry-Level Cat',
  headline: {
    primary: 'SIX METRES.',
    accent: 'TRAILERABLE.',
  },
  scene:
    'The smallest FALKA. Six metres of owner-operated power catamaran, trailerable behind a mid-size tow vehicle, launchable on any ramp. Six on board for the whole day, without needing a marina berth or a second mortgage.',
  description:
    'Same brief as the rest of the range — sun-up to sun-down, proper shade, real galley — scaled to a first FALKA. Single outboard, 30 to 90 horsepower, composite hull, CE offshore certification. The boat that makes the brand affordable without making it small in the ways that matter.',
  features: [
    'Single outboard, F30 \u2013 F90',
    'Composite GRP construction',
    'CE Category B offshore rating',
    '5-year structural & osmosis warranty',
    '6 POB day capacity',
    'Trailerable at 2.75 m beam',
    'Compact galley with single-zone audio',
    'Lithium house bank with hardtop-integrated solar',
  ],
  rangeCardSpecs: [
    {label: 'LOA', value: '6.00 m'},
    {label: 'Beam', value: '2.75 m'},
    {label: 'Capacity', value: '6 POB'},
    {label: 'Power', value: '1 \u00D7 30\u201390 hp'},
  ],
  specs: [
    {label: 'Length Overall', value: '6.00 m'},
    {label: 'Beam Overall', value: '2.75 m'},
    {label: 'Draught', value: '0.40 m'},
    {label: 'Displacement (Light)', value: '~1,500 kg'},
    {label: 'Hull Type', value: 'Displacement Catamaran'},
    {label: 'Construction', value: 'Composite GRP'},
    {label: 'Design Category', value: 'CE Cat B \u2014 Offshore'},
    {label: 'Propulsion', value: 'Single Outboard'},
    {label: 'Power Options', value: '30\u201390 hp'},
    {label: 'Fuel Capacity', value: '120 L'},
    {label: 'Fresh Water', value: '40 L'},
    {label: 'Cruise Speed', value: '12 knots'},
    {label: 'Top Speed', value: '24 knots'},
    {label: 'Max Persons (Day)', value: '6 POB'},
    {label: 'Warranty', value: '5yr Hull / 2yr Systems'},
  ],
}
console.log('\n[create] boat-falka-627')
console.log(`  name       'FALKA 627'`)
console.log(`  slug       'falka-627'`)
console.log('  status     coming')
console.log('  order      1')
console.log(`  specs      ${falka627.specs.length} rows`)
console.log(`  features   ${falka627.features.length} bullets`)
console.log('  (no images — add via Studio)')
tx.create(falka627)

// 4 & 5. boat-falka-02 and boat-falka-03 are already status='draft' — no action
console.log('\n[noop]  boat-falka-02      (already status=draft, soft-retired)')
console.log('[noop]  boat-falka-03      (already status=draft, soft-retired)')

// ---------------------------------------------------------------------------
// Commit
// ---------------------------------------------------------------------------
banner('Committing transaction')
const result = await tx.commit()
console.log(`\n\u2713 Transaction committed. Transaction ID: ${result.transactionId}`)
console.log(`  Documents affected: ${result.documentIds.length}`)
for (const id of result.documentIds) console.log(`    ${id}`)

// ---------------------------------------------------------------------------
// Verification: re-fetch and print the new state
// ---------------------------------------------------------------------------
banner('Post-migration state')

const after = await client.fetch(
  `*[_type == "boat"] | order(order asc) {
    _id, name, "slug": slug.current, status, order, shortLabel
  }`,
)
for (const b of after) {
  console.log(`  ${b._id.padEnd(24)} ${(b.name || '').padEnd(18)} ${(b.slug || '').padEnd(18)} ${b.status.padEnd(6)} order=${b.order}`)
}

console.log('\n\u2713 Migration complete.\n')
