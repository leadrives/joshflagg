/**
 * Data Migration Helper for Josh Flagg Real Estate
 * 
 * This script helps migrate existing JSON data to Sanity CMS
 * Run this script after setting up your Sanity project
 */

import { writeClient } from '../lib/sanityClient'
import { readFileSync } from 'fs'
import { join } from 'path'

// Helper function to read JSON files
function readJSONFile(filePath: string) {
  try {
    // Use relative path from project root instead of __dirname
    const fullPath = join(process.cwd(), filePath)
    const content = readFileSync(fullPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.warn(`Could not read ${filePath}:`, (error as Error).message)
    return []
  }
}

const propertiesData = readJSONFile('assets/data/properties.json')
const blogsData = readJSONFile('assets/data/blogs.json')

/**
 * Migrate properties from existing JSON to Sanity
 */
async function migrateProperties() {
  console.log('🏠 Migrating properties...')
  
  // Check if property data exists and is valid
  if (!Array.isArray(propertiesData) || propertiesData.length === 0) {
    console.warn('⚠️ No property data found or invalid format. Skipping property migration.')
    return []
  }
  
  const properties = propertiesData.map((property: any, index: number) => ({
    _type: 'property',
    title: property.name || `Property ${index + 1}`,
    slug: {
      _type: 'slug',
      current: property.slug || `property-${index + 1}`
    },
    price: property.price || 'Price on request',
    priceNumeric: parseFloat(property.price?.replace(/[^\d.-]/g, '')) || 0,
    location: property.location || 'Dubai, UAE',
    propertyType: property.type?.toLowerCase() || 'apartment',
    bedrooms: property.bedrooms || null,
    bathrooms: property.bathrooms || null,
    area: property.area || null,
    description: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: property.description || 'No description available',
          },
        ],
      },
    ],
    features: property.features || [],
    status: 'for-sale',
    developer: property.developer || '',
    isFeatured: index < 6, // Mark first 6 as featured
    isExclusive: property.exclusive || false,
    publishedAt: new Date().toISOString(),
    seoTitle: property.name || `Property ${index + 1}`,
    seoDescription: property.description?.substring(0, 160),
  }))

  try {
    const results = []
    for (const property of properties) {
      const result = await writeClient.create(property)
      results.push(result)
    }
    console.log(`✅ Migrated ${properties.length} properties`)
    return results
  } catch (error) {
    console.error('❌ Error migrating properties:', error)
  }
}

/**
 * Migrate blog posts from existing data to Sanity
 */
async function migrateBlogPosts() {
  console.log('📝 Migrating blog posts...')
  
  // Check if blog data exists and is valid
  if (!Array.isArray(blogsData) || blogsData.length === 0) {
    console.warn('⚠️ No blog data found or invalid format. Skipping blog migration.')
    return []
  }
  
  const blogPosts = blogsData.map((blog: any, index: number) => ({
    _type: 'blogPost',
    title: blog.title || `Blog Post ${index + 1}`,
    slug: {
      _type: 'slug',
      current: blog.slug || `blog-post-${index + 1}`
    },
    excerpt: blog.excerpt || blog.description?.substring(0, 200) || 'No excerpt available',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: blog.content || blog.description || 'No content available',
          },
        ],
      },
    ],
    author: {
      name: blog.author || 'Josh Flagg',
      bio: 'Real Estate Expert in Dubai',
    },
    categories: blog.categories || ['dubai-real-estate'],
    tags: blog.tags || [],
    readingTime: blog.readingTime || 5,
    isPublished: true,
    isFeatured: index < 3, // Mark first 3 as featured
    publishedAt: blog.date || new Date().toISOString(),
    seoTitle: blog.title || `Blog Post ${index + 1}`,
    seoDescription: (blog.excerpt || blog.description || '')?.substring(0, 160),
  }))

  try {
    const results = []
    for (const blogPost of blogPosts) {
      const result = await writeClient.create(blogPost)
      results.push(result)
    }
    console.log(`✅ Migrated ${blogPosts.length} blog posts`)
    return results
  } catch (error) {
    console.error('❌ Error migrating blog posts:', error)
  }
}

/**
 * Create initial site settings
 */
async function createSiteSettings() {
  console.log('⚙️ Creating site settings...')
  
  const siteSettings = {
    _type: 'siteSettings',
    _id: 'siteSettings',
    title: 'Josh Flagg Real Estate - Dubai Property Expert',
    description: 'Premier real estate services in Dubai, offering exclusive properties, market insights, and investment opportunities.',
    keywords: [
      'Dubai Real Estate',
      'Property Investment',
      'Villa Sales Dubai',
      'Dubai Apartments',
      'Real Estate Expert',
      'Josh Flagg',
    ],
    socialMedia: {
      instagram: 'https://instagram.com/joshflagg',
      linkedin: 'https://linkedin.com/in/joshflagg',
      twitter: 'https://twitter.com/joshflagg',
      youtube: 'https://youtube.com/@joshflagg',
    },
    contactInfo: {
      phone: '+971 50 XXX XXXX',
      email: 'hello@joshflagg.ae',
      address: 'Dubai, United Arab Emirates',
      whatsapp: '+971 50 XXX XXXX',
    },
  }

  try {
    const result = await writeClient.createOrReplace(siteSettings)
    console.log('✅ Created site settings')
    return result
  } catch (error) {
    console.error('❌ Error creating site settings:', error)
  }
}

/**
 * Create initial homepage settings
 */
async function createHomepageSettings() {
  console.log('🏠 Creating homepage settings...')
  
  const homePage = {
    _type: 'homePage',
    _id: 'homePage',
    title: 'Homepage',
    heroSection: {
      title: 'Premium Real Estate in Dubai',
      subtitle: 'Discover exclusive properties and investment opportunities with Dubai\'s leading real estate expert.',
      ctaText: 'Explore Properties',
      ctaLink: '#featured-properties',
    },
    featuredProperties: {
      title: 'Featured Properties',
      subtitle: 'Handpicked exclusive listings in Dubai\'s most sought-after locations.',
    },
    notableTransactions: {
      title: 'Notable Transactions',
      subtitle: 'Recent successful sales and record-breaking deals.',
    },
    exclusiveListings: {
      title: 'Exclusive Listings',
      subtitle: 'Discover properties available nowhere else.',
    },
    aboutSection: {
      title: 'Dubai Real Estate Expertise',
    },
    blogSection: {
      title: 'Market Insights',
      subtitle: 'Latest trends and analysis in Dubai\'s real estate market.',
    },
    trustedPartners: {
      title: 'Trusted Partners',
    },
    seoSettings: {
      metaTitle: 'Josh Flagg Real Estate - Dubai Property Expert',
      metaDescription: 'Premier real estate services in Dubai. Find exclusive properties, get market insights, and work with Dubai\'s leading property expert.',
      keywords: ['Dubai Real Estate', 'Property Expert', 'Villa Sales', 'Investment'],
    },
  }

  try {
    const result = await writeClient.createOrReplace(homePage)
    console.log('✅ Created homepage settings')
    return result
  } catch (error) {
    console.error('❌ Error creating homepage settings:', error)
  }
}

/**
 * Run all migrations
 */
async function runMigrations() {
  console.log('🚀 Starting data migration...')
  
  try {
    await createSiteSettings()
    await createHomepageSettings()
    await migrateProperties()
    await migrateBlogPosts()
    
    console.log('🎉 All migrations completed successfully!')
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  }
}

// Export functions for use in other modules
export {
  migrateProperties,
  migrateBlogPosts,
  createSiteSettings,
  createHomepageSettings,
  runMigrations,
}