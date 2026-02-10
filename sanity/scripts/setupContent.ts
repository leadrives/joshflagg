/**
 * Simple Migration Script for Josh Flagg Real Estate
 * 
 * This script helps migrate existing JSON data to Sanity CMS
 * Make sure to set SANITY_API_TOKEN environment variable
 */

import { writeClient } from '../lib/sanityClient'

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
    throw error
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
    throw error
  }
}

/**
 * Create sample property
 */
async function createSampleProperty() {
  console.log('🏠 Creating sample property...')
  
  const sampleProperty = {
    _type: 'property',
    title: 'Luxury Villa in Emirates Hills',
    price: 'AED 25,000,000',
    priceNumeric: 25000000,
    location: 'Emirates Hills, Dubai',
    propertyType: 'villa',
    bedrooms: 6,
    bathrooms: 8,
    area: 12000,
    description: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Stunning luxury villa offering panoramic views of Emirates Golf Course. This exceptional property features premium finishes, spacious living areas, and world-class amenities.',
          },
        ],
      },
    ],
    features: [
      'Private Swimming Pool',
      'Golf Course Views',
      'Premium Finishes',
      'Home Theater',
      'Wine Cellar',
      'Maid\'s Room',
    ],
    status: 'for-sale',
    developer: 'Emaar Properties',
    isFeatured: true,
    isExclusive: true,
    publishedAt: new Date().toISOString(),
    seoTitle: 'Luxury Villa in Emirates Hills - Josh Flagg Real Estate',
    seoDescription: 'Stunning luxury villa in Emirates Hills with golf course views. 6 bedrooms, 8 bathrooms, private pool. Contact Josh Flagg for exclusive viewing.',
  }

  try {
    const result = await writeClient.create(sampleProperty)
    console.log('✅ Created sample property')
    return result
  } catch (error) {
    console.error('❌ Error creating sample property:', error)
    throw error
  }
}

/**
 * Create sample blog post
 */
async function createSampleBlogPost() {
  console.log('📝 Creating sample blog post...')
  
  const sampleBlog = {
    _type: 'blogPost',
    title: 'Dubai Real Estate Market 2026: Investment Outlook',
    slug: {
      _type: 'slug',
      current: 'dubai-real-estate-market-2026-investment-outlook'
    },
    excerpt: 'Explore the latest trends and investment opportunities in Dubai\'s thriving real estate market for 2026.',
    content: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Dubai\'s real estate market continues to show remarkable resilience and growth potential in 2026. With new government initiatives, world-class infrastructure developments, and increasing foreign investment, the emirate remains a top destination for property investors worldwide.',
          },
        ],
      },
      {
        _type: 'block',
        style: 'h2',
        children: [
          {
            _type: 'span',
            text: 'Key Market Drivers',
          },
        ],
      },
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Several factors are driving the current market momentum, including the upcoming World Expo legacy projects, new visa regulations, and continued economic diversification efforts.',
          },
        ],
      },
    ],
    author: {
      name: 'Josh Flagg',
      bio: 'Dubai Real Estate Expert and Investment Advisor',
    },
    categories: ['market-analysis', 'dubai-real-estate'],
    tags: ['Dubai', 'Investment', 'Market Trends', '2026'],
    readingTime: 8,
    isPublished: true,
    isFeatured: true,
    publishedAt: new Date().toISOString(),
    seoTitle: 'Dubai Real Estate Market 2026: Complete Investment Guide',
    seoDescription: 'Expert analysis of Dubai\'s real estate market for 2026. Investment opportunities, market trends, and professional insights from Josh Flagg.',
  }

  try {
    const result = await writeClient.create(sampleBlog)
    console.log('✅ Created sample blog post')
    return result
  } catch (error) {
    console.error('❌ Error creating sample blog post:', error)
    throw error
  }
}

/**
 * Run initial content setup
 */
export async function setupInitialContent() {
  console.log('🚀 Setting up initial Sanity content...')
  
  try {
    await createSiteSettings()
    await createHomepageSettings()
    await createSampleProperty()
    await createSampleBlogPost()
    
    console.log('🎉 Initial content setup completed successfully!')
    console.log('Visit http://localhost:3333 to see your Sanity Studio with sample content')
  } catch (error) {
    console.error('💥 Setup failed:', error)
    console.error('Make sure you have set the SANITY_API_TOKEN environment variable')
    process.exit(1)
  }
}

// Export individual functions
export {
  createSiteSettings,
  createHomepageSettings,
  createSampleProperty,
  createSampleBlogPost,
}