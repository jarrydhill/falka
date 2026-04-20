#!/usr/bin/env node
// ============================================================
// FALKA ingest CLI.
// Used by the falka-ingest Claude Code subagent (and by humans
// who want to script changes) to upload assets and patch boat
// documents in the Sanity CMS that drives falka.com.au.
//
// Usage: node studio/ingest.mjs <command> [args...]
// Run `node studio/ingest.mjs help` for the full command list.
//
// Auth: reads the Sanity CLI token from
//   ~/.config/sanity/config.json
// (written by `sanity login`). Project ID and dataset are hard-
// coded to match the falka.com.au studio.
// ============================================================

import {createClient} from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {execSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const cfgPath = path.join(os.homedir(), '.config', 'sanity', 'config.json')
if (!fs.existsSync(cfgPath)) {
  console.error(`Sanity auth missing at ${cfgPath}. Run: node node_modules/sanity/bin/sanity login`)
  process.exit(1)
}
const {authToken} = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))

const client = createClient({
  projectId: '1gdzw1s6',
  dataset: 'production',
  token: authToken,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ---- Helpers ----

const imgRef = (id) => ({_type: 'image', asset: {_type: 'reference', _ref: id}})

async function uploadImage(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Image not found: ${filePath}`)
  const data = fs.readFileSync(filePath)
  const filename = path.basename(filePath)
  const asset = await client.assets.upload('image', data, {filename})
  return asset._id
}

async function getBoatIdBySlug(slug) {
  const boat = await client.fetch(`*[_type == "boat" && slug.current == $slug][0]{_id, name}`, {slug})
  if (!boat) throw new Error(`No boat with slug "${slug}". Run 'boats' to list.`)
  return boat._id
}

function usage(msg) {
  throw new Error(`usage: ${msg}`)
}

// ---- Commands ----

const commands = {
  async boats() {
    const boats = await client.fetch(
      `*[_type == "boat"] | order(order asc){_id, name, "slug": slug.current, status, order}`,
    )
    if (!boats.length) {
      console.log('(no boats yet)')
      return
    }
    console.table(boats.map(({order, name, slug, status, _id}) => ({order, name, slug, status, _id})))
  },

  async boat(args) {
    if (!args[0]) usage('boat <slug>')
    const doc = await client.fetch(`*[_type == "boat" && slug.current == $slug][0]`, {slug: args[0]})
    if (!doc) throw new Error(`No boat with slug "${args[0]}"`)
    console.log(JSON.stringify(doc, null, 2))
  },

  /**
   * Auto-identify a boat slug from a folder path.
   * Heuristics:
   *  - Look for 'Model NN' or 'ModelNN' token (N digits) → match boat by order.
   *  - Look for an explicit known slug in the path (vika-8, falka-02, vika-81).
   *  - Fallback: print the boats list for manual selection.
   */
  async 'boat-by-folder'(args) {
    if (!args[0]) usage('boat-by-folder <folder-path>')
    const folder = args[0]
    const lower = folder.toLowerCase().replace(/\\/g, '/')

    // 1) Known slug substring in path
    const boats = await client.fetch(
      `*[_type == "boat"]{name, "slug": slug.current, status, order}`,
    )
    for (const b of boats) {
      const slugPat = `/${b.slug}/`
      const slugEnd = `/${b.slug}`
      if (lower.includes(slugPat) || lower.endsWith(slugEnd)) {
        console.log(b.slug)
        return
      }
    }

    // 2) "Model N" or "ModelN" pattern
    const m = lower.match(/\/model[\s_-]?0?(\d{1,2})(?:\/|$)/)
    if (m) {
      const order = parseInt(m[1], 10)
      const hit = boats.find((b) => b.order === order)
      if (hit) {
        console.log(hit.slug)
        return
      }
    }

    console.error(
      'Could not auto-identify. Known boats:\n' +
        boats.map((b) => `  ${b.order}. ${b.name} (${b.slug})`).join('\n'),
    )
    process.exit(2)
  },

  async upload(args) {
    if (!args[0]) usage('upload <image-path>')
    const id = await uploadImage(args[0])
    console.log(id)
  },

  async 'boat-hero'(args) {
    const [slug, imgPath] = args
    if (!slug || !imgPath) usage('boat-hero <slug> <image-path>')
    const _id = await getBoatIdBySlug(slug)
    const assetId = await uploadImage(imgPath)
    await client.patch(_id).set({heroImage: imgRef(assetId)}).commit()
    console.log(`hero set for ${slug} → ${assetId}`)
  },

  async 'boat-card'(args) {
    const [slug, imgPath] = args
    if (!slug || !imgPath) usage('boat-card <slug> <image-path>')
    const _id = await getBoatIdBySlug(slug)
    const assetId = await uploadImage(imgPath)
    await client.patch(_id).set({rangeCardImage: imgRef(assetId)}).commit()
    console.log(`range card set for ${slug} → ${assetId}`)
  },

  async 'boat-gallery-add'(args) {
    const [slug, ...imgPaths] = args
    if (!slug || imgPaths.length === 0) usage('boat-gallery-add <slug> <image-path> [<image-path>...]')
    const _id = await getBoatIdBySlug(slug)
    const refs = []
    for (const p of imgPaths) {
      const assetId = await uploadImage(p)
      refs.push(imgRef(assetId))
      console.log(`  uploaded ${path.basename(p)} → ${assetId}`)
    }
    await client
      .patch(_id)
      .setIfMissing({gallery: []})
      .append('gallery', refs)
      .commit()
    console.log(`added ${refs.length} image(s) to ${slug} gallery`)
  },

  async 'boat-gallery-replace'(args) {
    const [slug, ...imgPaths] = args
    if (!slug || imgPaths.length === 0) usage('boat-gallery-replace <slug> <image-path>...')
    const _id = await getBoatIdBySlug(slug)
    const refs = []
    for (const p of imgPaths) {
      const assetId = await uploadImage(p)
      refs.push(imgRef(assetId))
      console.log(`  uploaded ${path.basename(p)} → ${assetId}`)
    }
    await client.patch(_id).set({gallery: refs}).commit()
    console.log(`replaced ${slug} gallery with ${refs.length} image(s)`)
  },

  async 'boat-set-field'(args) {
    const [slug, field, ...valueParts] = args
    if (!slug || !field || valueParts.length === 0)
      usage('boat-set-field <slug> <field> <value-json-or-string>')
    const _id = await getBoatIdBySlug(slug)
    const raw = valueParts.join(' ')
    let value
    try {
      value = JSON.parse(raw)
    } catch {
      value = raw
    }
    await client.patch(_id).set({[field]: value}).commit()
    console.log(`${slug}.${field} updated`)
  },

  async 'boat-patch'(args) {
    const [slug, ...jsonParts] = args
    if (!slug || jsonParts.length === 0) usage('boat-patch <slug> <json-patch>')
    const _id = await getBoatIdBySlug(slug)
    const patchObj = JSON.parse(jsonParts.join(' '))
    await client.patch(_id).set(patchObj).commit()
    console.log(`${slug} patched (${Object.keys(patchObj).join(', ')})`)
  },

  async 'boat-status'(args) {
    const [slug, status] = args
    if (!slug || !status) usage('boat-status <slug> <live|coming|draft>')
    if (!['live', 'coming', 'draft'].includes(status))
      throw new Error('status must be live | coming | draft')
    const _id = await getBoatIdBySlug(slug)
    await client.patch(_id).set({status}).commit()
    console.log(`${slug}.status = ${status}`)
  },

  // ------------------------------------------------------------
  // Text extraction
  // ------------------------------------------------------------

  async 'extract-docx'(args) {
    if (!args[0]) usage('extract-docx <path>')
    const p = args[0]
    if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`)
    const tmp = path.join(os.tmpdir(), `docx_${Date.now()}_${Math.random().toString(36).slice(2)}`)
    fs.mkdirSync(tmp, {recursive: true})
    try {
      execSync(`unzip -q "${p}" -d "${tmp}"`, {stdio: 'pipe'})
      const xmlPath = path.join(tmp, 'word', 'document.xml')
      if (!fs.existsSync(xmlPath)) throw new Error('not a docx (no word/document.xml)')
      const xml = fs.readFileSync(xmlPath, 'utf8')
      const paragraphs = xml.split(/<w:p[\s>]/)
      const out = []
      for (const para of paragraphs) {
        const parts = [...para.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1])
        const line = parts.join('').trim()
        out.push(line)
      }
      console.log(out.join('\n'))
    } finally {
      fs.rmSync(tmp, {recursive: true, force: true})
    }
  },

  async 'extract-pdf'(args) {
    if (!args[0]) usage('extract-pdf <path>')
    const p = args[0]
    if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`)
    let pdfParse
    try {
      // pdf-parse has a debug-mode test-file read on default import;
      // import the inner module directly to avoid it.
      pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default
    } catch (err) {
      console.error('pdf-parse not installed. Run:  (cd studio && npm install pdf-parse)')
      process.exit(1)
    }
    const buf = fs.readFileSync(p)
    const data = await pdfParse(buf)
    const text = (data.text || '').trim()
    if (!text) {
      console.error(
        `No text extracted from ${path.basename(p)}. Likely image-based PDF. OCR not yet wired up — review manually.`,
      )
      process.exit(3)
    }
    console.log(text)
  },

  // ------------------------------------------------------------
  // Asset utilities
  // ------------------------------------------------------------

  /**
   * Given a folder, classify its contents: images / docx / pdf / other.
   * Useful as a first pass before deciding how to ingest.
   */
  async scan(args) {
    if (!args[0]) usage('scan <folder-path>')
    const folder = args[0]
    if (!fs.existsSync(folder)) throw new Error(`Folder not found: ${folder}`)

    const walk = (dir) => {
      const out = []
      for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (/^Archive/i.test(entry.name)) continue // skip archive folders
          out.push(...walk(full))
        } else {
          out.push(full)
        }
      }
      return out
    }

    const files = walk(folder)
    const bucket = {image: [], docx: [], pdf: [], markdown: [], other: []}
    for (const f of files) {
      const ext = path.extname(f).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) bucket.image.push(f)
      else if (ext === '.docx') bucket.docx.push(f)
      else if (ext === '.pdf') bucket.pdf.push(f)
      else if (ext === '.md') bucket.markdown.push(f)
      else bucket.other.push(f)
    }

    console.log(JSON.stringify(bucket, null, 2))
  },

  help() {
    console.log(
      [
        'FALKA Ingest CLI',
        '',
        'Usage: node studio/ingest.mjs <command> [args...]',
        '',
        'Queries:',
        '  boats                                       List all boats (order, name, slug, status)',
        '  boat <slug>                                 Print full JSON of a boat',
        '  boat-by-folder <folder-path>                Auto-identify boat slug from folder name',
        '  scan <folder-path>                          Classify folder contents by file type',
        '',
        'Image ops (upload + patch boat):',
        '  upload <image-path>                         Upload to Sanity, return asset ID',
        '  boat-hero <slug> <image-path>               Upload + set as hero image',
        '  boat-card <slug> <image-path>               Upload + set as range-card image',
        '  boat-gallery-add <slug> <image-path>...     Upload + append to gallery',
        '  boat-gallery-replace <slug> <image-path>... Upload + replace entire gallery',
        '',
        'Field ops:',
        '  boat-set-field <slug> <field> <value>       Set one field (value JSON or raw string)',
        '  boat-patch <slug> <json>                    Merge a JSON patch object into a boat',
        '  boat-status <slug> <live|coming|draft>      Toggle visibility',
        '',
        'Text extraction:',
        '  extract-docx <path>                         Print clean text from a .docx',
        '  extract-pdf <path>                          Print text from a text-based .pdf',
        '',
        'Help:',
        '  help                                        Show this message',
      ].join('\n'),
    )
  },
}

// ---- Dispatch ----

const [, , cmd, ...args] = process.argv
const fn = commands[cmd] || commands.help
try {
  await fn(args)
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
