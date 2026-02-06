import {defineField, defineType} from 'sanity'

export const brandPartner = defineType({
  name: 'brandPartner',
  title: 'Brand Partner',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Partner Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Partner Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'website',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: 'Partner Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'category',
      title: 'Partner Category',
      type: 'string',
      options: {
        list: [
          {title: 'Developer', value: 'developer'},
          {title: 'Financial Institution', value: 'financial'},
          {title: 'Technology Partner', value: 'technology'},
          {title: 'Media Partner', value: 'media'},
          {title: 'Service Provider', value: 'service'},
          {title: 'Other', value: 'other'},
        ],
      },
    }),
    defineField({
      name: 'isActive',
      title: 'Active Partnership',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      category: 'category',
      logo: 'logo',
      isActive: 'isActive',
    },
    prepare(selection) {
      const {title, category, logo, isActive} = selection
      return {
        title,
        subtitle: `${category || 'Uncategorized'} ${isActive ? '(Active)' : '(Inactive)'}`,
        media: logo,
      }
    },
  },
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrder',
      by: [{field: 'displayOrder', direction: 'asc'}],
    },
    {
      title: 'Name',
      name: 'name',
      by: [{field: 'name', direction: 'asc'}],
    },
  ],
})