import {defineField, defineType} from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      initialValue: 'Homepage',
    }),
    defineField({
      name: 'heroSection',
      title: 'Hero Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Hero Title', type: 'string'},
        {name: 'subtitle', title: 'Hero Subtitle', type: 'text'},
        {
          name: 'heroVideo',
          title: 'Hero Video',
          type: 'file',
          options: {
            accept: 'video/*',
          },
        },
        {
          name: 'heroImage',
          title: 'Hero Background Image (fallback)',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        {name: 'ctaText', title: 'Call to Action Text', type: 'string'},
        {name: 'ctaLink', title: 'Call to Action Link', type: 'url'},
      ],
    }),
    defineField({
      name: 'featuredProperties',
      title: 'Featured Properties Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {name: 'subtitle', title: 'Section Subtitle', type: 'text'},
        {
          name: 'properties',
          title: 'Featured Properties',
          type: 'array',
          of: [{type: 'reference', to: [{type: 'property'}]}],
          validation: (Rule) => Rule.max(6),
        },
      ],
    }),
    defineField({
      name: 'notableTransactions',
      title: 'Notable Transactions Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {name: 'subtitle', title: 'Section Subtitle', type: 'text'},
        {
          name: 'transactions',
          title: 'Notable Transactions',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'propertyName', title: 'Property Name', type: 'string'},
                {name: 'salePrice', title: 'Sale Price', type: 'string'},
                {name: 'location', title: 'Location', type: 'string'},
                {name: 'saleDate', title: 'Sale Date', type: 'date'},
                {
                  name: 'image',
                  title: 'Property Image',
                  type: 'image',
                  options: {hotspot: true},
                },
                {name: 'description', title: 'Brief Description', type: 'text'},
              ],
            },
          ],
          validation: (Rule) => Rule.max(10),
        },
      ],
    }),
    defineField({
      name: 'exclusiveListings',
      title: 'Exclusive Listings Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {name: 'subtitle', title: 'Section Subtitle', type: 'text'},
        {
          name: 'properties',
          title: 'Exclusive Properties',
          type: 'array',
          of: [{type: 'reference', to: [{type: 'property'}]}],
          validation: (Rule) => Rule.max(8),
        },
      ],
    }),
    defineField({
      name: 'aboutSection',
      title: 'About/Expertise Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {name: 'content', title: 'About Content', type: 'array', of: [{type: 'block'}]},
        {
          name: 'expertiseImage',
          title: 'Expertise Image',
          type: 'image',
          options: {hotspot: true},
        },
        {
          name: 'achievements',
          title: 'Achievements/Stats',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'number', title: 'Number/Stat', type: 'string'},
                {name: 'label', title: 'Label', type: 'string'},
                {name: 'description', title: 'Description', type: 'text'},
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'blogSection',
      title: 'Blog Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {name: 'subtitle', title: 'Section Subtitle', type: 'text'},
        {
          name: 'featuredPosts',
          title: 'Featured Blog Posts',
          type: 'array',
          of: [{type: 'reference', to: [{type: 'blogPost'}]}],
          validation: (Rule) => Rule.max(3),
        },
      ],
    }),
    defineField({
      name: 'trustedPartners',
      title: 'Trusted Partners Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {
          name: 'partners',
          title: 'Partner Logos',
          type: 'array',
          of: [{type: 'reference', to: [{type: 'brandPartner'}]}],
        },
      ],
    }),
    defineField({
      name: 'seoSettings',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {name: 'metaTitle', title: 'Meta Title', type: 'string'},
        {name: 'metaDescription', title: 'Meta Description', type: 'text'},
        {name: 'keywords', title: 'Keywords', type: 'array', of: [{type: 'string'}]},
        {name: 'ogImage', title: 'OG Image', type: 'image'},
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Homepage Settings',
      }
    },
  },
})