// Read-only: fetch every boat doc so we see the real Sanity state before migrating.
// node inspect-boats.mjs

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

const boats = await client.fetch(
  `*[_type == "boat"] | order(order asc) {
    _id, _rev, name, "slug": slug.current, status, order, shortLabel,
    "specsLen": count(specs), "gallerySize": count(gallery),
    "rangeCardSpecs": rangeCardSpecs[]{label, value}
  }`,
)

console.log('\n=== Current boats in production dataset ===\n')
for (const b of boats) {
  console.log(`_id:         ${b._id}`)
  console.log(`name:        ${b.name}`)
  console.log(`slug:        ${b.slug}`)
  console.log(`status:      ${b.status}`)
  console.log(`order:       ${b.order}`)
  console.log(`shortLabel:  ${b.shortLabel}`)
  console.log(`specs:       ${b.specsLen || 0} rows`)
  console.log(`gallery:     ${b.gallerySize || 0} images`)
  if (b.rangeCardSpecs?.length) {
    console.log(`rangeCardSpecs:`)
    for (const s of b.rangeCardSpecs) console.log(`  ${s.label}: ${s.value}`)
  }
  console.log('---')
}

console.log(`\nTotal boats: ${boats.length}\n`)
