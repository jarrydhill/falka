import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

export default defineConfig({
  name: 'falka',
  title: 'FALKA',
  projectId: '1gdzw1s6',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('FALKA')
          .items([
            S.listItem()
              .title('Brand settings')
              .id('brandSettings')
              .child(
                S.document()
                  .schemaType('brandSettings')
                  .documentId('brandSettings')
                  .title('Brand settings')
              ),
            S.divider(),
            S.documentTypeListItem('boat').title('Boats'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
