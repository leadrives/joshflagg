import {defineField, defineType} from 'sanity'

export const neighborhood = defineType({
  name: 'neighborhood',
  title: 'Neighborhood/Community',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Neighborhood Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: (Rule) => Rule.required(),
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
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
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
      name: 'gallery',
      title: 'Image Gallery',
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
      name: 'location',
      title: 'Location Details',
      type: 'object',
      fields: [
        {name: 'area', title: 'Area/District', type: 'string'},
        {name: 'city', title: 'City', type: 'string', initialValue: 'Dubai'},
        {name: 'country', title: 'Country', type: 'string', initialValue: 'UAE'},
        {
          name: 'coordinates',
          title: 'Coordinates',
          type: 'geopoint',
          description: 'Add map coordinates for this neighborhood',
        },
      ],
    }),
    defineField({
      name: 'amenities',
      title: 'Amenities & Features',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'priceRange',
      title: 'Typical Price Range',
      type: 'object',
      fields: [
        {name: 'min', title: 'Minimum Price (AED)', type: 'number'},
        {name: 'max', title: 'Maximum Price (AED)', type: 'number'},
        {name: 'currency', title: 'Currency', type: 'string', initialValue: 'AED'},
      ],
    }),
    defineField({
      name: 'nearbySchools',
      title: 'Nearby Schools',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'name', title: 'School Name', type: 'string'},
            {name: 'distance', title: 'Distance (km)', type: 'number'},
            {name: 'rating', title: 'Rating', type: 'string'},
          ],
        },
      ],
    }),
    defineField({
      name: 'transportation',
      title: 'Transportation & Accessibility',
      type: 'object',
      fields: [
        {name: 'metroStations', title: 'Nearby Metro Stations', type: 'array', of: [{type: 'string'}]},
        {name: 'busRoutes', title: 'Bus Routes', type: 'array', of: [{type: 'string'}]},
        {name: 'airportDistance', title: 'Distance to Airport (km)', type: 'number'},
        {name: 'downtownDistance', title: 'Distance to Downtown (km)', type: 'number'},
      ],
    }),
    defineField({
      name: 'developer',
      title: 'Primary Developer',
      type: 'string',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Neighborhood',
      type: 'boolean',
      initialValue: false,
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
  ],
  preview: {
    select: {
      title: 'name',
      location: 'location.area',
      image: 'featuredImage',
    },
    prepare(selection) {
      const {title, location, image} = selection
      return {
        title,
        subtitle: location || 'Dubai',
        media: image,
      }
    },
  },
})