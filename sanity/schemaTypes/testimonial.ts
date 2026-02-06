import {defineField, defineType} from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'Client Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clientTitle',
      title: 'Client Title/Role',
      type: 'string',
    }),
    defineField({
      name: 'clientImage',
      title: 'Client Photo',
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
      name: 'testimonialText',
      title: 'Testimonial Text',
      type: 'text',
      validation: (Rule) => Rule.required().min(50).max(500),
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5),
      options: {
        list: [
          {title: '1 Star', value: 1},
          {title: '2 Stars', value: 2},
          {title: '3 Stars', value: 3},
          {title: '4 Stars', value: 4},
          {title: '5 Stars', value: 5},
        ],
      },
    }),
    defineField({
      name: 'propertyDetails',
      title: 'Related Property Details',
      type: 'object',
      fields: [
        {name: 'propertyName', title: 'Property Name', type: 'string'},
        {name: 'propertyType', title: 'Property Type', type: 'string'},
        {name: 'location', title: 'Location', type: 'string'},
        {name: 'transactionType', title: 'Transaction Type', type: 'string', options: {
          list: [
            {title: 'Sale', value: 'sale'},
            {title: 'Purchase', value: 'purchase'},
            {title: 'Rental', value: 'rental'},
            {title: 'Investment', value: 'investment'},
          ],
        }},
        {name: 'completionDate', title: 'Completion Date', type: 'date'},
      ],
    }),
    defineField({
      name: 'serviceType',
      title: 'Service Type',
      type: 'string',
      options: {
        list: [
          {title: 'Property Sale', value: 'sale'},
          {title: 'Property Purchase', value: 'purchase'},
          {title: 'Property Rental', value: 'rental'},
          {title: 'Investment Consultation', value: 'investment'},
          {title: 'Market Analysis', value: 'analysis'},
          {title: 'General Consultation', value: 'consultation'},
        ],
      },
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Testimonial',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'dateSubmitted',
      title: 'Date Submitted',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'Website Form', value: 'website'},
          {title: 'Google Reviews', value: 'google'},
          {title: 'Email', value: 'email'},
          {title: 'Phone Interview', value: 'phone'},
          {title: 'In Person', value: 'in-person'},
          {title: 'Social Media', value: 'social'},
        ],
      },
    }),
  ],
  preview: {
    select: {
      clientName: 'clientName',
      testimonialText: 'testimonialText',
      rating: 'rating',
      image: 'clientImage',
      isPublished: 'isPublished',
    },
    prepare(selection) {
      const {clientName, testimonialText, rating, image, isPublished} = selection
      const excerpt = testimonialText?.length > 60 
        ? testimonialText.substring(0, 60) + '...' 
        : testimonialText
      return {
        title: clientName,
        subtitle: `${rating ? `${rating}★ - ` : ''}${excerpt} ${isPublished ? '(Published)' : '(Draft)'}`,
        media: image,
      }
    },
  },
  orderings: [
    {
      title: 'Date Submitted (newest first)',
      name: 'dateSubmittedDesc',
      by: [{field: 'dateSubmitted', direction: 'desc'}],
    },
    {
      title: 'Rating (highest first)',
      name: 'ratingDesc',
      by: [{field: 'rating', direction: 'desc'}],
    },
  ],
})