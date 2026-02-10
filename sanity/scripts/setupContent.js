/**
 * Simple Setup Script for Sanity Content
 * 
 * Run with: node scripts/setupContent.js
 * Make sure Sanity Studio is running first: npm run dev
 */

/* eslint-env node */
/* global process */

// Import Sanity client with error handling
let createClient;
try {
  createClient = require('sanity').createClient;
} catch (error) {
  console.error('❌ Failed to import Sanity client:', error instanceof Error ? error.message : String(error));
  console.error('Make sure you are running this from the sanity directory and dependencies are installed');
  process.exit(1);
}

// Create write client
let writeClient;
try {
  writeClient = createClient({
    projectId: 'xwla8vtz', // Your project ID
    dataset: 'production',
    apiVersion: '2024-02-06',
    useCdn: false,
    token: process.env.SANITY_API_TOKEN, // Set this environment variable
  });
} catch (error) {
  console.error('❌ Failed to create Sanity client:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

/**
 * Create initial site settings
 */
async function createSiteSettings() {
  console.log('⚙️ Creating site settings...');
  
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
  };

  try {
    const result = await writeClient.createOrReplace(siteSettings);
    console.log('✅ Created site settings');
    return result;
  } catch (error) {
    console.error('❌ Error creating site settings:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Create sample property for testing
 */
async function createSampleProperty() {
  console.log('🏠 Creating sample property...');
  
  const sampleProperty = {
    _type: 'property',
    title: 'Luxury Villa in Emirates Hills',
    slug: {
      _type: 'slug',
      current: 'luxury-villa-emirates-hills'
    },
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
  };

  try {
    const result = await writeClient.create(sampleProperty);
    console.log('✅ Created sample property');
    return result;
  } catch (error) {
    console.error('❌ Error creating sample property:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Create sample blog post
 */
async function createSampleBlogPost() {
  console.log('📝 Creating sample blog post...');
  
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
  };

  try {
    const result = await writeClient.create(sampleBlog);
    console.log('✅ Created sample blog post');
    return result;
  } catch (error) {
    console.error('❌ Error creating sample blog post:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Run setup
 */
async function setupContent() {
  console.log('🚀 Setting up initial Sanity content...');
  
  // Validate client is available
  if (!writeClient) {
    console.error('❌ Sanity client not available');
    process.exit(1);
  }
  
  // Check if we can connect to Sanity
  try {
    console.log('🔗 Testing Sanity connection...');
    await writeClient.fetch('count(*)');
    console.log('✅ Connected to Sanity successfully');
  } catch (error) {
    console.error('❌ Failed to connect to Sanity:', error instanceof Error ? error.message : String(error));
    console.error('Make sure Sanity Studio is running and your project ID is correct');
    process.exit(1);
  }
  
  try {
    await createSiteSettings();
    await createSampleProperty();
    await createSampleBlogPost();
    
    console.log('🎉 Setup completed successfully!');
    console.log('Visit http://localhost:3333 to see your Sanity Studio with sample content');
  } catch (error) {
    console.error('💥 Setup failed:', error instanceof Error ? error.message : String(error));
    console.error('Make sure you have proper permissions and all required fields are provided');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  setupContent();
}

module.exports = {
  createSiteSettings,
  createSampleProperty, 
  createSampleBlogPost,
  setupContent,
};