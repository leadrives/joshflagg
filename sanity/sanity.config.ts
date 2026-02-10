import {defineConfig, type Template} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'ahamadNew',

  projectId: 'xwla8vtz',
  dataset: 'production',

  plugins: [
    structureTool({structure}), 
    visionTool()
  ],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'property-notable',
        title: 'Notable Transaction',
        schemaType: 'property',
        value: {
          listingType: 'notable',
        },
      } as Template,
      {
        id: 'property-exclusive',
        title: 'Exclusive Listing',
        schemaType: 'property',
        value: {
          listingType: 'exclusive',
        },
      } as Template,
    ],
  },
})
