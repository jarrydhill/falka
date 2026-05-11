// Rename FALKA 845 → FALKA 8 (Michi Higginbotham brand mark-up).
// Patches boat-falka-01: name, slug, shortLabel.

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

console.log('\n--- Before ---')
const before = await client.fetch(`*[_id == "boat-falka-01"][0]{_id, name, "slug": slug.current, shortLabel}`)
console.log(before)

if (before?.name !== 'FALKA 845') {
  console.error(`ABORT: expected name 'FALKA 845' but found '${before?.name}'. Migration may have already run.`)
  process.exit(1)
}

console.log('\n--- Patching ---')
const res = await client
  .patch('boat-falka-01')
  .set({
    name: 'FALKA 8',
    slug: {_type: 'slug', current: 'falka-8'},
    shortLabel: 'The 8-Metre Day-to-Night Cat',
  })
  .commit()
console.log(`Patched _rev=${res._rev}`)

console.log('\n--- After ---')
const after = await client.fetch(`*[_id == "boat-falka-01"][0]{_id, name, "slug": slug.current, shortLabel}`)
console.log(after)

console.log('\n✓ Done.\n')
