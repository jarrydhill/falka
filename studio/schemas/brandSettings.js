// Singleton document holding brand-wide copy + settings.
// Accessed at the top of the studio structure.
export default {
  name: 'brandSettings',
  title: 'Brand settings',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'philosophy', title: 'Philosophy / origin'},
    {name: 'pillars', title: 'Pillars'},
    {name: 'range', title: 'Range section'},
    {name: 'configurator', title: 'Configurator'},
    {name: 'craft', title: 'Craftsmanship'},
    {name: 'enquire', title: 'Contact'},
    {name: 'footer', title: 'Footer / SEO'},
  ],
  fields: [
    // --- Hero ---
    {
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      group: 'hero',
      initialValue: 'Australian designed · Owner-operated',
    },
    {
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'object',
      group: 'hero',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (gold)', type: 'string'},
      ],
    },
    {
      name: 'heroSubtitle',
      title: 'Hero subtitle',
      type: 'text',
      rows: 3,
      group: 'hero',
    },
    {
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'hero',
      options: {hotspot: true},
    },

    // --- Philosophy / origin ---
    {
      name: 'philosophyEyebrow',
      title: 'Philosophy eyebrow',
      type: 'string',
      group: 'philosophy',
      initialValue: 'Why We Built It',
    },
    {
      name: 'philosophyHeadline',
      title: 'Philosophy headline',
      type: 'object',
      group: 'philosophy',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (gold)', type: 'string'},
      ],
    },
    {
      name: 'philosophyBody',
      title: 'Philosophy body paragraphs',
      type: 'array',
      of: [{type: 'text', rows: 4}],
      group: 'philosophy',
      description: 'Each entry is a paragraph. Founder-voice "I" is OK here per brand skill.',
    },
    {
      name: 'philosophyStats',
      title: 'Stat block under philosophy',
      type: 'array',
      group: 'philosophy',
      validation: (Rule) => Rule.max(3),
      of: [
        {
          type: 'object',
          fields: [
            {name: 'value', title: 'Value', type: 'string'},
            {name: 'label', title: 'Label', type: 'string'},
          ],
          preview: {select: {title: 'value', subtitle: 'label'}},
        },
      ],
    },

    // --- Pillars ---
    {
      name: 'pillarsEyebrow',
      title: 'Pillars eyebrow',
      type: 'string',
      group: 'pillars',
      initialValue: 'What Backs It',
    },
    {
      name: 'pillarsHeadline',
      title: 'Pillars headline',
      type: 'object',
      group: 'pillars',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (gold)', type: 'string'},
      ],
    },
    {
      name: 'pillars',
      title: 'Pillar cards',
      type: 'array',
      group: 'pillars',
      of: [{type: 'pillar'}],
      validation: (Rule) => Rule.max(4),
    },

    // --- Range ---
    {
      name: 'rangeEyebrow',
      title: 'Range eyebrow',
      type: 'string',
      group: 'range',
      initialValue: 'The Line-Up',
    },
    {
      name: 'rangeHeadline',
      title: 'Range headline',
      type: 'object',
      group: 'range',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (gold)', type: 'string'},
      ],
    },
    {
      name: 'rangeSubtitle',
      title: 'Range subtitle',
      type: 'text',
      rows: 3,
      group: 'range',
    },

    // --- Configurator ---
    {
      name: 'configuratorEyebrow',
      title: 'Configurator eyebrow',
      type: 'string',
      group: 'configurator',
      initialValue: 'Configure',
    },
    {
      name: 'configuratorHeadline',
      title: 'Configurator headline',
      type: 'object',
      group: 'configurator',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (gold)', type: 'string'},
      ],
    },
    {
      name: 'configuratorSubtitle',
      title: 'Configurator subtitle',
      type: 'text',
      rows: 2,
      group: 'configurator',
    },

    // --- Craftsmanship ---
    {
      name: 'craftEyebrow',
      title: 'Craft eyebrow',
      type: 'string',
      group: 'craft',
      initialValue: 'How We Build',
    },
    {
      name: 'craftHeadline',
      title: 'Craft headline',
      type: 'object',
      group: 'craft',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (gold)', type: 'string'},
      ],
    },
    {
      name: 'craftLead',
      title: 'Craft lead paragraph',
      type: 'text',
      rows: 4,
      group: 'craft',
    },
    {
      name: 'craftImage',
      title: 'Craft portrait image',
      type: 'image',
      group: 'craft',
      options: {hotspot: true},
    },
    {
      name: 'craftPillars',
      title: 'Craft sub-pillars',
      type: 'array',
      group: 'craft',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'description', title: 'Description', type: 'text', rows: 2},
          ],
          preview: {select: {title: 'title', subtitle: 'description'}},
        },
      ],
      validation: (Rule) => Rule.max(4),
    },

    // --- Contact / Enquire ---
    {
      name: 'enquireEyebrow',
      title: 'Contact eyebrow',
      type: 'string',
      group: 'enquire',
      initialValue: 'Get in Touch',
    },
    {
      name: 'enquireHeadline',
      title: 'Contact headline',
      type: 'object',
      group: 'enquire',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (gold)', type: 'string'},
      ],
    },
    {
      name: 'enquireBody',
      title: 'Contact body',
      type: 'text',
      rows: 3,
      group: 'enquire',
    },
    {
      name: 'contactEmail',
      title: 'Contact email address',
      type: 'string',
      group: 'enquire',
      description: 'Used in the footer and mailto fallback. e.g. hello@falka.com.au',
    },
    {
      name: 'formspreeEndpoint',
      title: 'Formspree endpoint URL',
      type: 'url',
      group: 'enquire',
      description: 'Optional. If set, enquiry form posts here instead of falling back to mailto.',
    },

    // --- Footer / SEO ---
    {
      name: 'companyName',
      title: 'Company name',
      type: 'string',
      group: 'footer',
      initialValue: 'Falka Yachtworks Pty Ltd',
    },
    {
      name: 'metaDescription',
      title: 'Homepage meta description',
      type: 'text',
      rows: 2,
      group: 'footer',
    },
  ],
  preview: {
    prepare: () => ({title: 'Brand settings'}),
  },
}
