/**
 * Data Migration Helper for Josh Flagg Real Estate
 * 
 * This script helps migrate existing JSON data to Sanity CMS
 * Run this script after setting up your Sanity project
 */

import { writeClient } from '../lib/sanityClient'
import propertiesData from '../../assets/data/properties.json'
import blogsData from '../../assets/data/blogs.json'

/**
 * Migrate properties from existing JSON to Sanity
 */
async function migrateProperties() {
  console.log('🏠 Migrating properties...')
  
  const properties = propertiesData.map((property, index) => ({
    _type: 'property',
    title: property.name,
    price: property.price,
    priceNumeric: parseFloat(property.price.replace(/[^\d.-]/g, '')) || 0,
    location: property.location,
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
            text: property.description || '',
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
    seoTitle: property.name,
    seoDescription: property.description?.substring(0, 160),
  }))

  try {
    const result = await writeClient.createOrReplace(properties)
    console.log(`✅ Migrated ${properties.length} properties`)
    return result
  } catch (error) {
    console.error('❌ Error migrating properties:', error)
  }
}

/**
 * Migrate blog posts from existing data to Sanity
 */
async function migrateBlogPosts() {
  console.log('📝 Migrating blog posts...')
  
  const blogPosts = blogsData.map((blog, index) => ({
    _type: 'blogPost',
    title: blog.title,
    excerpt: blog.excerpt || blog.description?.substring(0, 200),
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: blog.content || blog.description || '',
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
    seoTitle: blog.title,
    seoDescription: blog.excerpt?.substring(0, 160),
  }))

  try {
    const result = await writeClient.createOrReplace(blogPosts)
    console.log(`✅ Migrated ${blogPosts.length} blog posts`)
    return result
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

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
}

export {
  migrateProperties,
  migrateBlogPosts,
  createSiteSettings,
  createHomepageSettings,
  runMigrations,
}