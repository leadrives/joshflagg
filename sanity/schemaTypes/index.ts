import {blogPost} from './blogPost'
import {brandPartner} from './brandPartner'
import submission from './submission'
import {homePage} from './homePage'
import {neighborhood} from './neighborhood'
import {property} from './property'
import {siteSettings} from './siteSettings'
import {testimonial} from './testimonial'

export const schemaTypes = [
  // Site configuration
  siteSettings,
  homePage,
  
  // Content types
  neighborhood,
  property,
  blogPost,
  testimonial,
  brandPartner,
  submission,
]
