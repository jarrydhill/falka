// One-time seed script.
// Uploads FALKA images as Sanity assets and creates the brandSettings singleton
// plus FALKA 01 and FALKA 02 documents matching the current live site content.
// Safe to re-run — uses createOrReplace for idempotency.
//
// Run with:  node seed.mjs

import {createClient} from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const IMG_DIR = path.join(__dirname, '..', 'falka-images')

// Read the Sanity CLI auth token
const cfgPath = path.join(os.homedir(), '.config', 'sanity', 'config.json')
const {authToken} = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))

const client = createClient({
  projectId: '1gdzw1s6',
  dataset: 'production',
  token: authToken,
  apiVersion: '2024-01-01',
  useCdn: false,
})

const ref = (id) => ({_type: 'image', asset: {_type: 'reference', _ref: id}})

async function uploadImage(filename, attempt = 1) {
  const full = path.join(IMG_DIR, filename)
  if (!fs.existsSync(full)) throw new Error(`Missing image: ${full}`)
  const data = fs.readFileSync(full)
  try {
    const asset = await client.assets.upload('image', data, {filename})
    console.log(`  uploaded ${filename} → ${asset._id}`)
    return asset._id
  } catch (err) {
    if (attempt < 4) {
      const delay = attempt * 2000
      console.log(`  retry ${attempt} for ${filename} (wait ${delay}ms) — ${err.message}`)
      await new Promise((r) => setTimeout(r, delay))
      return uploadImage(filename, attempt + 1)
    }
    throw err
  }
}

async function main() {
  console.log('\n--- uploading images ---')
  const img = {}
  const files = [
    'hero-navy-hull.jpeg',
    'running-sea-eclipse.jpeg',
    'running-serenity.jpeg',
    'lifestyle-sundeck.jpeg',
    'interior-helm.jpeg',
    'rear-serenity.jpeg',
    'craft-portrait.jpeg',
    'falka02-hero.jpeg',
    'falka02-running.jpeg',
    'falka02-profile.jpeg',
    'falka02-aerial.jpeg',
    'falka02-saloon.jpeg',
    'falka02-wetbar.jpeg',
    'falka02-cabin.jpeg',
    'falka02-ladder.jpeg',
  ]
  for (const f of files) {
    const key = f.replace(/\.jpe?g$/, '').replace(/-/g, '_')
    img[key] = await uploadImage(f)
  }

  console.log('\n--- creating brandSettings singleton ---')
  await client.createOrReplace({
    _id: 'brandSettings',
    _type: 'brandSettings',
    heroEyebrow: 'Australian designed \u00B7 Owner-operated',
    heroHeadline: {
      primary: 'AN ALL-DAY BOAT.',
      accent: 'NOT JUST A DAY BOAT.',
    },
    heroSubtitle:
      'Power catamarans built for families and friends on the water, sun up to sun down. Two in the water \u2014 FALKA 01 at eight metres, FALKA 02 at 9.58.',
    heroImage: ref(img.hero_navy_hull),

    philosophyEyebrow: 'Why We Built It',
    philosophyHeadline: {primary: 'WE BUILT IT BECAUSE', accent: 'IT DIDN\u2019T EXIST.'},
    philosophyBody: [
      'I went looking for a cat that could do a full day on the water with family and friends \u2014 sun up to sun down \u2014 without tapping out at lunchtime. Everything in the right size was a day boat dressed up. Everything with the right amenity was fifteen metres of boat and a marina berth I didn\u2019t want.',
      'So we built the one in the middle. Big-boat amenity in a trailerable, owner-operated platform. Proper galley. Real shade. Shelter when the weather turns. Room to spread out without being on top of each other.',
    ],
    philosophyStats: [
      {value: '3', label: 'Models in the Range'},
      {value: '100%', label: 'Australian Designed'},
      {value: '13kn', label: 'Designed Cruise Speed'},
    ],

    pillarsEyebrow: 'What Backs It',
    pillarsHeadline: {primary: 'BUILT TO THE', accent: 'NUMBERS.'},
    pillars: [
      {
        _type: 'pillar',
        title: 'CE Category B',
        description: 'Offshore-certified across the range. Built for open water, not just inshore days.',
        icon: 'check',
      },
      {
        _type: 'pillar',
        title: '5-Year Warranty',
        description: 'Structural and osmosis. Written into the spec, commissioned in Australia, honoured here.',
        icon: 'shield',
      },
      {
        _type: 'pillar',
        title: 'Nazarov Hull',
        description: 'FALKA 02 runs on the proven Samui 9.50 hull by Albert Nazarov, built by Andaman Boatyard.',
        icon: 'hull',
      },
      {
        _type: 'pillar',
        title: '13-Knot Displacement',
        description: 'Tuned for economy, range, and reserve in weather. Not raw speed.',
        icon: 'knot',
      },
    ],

    rangeEyebrow: 'The Line-Up',
    rangeHeadline: {primary: 'TWO IN THE WATER.', accent: 'ONE COMING.'},
    rangeSubtitle:
      'A deliberately small line-up. Same all-day brief, different scales \u2014 so you pick the boat, not the compromise.',

    configuratorEyebrow: 'Configure',
    configuratorHeadline: {primary: 'BUILD', accent: 'YOURS.'},
    configuratorSubtitle:
      'Walk the key decisions. No prices here \u2014 we\u2019ll come back with a real quote once we know the build.',

    craftEyebrow: 'How We Build',
    craftHeadline: {primary: 'MADE THE SLOW WAY.', accent: 'ON PURPOSE.'},
    craftLead:
      'No production lines. No shortcuts. Every FALKA is hand-laid by a partner yard we\u2019ve worked with, travelled to, and sea-trialled alongside. Our manufacturing spec runs past fifty pages per model \u2014 it reads like a legal document because it is one.',
    craftImage: ref(img.craft_portrait),
    craftPillars: [
      {title: 'Designed here', description: 'Naval architecture, systems design, and layout \u2014 drawn in Australia, for Australian conditions.'},
      {title: 'Built by hand', description: 'Hulls laid up in the right yard for each model, to a signed spec. No production line.'},
      {title: 'Lithium-first', description: 'Victron Smart BMS, MultiPlus-II, integrated solar. Built for quiet anchor nights, not noisy weekends.'},
      {title: 'Commissioned here', description: 'Every hull arrives home for commissioning, a handover sea trial, and a five-year structural warranty.'},
    ],

    enquireEyebrow: 'Get in Touch',
    enquireHeadline: {primary: 'YOUR WATER.', accent: 'YOUR FALKA.'},
    enquireBody:
      'Thinking about commissioning a FALKA, or just want a look at what\u2019s coming? Send us a note. No sales pipeline, no mailing list \u2014 just a conversation.',
    contactEmail: 'hello@falka.com.au',

    companyName: 'Falka Yachtworks Pty Ltd',
    metaDescription:
      'FALKA builds considered power catamarans for Australian waters. Owner-operated, all-day, built because nothing else did the job.',
  })
  console.log('  brandSettings \u2713')

  console.log('\n--- creating FALKA 01 ---')
  await client.createOrReplace({
    _id: 'boat-falka-01',
    _type: 'boat',
    name: 'FALKA 01',
    slug: {_type: 'slug', current: 'falka-01'},
    status: 'live',
    order: 1,
    shortLabel: 'The 8-Metre All-Day Cat',
    headline: {primary: 'EIGHT METRES.', accent: 'SUN UP TO SUN DOWN.'},
    scene:
      'Leave the ramp at six. Coffee and bacon rolls on the galley bench before the wind fills in. Swim stops through the morning, a long lunch at anchor, kids asleep under the hardtop on the way home. That\u2019s the day FALKA 01 is built for.',
    description:
      'An eight-metre displacement cat, owner-operated, hand-laid GRP. Lithium house bank, solar on the hardtop, twin outboards tuned for range over speed. Built for families and friends on the water \u2014 not weekend guests being entertained.',
    features: [
      'Hand-laid GRP with vinylester outer skin, vacuum-bagged foam-cored deck and hardtop',
      'Twin outboard, CE Category B offshore-rated',
      'Lithium house bank, Victron MultiPlus-II inverter, hardtop-integrated solar',
      'Garmin 12-inch MFD, Fantom 18x radar, autopilot, AIS, Starlink-ready',
      'Fusion Apollo audio across three zones, JL Audio M3 throughout',
      'U-shaped cockpit galley \u2014 65L fridge, induction option, freshwater transom shower',
      'Hardtop sun pad with integrated ladder \u2014 a second deck, not an afterthought',
      'Commissioned in Australia. 5-year hull warranty, 2-year systems',
    ],
    heroImage: ref(img.running_serenity),
    rangeCardImage: ref(img.running_sea_eclipse),
    gallery: [
      {_type: 'image', asset: {_type: 'reference', _ref: img.lifestyle_sundeck}},
      {_type: 'image', asset: {_type: 'reference', _ref: img.interior_helm}},
      {_type: 'image', asset: {_type: 'reference', _ref: img.rear_serenity}},
    ],
    rangeCardSpecs: [
      {label: 'LOA', value: '8.00 m'},
      {label: 'Beam', value: '4.50 m'},
      {label: 'Capacity', value: '8 POB'},
      {label: 'Power', value: '2 \u00D7 30\u201390 hp'},
    ],
    specs: [
      {label: 'Length Overall', value: '8.00 m'},
      {label: 'Beam Overall', value: '4.50 m'},
      {label: 'Hull Type', value: 'Displacement Catamaran'},
      {label: 'Construction', value: 'Hand-laid GRP'},
      {label: 'Design Category', value: 'CE Cat B \u2014 Offshore'},
      {label: 'Propulsion', value: 'Twin Outboard'},
      {label: 'Power Options', value: '2 \u00D7 30\u201390 hp'},
      {label: 'Cruise Speed', value: '13 knots'},
      {label: 'Top Speed', value: '20 knots'},
      {label: 'Max Persons (Day)', value: '8 POB'},
      {label: 'House Power', value: 'Lithium + Solar'},
      {label: 'Electronics', value: 'Garmin Suite'},
      {label: 'Warranty', value: '5yr Hull / 2yr Systems'},
    ],
    configurator: {
      hullColours: [
        {_type: 'configOption', title: 'ISO White', description: 'The classic. Bright, clean, hard to get wrong.', swatchHex: '#FAFAF7', swatchGradientTo: '#E8E4DB'},
        {_type: 'configOption', title: 'Ocean Navy', description: 'Deep navy. Signature FALKA finish.', swatchHex: '#1E2F4D', swatchGradientTo: '#0B1524'},
        {_type: 'configOption', title: 'Stone Grey', description: 'Modern, low-maintenance neutral.', swatchHex: '#8E9299', swatchGradientTo: '#5A6066'},
        {_type: 'configOption', title: 'Champagne', description: 'Warm metallic \u2014 special-order finish.', swatchHex: '#D9C8A8', swatchGradientTo: '#B89968'},
      ],
      upholsteryOptions: [
        {_type: 'configOption', title: 'Arctic White', description: 'Matches the renders. Bright and crisp.', swatchHex: '#FFFFFF', swatchGradientTo: '#F2EFE8'},
        {_type: 'configOption', title: 'Dune', description: 'Warm sand \u2014 hides wear beautifully.', swatchHex: '#E8DFD0', swatchGradientTo: '#C9BCA3'},
        {_type: 'configOption', title: 'Storm Grey', description: 'Cool, neutral, highly practical.', swatchHex: '#9DA3AB', swatchGradientTo: '#676D75'},
        {_type: 'configOption', title: 'Carbon', description: 'Low-key and refined. Runs cooler than you\u2019d think.', swatchHex: '#3E434A', swatchGradientTo: '#1D2026'},
      ],
      engines: [
        {_type: 'configOption', title: 'Twin Yamaha F30', tier: 'Standard', description: 'The designed specification \u2014 matched to the hull, tuned for economy. Quiet, efficient displacement running.', features: ['2 \u00D7 30 hp four-stroke', 'Lowest fuel burn \u2014 maximum range', 'Mechanical throttle & shift'], meta: '13 kn cruise \u00B7 Best economy'},
        {_type: 'configOption', title: 'Twin Yamaha F60', tier: 'Coastal', description: 'Extra reserve for coastal work \u2014 easier handling in chop, stronger headway against current and wind.', features: ['2 \u00D7 60 hp four-stroke', 'Electronic fuel injection', 'Digital Throttle & Shift ready'], meta: '13 kn cruise \u00B7 Added reserve'},
        {_type: 'configOption', title: 'Twin Yamaha F90', tier: 'Flagship', isFlagship: true, description: 'The most capable specification. Maximum weather reserve, stronger alternators, confident handling in offshore conditions.', features: ['2 \u00D7 90 hp inline four-stroke', 'Larger 35A alternators per engine', 'Digital Electric Steering ready'], meta: '13 kn cruise \u00B7 20 kn top'},
      ],
      electronicsPackages: [
        {_type: 'configOption', title: 'Coastal', tier: 'Coastal', description: 'Everything you need for day work in familiar waters.', features: ['Garmin GPSMAP 8412xsv (12" touch)', 'GT54UHD-TM CHIRP/ClearV\u00FC/SideV\u00FC sounder', 'VHF 215 AIS with DSC', 'Ritchie Helmsman compass'], meta: 'Standard Fit'},
        {_type: 'configOption', title: 'Offshore', tier: 'Offshore', description: 'The Coastal pack plus redundancy, radar, and hands-off helming.', features: ['Dual GPSMAP 8412xsv (12" + 10")', 'Fantom 18x dome radar', 'AIS 800 Class B+ transceiver', 'Reactor 40 hydraulic autopilot'], meta: 'Offshore-Ready'},
        {_type: 'configOption', title: 'Expedition', tier: 'Expedition', isFlagship: true, description: 'The full suite for long-range, all-weather, all-hours work.', features: ['Offshore pack included', 'Garmin OnDeck remote monitoring', 'Thermal night camera', 'Starlink Mini pre-wired install'], meta: 'Long-Range'},
      ],
      audioPackages: [
        {_type: 'configOption', title: 'Essential', tier: 'Essential', description: 'Clean, capable audio for day use. Everything you need, nothing you don\u2019t.', features: ['Fusion Apollo MS-RA670 head', '4 \u00D7 JL Audio M3 cockpit speakers', 'Single-zone Bluetooth & AirPlay'], meta: 'Standard Fit'},
        {_type: 'configOption', title: 'Premium', tier: 'Premium', description: 'Wider coverage, deeper low end, independent zones for bow and cockpit.', features: ['Fusion Apollo MS-RA800 head', '6 \u00D7 JL Audio M3 speakers (cockpit + bow)', 'JL Audio M3-10IB 10" subwoofer', '3 independent audio zones'], meta: '3-Zone'},
        {_type: 'configOption', title: 'Concert', tier: 'Concert', isFlagship: true, description: 'Reference-grade marine audio. Signature zone on the hardtop, full system tuning, RGB mood integration.', features: ['Fusion Apollo MS-RA800 + DSP tuning', '10 \u00D7 JL Audio M6 premium speakers', 'JL Audio MX600/4 + MX280/1 amplification', 'RGB-synced lighting across zones'], meta: 'Audiophile'},
      ],
    },
  })
  console.log('  FALKA 01 \u2713')

  console.log('\n--- creating FALKA 02 ---')
  await client.createOrReplace({
    _id: 'boat-falka-02',
    _type: 'boat',
    name: 'FALKA 02',
    slug: {_type: 'slug', current: 'falka-02'},
    status: 'live',
    order: 2,
    shortLabel: 'The 9.58-Metre All-Day Cat',
    headline: {primary: 'MORE BOAT.', accent: 'SAME DAY.'},
    scene:
      'Same brief as FALKA 01, stretched. Twelve on board for the whole day without anyone finding themselves in a cooler. A proper galley, a proper wet bar, twin aft sunbeds that sleep two on the trip home. The silhouette of an all-day boat, the volume of something bigger.',
    description:
      'Built in Thailand on Albert Nazarov\u2019s Samui 9.50 hull by Andaman Boatyard, and finished to FALKA standards on the way home. 9.58 metres by 5.22. Twin outboards. Composite honeycomb. Same displacement brief as FALKA 01 \u2014 13 knot cruise, 20 knot top. Add the Overnighter Pack and a discreet double berth appears below deck, without changing what the boat looks like above.',
    features: [
      'Composite PP honeycomb sandwich \u2014 light, stiff, low maintenance',
      'Flush-moulded solar in the composite hardtop \u2014 silent anchor nights',
      'Polished 316 stainless internal ladder with teak treads, up to a rooftop sun deck',
      'Corian-topped wet bar, 65 L drawer fridge, stainless sink, amber footwell lighting',
      'White leather U-lounges, twin teak-topped tables, eight at dinner',
      'Twin 115\u2013200 hp outboards, 2 \u00D7 200 L fuel, 2 \u00D7 100 L fresh water (upgradable to 400 L)',
      'CE Category B offshore, 5,340 kg loaded',
      'Three layouts \u2014 Sport, Overnighter, or Twin Cabin Weekender',
    ],
    heroImage: ref(img.falka02_hero),
    rangeCardImage: ref(img.falka02_running),
    gallery: [
      {_type: 'image', asset: {_type: 'reference', _ref: img.falka02_aerial}},
      {_type: 'image', asset: {_type: 'reference', _ref: img.falka02_saloon}},
      {_type: 'image', asset: {_type: 'reference', _ref: img.falka02_wetbar}},
    ],
    rangeCardSpecs: [
      {label: 'LOA', value: '9.58 m'},
      {label: 'Beam', value: '5.22 m'},
      {label: 'Capacity', value: '12 POB'},
      {label: 'Power', value: '2 \u00D7 115\u2013200 hp'},
    ],
    specs: [
      {label: 'Length Overall', value: '9.58 m'},
      {label: 'Beam Overall', value: '5.22 m'},
      {label: 'Displacement (Loaded)', value: '5,340 kg'},
      {label: 'Draught', value: '0.60 m'},
      {label: 'Hull', value: 'Samui 9.50 \u2014 A. Nazarov'},
      {label: 'Construction', value: 'Composite Honeycomb'},
      {label: 'Design Category', value: 'CE Cat B \u2014 Offshore'},
      {label: 'Propulsion', value: 'Twin Outboard'},
      {label: 'Power Options', value: '2 \u00D7 115\u2013200 hp'},
      {label: 'Fuel Capacity', value: '2 \u00D7 200 L'},
      {label: 'Fresh Water', value: '2 \u00D7 100 L (400 L opt.)'},
      {label: 'Day Capacity', value: '12 POB'},
      {label: 'Sleeping (optional)', value: '0\u20134 berths'},
      {label: 'Builder', value: 'Andaman Boatyard'},
    ],
    configurator: {
      hullColours: [
        {_type: 'configOption', title: 'ISO White', description: 'Marine-grade isophthalic gelcoat.', swatchHex: '#FAFAF7', swatchGradientTo: '#E8E4DB'},
        {_type: 'configOption', title: 'Ocean Navy', description: 'Signature FALKA finish.', swatchHex: '#1E2F4D', swatchGradientTo: '#0B1524'},
        {_type: 'configOption', title: 'Stone Grey', description: 'Modern, low-maintenance neutral.', swatchHex: '#8E9299', swatchGradientTo: '#5A6066'},
        {_type: 'configOption', title: 'Champagne', description: 'Warm metallic \u2014 special-order finish.', swatchHex: '#D9C8A8', swatchGradientTo: '#B89968'},
      ],
      upholsteryOptions: [
        {_type: 'configOption', title: 'Leather Ivory', description: 'White leather \u2014 matches the render.', swatchHex: '#F5F0E6', swatchGradientTo: '#E8DFCB'},
        {_type: 'configOption', title: 'Leather Cognac', description: 'Warm tan leather \u2014 develops patina.', swatchHex: '#A87147', swatchGradientTo: '#7C4F30'},
        {_type: 'configOption', title: 'Silvertex Arctic White', description: 'Marine vinyl \u2014 bright, crisp, practical.', swatchHex: '#FFFFFF', swatchGradientTo: '#F2EFE8'},
        {_type: 'configOption', title: 'Silvertex Storm Grey', description: 'Cool, neutral marine vinyl.', swatchHex: '#9DA3AB', swatchGradientTo: '#676D75'},
      ],
      engines: [
        {_type: 'configOption', title: 'Twin Yamaha F115', tier: 'Standard', description: 'The designed specification \u2014 matched to the Samui 9.50 hull rating.', features: ['2 \u00D7 115 hp inline four', 'Variable Camshaft Timing', 'Digital Throttle & Shift'], meta: '13 kn cruise \u00B7 Hull spec'},
        {_type: 'configOption', title: 'Twin Yamaha F150', tier: 'Coastal', description: 'Stronger mid-range, easier handling in chop.', features: ['2 \u00D7 150 hp four-stroke', 'Electronic fuel injection', 'Command Link Plus compatible'], meta: '13 kn cruise \u00B7 Added reserve'},
        {_type: 'configOption', title: 'Twin Yamaha F200', tier: 'Flagship', isFlagship: true, description: 'Maximum capable specification. Full reserve, Helm Master EX joystick compatible.', features: ['2 \u00D7 200 hp V6', 'Helm Master EX ready', 'SetPoint & FishPoint anchor-hold'], meta: '13 kn cruise \u00B7 20 kn top'},
      ],
      electronicsPackages: [
        {_type: 'configOption', title: 'Coastal', tier: 'Coastal', description: 'Everything you need for day work in familiar waters.', features: ['Garmin GPSMAP 8412xsv (12" touch)', 'GT54UHD-TM sounder', 'VHF 215 AIS', 'Ritchie Helmsman compass'], meta: 'Standard Fit'},
        {_type: 'configOption', title: 'Offshore', tier: 'Offshore', description: 'Redundancy, radar, and hands-off helming \u2014 default for FALKA 02.', features: ['Dual GPSMAP 8412xsv (12" + 10")', 'Fantom 18x dome radar', 'AIS 800 Class B+ transceiver', 'Reactor 40 hydraulic autopilot'], meta: 'FALKA 02 default'},
        {_type: 'configOption', title: 'Expedition', tier: 'Expedition', isFlagship: true, description: 'The full suite for long-range, all-weather, all-hours work.', features: ['Offshore pack included', 'Garmin OnDeck remote monitoring', 'Thermal night camera', 'Starlink Mini pre-wired install'], meta: 'Long-Range'},
      ],
      audioPackages: [
        {_type: 'configOption', title: 'Essential', tier: 'Essential', description: 'Clean, capable audio for day use.', features: ['Fusion Apollo MS-RA670 head', '4 \u00D7 JL Audio M3 cockpit speakers', 'Single-zone Bluetooth & AirPlay'], meta: 'Standard Fit'},
        {_type: 'configOption', title: 'Premium', tier: 'Premium', description: 'Wider coverage, deeper low end, independent zones for bow and cockpit.', features: ['Fusion Apollo MS-RA800 head', '6 \u00D7 JL Audio M3 speakers', 'JL Audio M3-10IB 10" subwoofer', '3 independent audio zones'], meta: '3-Zone'},
        {_type: 'configOption', title: 'Concert', tier: 'Concert', isFlagship: true, description: 'Reference-grade marine audio, RGB mood integration.', features: ['Fusion Apollo MS-RA800 + DSP tuning', '10 \u00D7 JL Audio M6 speakers', 'JL Audio MX600/4 + MX280/1 amps', 'RGB-synced lighting across zones'], meta: 'Audiophile'},
      ],
    },
    layoutOptions: [
      {
        _type: 'layoutOption',
        tag: 'Option A \u00B7 Base',
        title: 'Sport Day Boat',
        description: 'The FALKA brief in its plainest form. No cabins, no enclosed heads. Bridgedeck and both hulls given over to saloon, sunbeds, and wet bar. Optional day toilet under the helm.',
        stats: [
          {label: 'Berths', value: '0'},
          {label: 'Day Capacity', value: '12 POB'},
          {label: 'Light Ship', value: '4,900 kg'},
          {label: 'Build Cost', value: 'Base'},
        ],
      },
      {
        _type: 'layoutOption',
        tag: 'Recommended \u00B7 Option B',
        recommended: true,
        title: 'Overnighter',
        description: 'One owner\u2019s cabin \u2014 a 1.9 \u00D7 1.3 m athwartships double in the starboard hull, day head in the port. A weekend on the boat without changing what it looks like above deck.',
        stats: [
          {label: 'Berths', value: '2'},
          {label: 'Head', value: 'Enclosed'},
          {label: 'Day Capacity', value: '10 POB'},
          {label: 'Build Cost', value: '+18%'},
        ],
      },
      {
        _type: 'layoutOption',
        tag: 'Option C \u00B7 Twin',
        title: 'Twin Cabin Weekender',
        description: 'A single berth forward in each hull (1.9 \u00D7 1.0 m), shared wet head between. Two couples, or a family of four, for longer trips. Forward sunbed volume drops to make room.',
        stats: [
          {label: 'Berths', value: '4'},
          {label: 'Head', value: 'Shared wet'},
          {label: 'Day Capacity', value: '10 POB'},
          {label: 'Build Cost', value: '+26%'},
        ],
      },
    ],
    signatureFeatures: [
      {
        _type: 'signatureFeature',
        eyebrow: 'Signature \u00B7 Internal Ladder',
        headline: {primary: 'UPSTAIRS,', accent: 'WITHOUT THE CLAMBER.'},
        body:
          'A polished 316 stainless ladder with teak-clad treads rises from the port side of the cockpit, through a clean rectangular opening in the hardtop, to the sun deck above. No arch to climb around. The top deck reads as an extension of the saloon, not an afterthought above it.',
        image: ref(img.falka02_ladder),
        imagePosition: 'left',
      },
      {
        _type: 'signatureFeature',
        eyebrow: 'Overnighter Pack',
        headline: {primary: 'THE CABIN THAT DOESN\u2019T', accent: 'SHOW ABOVE DECK.'},
        body:
          'A 1.9 \u00D7 1.3 m double berth, reading lights, porthole, Silvertex with piped detail \u2014 tucked into the starboard hull under the saloon. Stay out for the weekend without the boat looking like a cruiser from the outside.',
        image: ref(img.falka02_cabin),
        imagePosition: 'left',
      },
    ],
  })
  console.log('  FALKA 02 \u2713')

  // Placeholder draft for FALKA 03 — shown as "coming" on site
  console.log('\n--- creating FALKA 03 placeholder ---')
  await client.createOrReplace({
    _id: 'boat-falka-03',
    _type: 'boat',
    name: 'FALKA 03',
    slug: {_type: 'slug', current: 'falka-03'},
    status: 'coming',
    order: 3,
    shortLabel: 'Details to follow',
    rangeCardSpecs: [
      {label: 'LOA', value: '\u2014'},
      {label: 'Beam', value: '\u2014'},
      {label: 'Capacity', value: '\u2014'},
      {label: 'Release', value: '2026+'},
    ],
  })
  console.log('  FALKA 03 \u2713')

  console.log('\n\u2713 Seed complete. View in studio: https://falkamarine.sanity.studio/')
}

main().catch((err) => {
  console.error('\n\u2717 Seed failed:', err.message || err)
  if (err.stack) console.error(err.stack)
  process.exit(1)
})
