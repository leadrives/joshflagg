import {defineField, defineType} from 'sanity'

export const property = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Property Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priceNumeric',
      title: 'Price (Numeric for sorting)',
      type: 'number',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'propertyType',
      title: 'Property Type',
      type: 'string',
      options: {
        list: [
          {title: 'Villa', value: 'villa'},
          {title: 'Apartment', value: 'apartment'},
          {title: 'Penthouse', value: 'penthouse'},
          {title: 'Townhouse', value: 'townhouse'},
          {title: 'Plot', value: 'plot'},
        ],
      },
    }),
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
    }),
    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
    }),
    defineField({
      name: 'area',
      title: 'Area (sqft)',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'images',
      title: 'Property Images',
      type: 'array',
      of: [
        {
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
            {
              name: 'caption',
              title: 'Caption',
              type: 'string',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
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
    }),
    defineField({
      name: 'status',
      title: 'Property Status',
      type: 'string',
      options: {
        list: [
          {title: 'For Sale', value: 'for-sale'},
          {title: 'Sold', value: 'sold'},
          {title: 'Under Offer', value: 'under-offer'},
          {title: 'Coming Soon', value: 'coming-soon'},
        ],
      },
      initialValue: 'for-sale',
    }),
    defineField({
      name: 'developer',
      title: 'Developer',
      type: 'string',
    }),
    defineField({
      name: 'community',
      title: 'Community',
      type: 'reference',
      to: [{type: 'neighborhood'}],
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Property',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isExclusive',
      title: 'Exclusive Listing',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'completionDate',
      title: 'Completion Date',
      type: 'date',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      location: 'location',
      image: 'heroImage',
    },
    prepare(selection) {
      const {title, price, location, image} = selection
      return {
        title,
        subtitle: `${price} - ${location}`,
        media: image,
      }
    },
  },
})