// A side-by-side image + copy block used for standout features
// (e.g. "Internal Ladder", "Overnighter Cabin" on FALKA 02).
export default {
  name: 'signatureFeature',
  title: 'Signature feature',
  type: 'object',
  fields: [
    {
      name: 'eyebrow',
      title: 'Eyebrow',
      type: 'string',
      description: 'e.g. "Signature · Internal Ladder" or "Overnighter Pack".',
    },
    {
      name: 'headline',
      title: 'Headline',
      type: 'object',
      fields: [
        {name: 'primary', title: 'Primary phrase', type: 'string'},
        {name: 'accent', title: 'Accent phrase (shown in gold)', type: 'string'},
      ],
    },
    {
      name: 'body',
      title: 'Body paragraph',
      type: 'text',
      rows: 4,
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
    },
    {
      name: 'imagePosition',
      title: 'Image position',
      type: 'string',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'left',
    },
  ],
  preview: {
    select: {title: 'eyebrow', subtitle: 'headline.primary', media: 'image'},
  },
}
