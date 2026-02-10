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
          name: 'mediaType',
          title: 'Media Type',
          type: 'string',
          options: {
            list: [
              {title: 'Image', value: 'image'},
              {title: 'YouTube Video', value: 'youtube'},
            ],
          },
          initialValue: 'image',
        },
        {
          name: 'heroVideo',
          title: 'Hero Video',
          type: 'file',
          options: {
            accept: 'video/*',
          },
        },
        {
          name: 'youtubeId',
          title: 'YouTube Video ID',
          type: 'string',
          description: 'YouTube video ID (e.g., dQw4w9WgXcQ)',
          hidden: ({parent}) => parent?.mediaType !== 'youtube',
        },
        {
          name: 'posterImage',
          title: 'Video Poster Image',
          type: 'image',
          options: {
            hotspot: true,
          },
          hidden: ({parent}) => parent?.mediaType !== 'youtube',
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
      name: 'aboutCarousel',
      title: 'About Carousel',
      type: 'object',
      fields: [
        {
          name: 'slides',
          title: 'Carousel Slides',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'title', title: 'Slide Title', type: 'string'},
                {name: 'description', title: 'Slide Description', type: 'text'},
                {
                  name: 'image',
                  title: 'Slide Image',
                  type: 'image',
                  options: {hotspot: true},
                  fields: [{name: 'alt', title: 'Alt Text', type: 'string'}],
                },
                {name: 'cta', title: 'Call to Action', type: 'string'},
              ],
            },
          ],
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
      name: 'parallaxHero',
      title: 'Mid-Page Parallax Hero',
      type: 'object',
      fields: [
        {name: 'title', title: 'Title', type: 'string'},
        {name: 'subtitle', title: 'Subtitle', type: 'text'},
        {
          name: 'image',
          title: 'Background Image',
          type: 'image',
          options: {hotspot: true},
        },
        {
          name: 'logo',
          title: 'Logo Image',
          type: 'image',
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
      name: 'testimonialsSection',
      title: 'Testimonials Section',
      type: 'object',
      fields: [
        {
          name: 'quote',
          title: 'Main Quote',
          type: 'text',
          description: 'Main testimonial quote at the top of the section',
        },
        {
          name: 'featuredTestimonials',
          title: 'Featured Testimonials',
          type: 'array',
          of: [{type: 'reference', to: [{type: 'testimonial'}]}],
          validation: (Rule) => Rule.max(6),
          description: 'Select testimonials to feature in the slider',
        },
        {
          name: 'stats',
          title: 'Achievement Stats',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {name: 'number', title: 'Number', type: 'number'},
                {name: 'suffix', title: 'Suffix (e.g., +, B+)', type: 'string'},
                {name: 'label', title: 'Label', type: 'string'},
                {name: 'prefix', title: 'Prefix (e.g., $)', type: 'string'},
              ],
            },
          ],
          validation: (Rule) => Rule.max(6),
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
    defineField({
      name: 'brandPartners',
      title: 'Brand Partners',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'brandPartner'}],
        },
      ],
    }),
    defineField({
      name: 'neighborhoods',
      title: 'Featured Neighborhoods',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'neighborhood'}],
        },
      ],
    }),
    defineField({
      name: 'blogPreview',
      title: 'Blog Preview',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'blogPost'}],
        },
      ],
      description: 'Blog posts to show in homepage preview',
    }),
    defineField({
      name: 'featuredVideos',
      title: 'Featured Videos Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {name: 'subtitle', title: 'Section Subtitle', type: 'text'},
        {
          name: 'videos',
          title: 'YouTube Videos',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'url',
                  title: 'YouTube URL',
                  type: 'url',
                  validation: (Rule) => Rule.uri({scheme: ['http', 'https']})
                },
                {
                  name: 'title',
                  title: 'Video Title (optional)',
                  type: 'string'
                }
              ],
               preview: {
                select: {
                  title: 'title',
                  subtitle: 'url'
                }
              }
            }
          ]
        },
      ],
    }),
    defineField({
      name: 'recentPosts',
      title: 'Recent Posts Section',
      type: 'object',
      fields: [
        {name: 'title', title: 'Section Title', type: 'string'},
        {name: 'eyebrow', title: 'Eyebrow Text', type: 'string'},
        {
          name: 'featuredPost',
          title: 'Main Featured Post',
          type: 'reference',
          to: [{type: 'blogPost'}]
        },
      ],
    }),
    defineField({
      name: 'formsContent',
      title: 'Forms Content',
      type: 'object',
      fields: [
        {
          name: 'contactForm',
          title: 'Contact Form',
          type: 'object',
          fields: [
            {name: 'title', title: 'Form Title', type: 'string'},
            {name: 'description', title: 'Form Description', type: 'text'},
            {name: 'successMessage', title: 'Success Message', type: 'text'},
            {name: 'errorMessage', title: 'Error Message', type: 'text'},
          ],
        },
        {
          name: 'valuationForm',
          title: 'Valuation Form',
          type: 'object',
          fields: [
            {name: 'title', title: 'Form Title', type: 'string'},
            {name: 'description', title: 'Form Description', type: 'text'},
            {name: 'successMessage', title: 'Success Message', type: 'text'},
            {name: 'errorMessage', title: 'Error Message', type: 'text'},
          ],
        },
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