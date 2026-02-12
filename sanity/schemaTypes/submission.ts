import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'submission',
  title: 'Form Submissions',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string', // Not strictly validating as email here to allow flexible input if needed, but string is standard
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'preferredDate',
      title: 'Preferred Date',
      type: 'date',
    }),
    defineField({
      name: 'preferredTime',
      title: 'Preferred Time',
      type: 'string',
    }),
    defineField({
      name: 'propertyOfInterest',
      title: 'Property of Interest',
      type: 'string', // Storing name/ID as string since references might be complex if properties are not all in Sanity yet
    }),
    defineField({
      name: 'message',
      title: 'Message / Remarks',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Consultation Modal', value: 'consultation-modal' },
          { title: 'Work With Ahmad', value: 'work-with-ahmad' },
          { title: 'Parallax Form', value: 'parallax-form' },
          { title: 'Newsletter', value: 'newsletter' },
        ],
      },
    }),
    defineField({
      name: 'ipAddress',
      title: 'IP Address',
      type: 'string',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Closed', value: 'closed' },
        ],
      },
      initialValue: 'new',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'source',
    },
  },
})
