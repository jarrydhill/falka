export default {
  name: 'boat',
  title: 'Boat',
  type: 'document',
  groups: [
    {name: 'core', title: 'Core', default: true},
    {name: 'content', title: 'Copy'},
    {name: 'specs', title: 'Specification'},
    {name: 'media', title: 'Media'},
    {name: 'configurator', title: 'Configurator'},
    {name: 'layouts', title: 'Layouts & Features'},
  ],
  fields: [
    // --- Core ---
    {
      name: 'name',
      title: 'Model name',
      type: 'string',
      group: 'core',
      description: 'e.g. FALKA 01',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'core',
      options: {source: 'name', maxLength: 60},
      description: 'Auto-generated from name. e.g. falka-01 → /falka-01',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'core',
      options: {
        list: [
          {title: 'Live — visible on site', value: 'live'},
          {title: 'In development — shown as "coming soon"', value: 'coming'},
          {title: 'Draft — hidden entirely', value: 'draft'},
        ],
        layout: 'radio',
      },
      initialValue: 'live',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: 'Display order',
      type: 'number',
      group: 'core',
      description: 'Lower numbers first. FALKA 01 = 1, FALKA 02 = 2, etc.',
      validation: (Rule) => Rule.required().integer().min(0),
    },
    {
      name: 'shortLabel',
      title: 'Short label',
      type: 'string',
      group: 'core',
      description: 'e.g. "The 8-Metre All-Day Cat"',
    },

    // --- Content / Copy ---
    {
      name: 'headline',
      title: 'Headline',
      type: 'object',
      group: 'content',
      description: 'e.g. "EIGHT METRES. SUN UP TO SUN DOWN." — split so the accent colour can be applied to the second half.',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (shown in gold)', type: 'string'},
      ],
    },
    {
      name: 'scene',
      title: 'Scene (opening paragraph)',
      type: 'text',
      rows: 5,
      group: 'content',
      description: 'The scene-led opening — what a day on this boat looks like. Channels rule: lead with use case, not spec.',
    },
    {
      name: 'description',
      title: 'Second paragraph',
      type: 'text',
      rows: 4,
      group: 'content',
      description: 'Follow-on from the scene. Can introduce the build, partner yard, or positioning detail.',
    },
    {
      name: 'features',
      title: 'Feature bullet points',
      type: 'array',
      group: 'content',
      of: [{type: 'string'}],
      description: 'Short bullet points. Each one line. Shown under the scene paragraph.',
    },

    // --- Media ---
    {
      name: 'heroImage',
      title: 'Hero banner image',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      description: 'The big banner image at the top of this model\u2019s page.',
    },
    {
      name: 'rangeCardImage',
      title: 'Range card image',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      description: 'The smaller image used in the range grid on the home page.',
    },
    {
      name: 'gallery',
      title: 'Gallery images',
      type: 'array',
      group: 'media',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {name: 'caption', title: 'Caption', type: 'string'},
          ],
        },
      ],
    },

    // --- Specification table ---
    {
      name: 'specs',
      title: 'Specification table',
      type: 'array',
      group: 'specs',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()},
            {name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required()},
          ],
          preview: {
            select: {title: 'label', subtitle: 'value'},
          },
        },
      ],
      description: 'Rows shown in the spec table. e.g. Length Overall → 8.00 m.',
    },

    // --- Range card specs (mini 4-stat grid on home page) ---
    {
      name: 'rangeCardSpecs',
      title: 'Range card specs (home page mini grid)',
      type: 'array',
      group: 'specs',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'Label', type: 'string'},
            {name: 'value', title: 'Value', type: 'string'},
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        },
      ],
      validation: (Rule) => Rule.max(4),
      description: 'Up to 4 short stats shown on the home-page range card.',
    },

    // --- Configurator options (per boat) ---
    {
      name: 'configurator',
      title: 'Configurator options',
      type: 'object',
      group: 'configurator',
      description: 'Steps: Hull Colour → Upholstery → Engines → Electronics → Audio. Options are boat-specific.',
      fields: [
        {
          name: 'hullColours',
          title: 'Hull Colour options',
          type: 'array',
          of: [{type: 'configOption'}],
        },
        {
          name: 'upholsteryOptions',
          title: 'Upholstery options',
          type: 'array',
          of: [{type: 'configOption'}],
        },
        {
          name: 'engines',
          title: 'Engine options',
          type: 'array',
          of: [{type: 'configOption'}],
        },
        {
          name: 'electronicsPackages',
          title: 'Electronics packages',
          type: 'array',
          of: [{type: 'configOption'}],
        },
        {
          name: 'audioPackages',
          title: 'Audio packages',
          type: 'array',
          of: [{type: 'configOption'}],
        },
      ],
    },

    // --- Layout options (e.g. FALKA 02 has Sport / Overnighter / Twin Cabin) ---
    {
      name: 'layoutOptions',
      title: 'Layout options',
      type: 'array',
      group: 'layouts',
      of: [{type: 'layoutOption'}],
      description: 'Optional. Used for models with multiple below-deck layouts (e.g. FALKA 02).',
    },

    // --- Signature features (e.g. internal ladder, overnighter cabin) ---
    {
      name: 'signatureFeatures',
      title: 'Signature features',
      type: 'array',
      group: 'layouts',
      of: [{type: 'signatureFeature'}],
      description: 'Optional. Side-by-side image + copy blocks for standout features.',
    },
  ],

  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'shortLabel',
      status: 'status',
      media: 'rangeCardImage',
    },
    prepare({title, subtitle, status, media}) {
      const statusLabel =
        status === 'live' ? '\u2713 Live' : status === 'coming' ? '\u25CB Coming' : '\u2013 Draft'
      return {
        title,
        subtitle: `${statusLabel} \u00B7 ${subtitle || ''}`,
        media,
      }
    },
  },
}
