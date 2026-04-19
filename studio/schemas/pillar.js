// A single pillar card used on the home page ("CE Category B", "5-Year Warranty", etc.)
export default {
  name: 'pillar',
  title: 'Pillar',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'string',
      options: {
        list: [
          {title: 'Check-in-circle', value: 'check'},
          {title: 'Shield-with-tick', value: 'shield'},
          {title: 'Hull silhouette', value: 'hull'},
          {title: 'Knot / arrow', value: 'knot'},
        ],
      },
      initialValue: 'check',
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'description'},
  },
}
