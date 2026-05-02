// Soft-retire FALKA 627 and FALKA 1050 by flipping status to 'draft'.
// Public site is being refocused to FALKA 845 only; these stay in
// the dataset (history + assets preserved) but stop rendering on /boats/.
//
// Run: node retire-627-1050.mjs

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

const targets = ['boat-falka-627', 'boat-falka-02-open']  // 627 + 1050

console.log('\n--- Pre-flight ---')
const before = await client.fetch(
  `*[_id in $ids]{_id, name, status, order}`,
  {ids: targets},
)
for (const b of before) console.log(`  ${b._id.padEnd(24)} ${b.name.padEnd(14)} status=${b.status} order=${b.order}`)

const tx = client.transaction()
for (const id of targets) tx.patch(id, (p) => p.set({status: 'draft'}))

console.log('\n--- Committing ---')
const res = await tx.commit()
console.log(`tx ${res.transactionId}`)

console.log('\n--- After ---')
const after = await client.fetch(
  `*[_type == "boat"] | order(order asc) {_id, name, "slug": slug.current, status, order}`,
)
for (const b of after) console.log(`  ${b._id.padEnd(24)} ${(b.name||'').padEnd(14)} ${(b.slug||'').padEnd(16)} status=${b.status} order=${b.order}`)

console.log('\n✓ Done.\n')
