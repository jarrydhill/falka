// A single option within a configurator step.
// Used for hull colours, upholstery, engines, electronics packages, audio packages.
export default {
  name: 'configOption',
  title: 'Configurator option',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "Twin Yamaha F30", "ISO White", "Coastal".',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Short description',
      type: 'string',
      description: 'One-line summary shown under the title.',
    },
    {
      name: 'tier',
      title: 'Tier badge',
      type: 'string',
      options: {
        list: [
          {title: '(none)', value: ''},
          {title: 'Standard', value: 'Standard'},
          {title: 'Coastal', value: 'Coastal'},
          {title: 'Offshore', value: 'Offshore'},
          {title: 'Flagship', value: 'Flagship'},
          {title: 'Essential', value: 'Essential'},
          {title: 'Premium', value: 'Premium'},
          {title: 'Concert', value: 'Concert'},
          {title: 'Expedition', value: 'Expedition'},
        ],
      },
      description: 'Shown as a badge on the option card.',
    },
    {
      name: 'isFlagship',
      title: 'Highlight as flagship',
      type: 'boolean',
      initialValue: false,
      description: 'Gold badge background instead of navy. Use for the top tier in each step.',
    },
    {
      name: 'features',
      title: 'Feature bullets',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Spec bullets shown under the description (e.g. "2 × 30 hp four-stroke").',
    },
    {
      name: 'meta',
      title: 'Meta line',
      type: 'string',
      description: 'Small footer on the card (e.g. "13 kn cruise · Best economy").',
    },
    {
      name: 'swatchHex',
      title: 'Swatch colour (for hull/upholstery only)',
      type: 'string',
      description: 'Hex colour for the colour swatch. Leave blank for non-colour options.',
    },
    {
      name: 'swatchGradientTo',
      title: 'Swatch gradient end colour (optional)',
      type: 'string',
      description: 'If set, swatch renders as a gradient from swatchHex to this colour.',
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'meta', tier: 'tier'},
    prepare({title, subtitle, tier}) {
      return {
        title,
        subtitle: [tier, subtitle].filter(Boolean).join(' \u00B7 '),
      }
    },
  },
}
