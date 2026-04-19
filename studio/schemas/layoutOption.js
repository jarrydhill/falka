// A single below-deck layout option for a boat (e.g. Sport / Overnighter / Twin Cabin).
export default {
  name: 'layoutOption',
  title: 'Layout option',
  type: 'object',
  fields: [
    {
      name: 'tag',
      title: 'Tag',
      type: 'string',
      description: 'e.g. "Option A · Base" or "Recommended · Option B".',
    },
    {
      name: 'recommended',
      title: 'Mark as recommended',
      type: 'boolean',
      initialValue: false,
      description: 'Highlights this layout with the gold accent border.',
    },
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "Sport Day Boat", "Overnighter", "Twin Cabin Weekender".',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'stats',
      title: 'Stats',
      type: 'array',
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
      description: 'e.g. Berths → 2, Head → Enclosed, Build Cost → +18%.',
    },
  ],
  preview: {
    select: {title: 'title', subtitle: 'tag'},
  },
}
