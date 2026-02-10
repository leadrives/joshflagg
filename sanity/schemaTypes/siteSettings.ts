import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
    }),
    defineField({
      name: 'keywords',
      title: 'SEO Keywords',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'logo',
      title: 'Site Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'navigation',
      title: 'Navigation Menu',
      type: 'object',
      fields: [
        {
          name: 'leftLinks',
          title: 'Left Navigation Links',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'label', title: 'Link Label', type: 'string'},
                {name: 'url', title: 'Link URL', type: 'string'},
                {name: 'isModal', title: 'Opens Modal', type: 'boolean', initialValue: false},
                {name: 'modalTarget', title: 'Modal Target', type: 'string', 
                 description: 'Modal target (e.g., #projectsModal)',
                 hidden: ({parent}) => !parent?.isModal},
              ],
            },
          ],
        },
        {
          name: 'rightLinks',
          title: 'Right Navigation Links', 
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'label', title: 'Link Label', type: 'string'},
                {name: 'url', title: 'Link URL', type: 'string'},
                {name: 'isButton', title: 'Display as Button', type: 'boolean', initialValue: false},
                {name: 'isModal', title: 'Opens Modal', type: 'boolean', initialValue: false},
                {name: 'modalTarget', title: 'Modal Target', type: 'string',
                 description: 'Modal target (e.g., #consultationModal)',
                 hidden: ({parent}) => !parent?.isModal},
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        {name: 'instagram', title: 'Instagram URL', type: 'url'},
        {name: 'linkedin', title: 'LinkedIn URL', type: 'url'},
        {name: 'twitter', title: 'Twitter URL', type: 'url'},
        {name: 'youtube', title: 'YouTube URL', type: 'url'},
      ],
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {name: 'phone', title: 'Phone Number', type: 'string'},
        {name: 'email', title: 'Email Address', type: 'email'},
        {name: 'address', title: 'Address', type: 'text'},
        {name: 'whatsapp', title: 'WhatsApp Number', type: 'string'},
      ],
    }),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      description: 'Primary site URL (e.g., https://joshflagg.ae)',
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default OG Image',
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
      description: 'Default Open Graph image for social sharing',
    }),
  ],
})