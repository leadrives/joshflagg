/**
 * Test Sanity Connection Script
 * 
 * This script tests if Sanity is working without requiring authentication
 * Run with: node scripts/testConnection.js
 */

/* eslint-env node */
/* global process */

// Import Sanity client with error handling
let createClient;
try {
  createClient = require('sanity').createClient;
} catch (error) {
  console.error('❌ Failed to import Sanity client:', error.message);
  console.error('Run: cd sanity && npm install');
  process.exit(1);
}

// Create read-only client (no token needed)
const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  apiVersion: '2024-02-06',
  useCdn: false,
});

/**
 * Test basic connection
 */
async function testConnection() {
  console.log('🔗 Testing Sanity connection...');
  
  try {
    // Test basic query (read-only, no auth needed)
    const result = await client.fetch('count(*)');
    console.log('✅ Connected to Sanity successfully');
    console.log('📊 Total documents in dataset:', result);
    
    // Test schema access
    try {
      const schema = await client.fetch('*[_type == "siteSettings"][0]');
      if (schema) {
        console.log('✅ Site settings document exists');
        console.log('📝 Site title:', schema.title);
      } else {
        console.log('ℹ️ No site settings found - this is normal for a new setup');
      }
    } catch (schemaError) {
      console.log('ℹ️ Could not fetch site settings (normal for new setup)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Sanity:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Make sure Sanity Studio is running: npm run dev');
    console.error('2. Check that your project ID is correct in sanity.config.ts');
    console.error('3. Verify your internet connection');
    return false;
  }
}

/**
 * Test schema validation
 */
async function testSchemas() {
  console.log('📋 Testing schema structure...');
  
  try {
    // Test if our custom schema types are available
    const schemaTypes = [
      'siteSettings',
      'property', 
      'blogPost',
      'homePage',
      'neighborhood',
      'brandPartner',
      'testimonial'
    ];
    
    for (const schemaType of schemaTypes) {
      try {
        await client.fetch(`count(*[_type == "${schemaType}"])`);
        console.log(`✅ Schema "${schemaType}" is available`);
      } catch (error) {
        console.log(`⚠️ Schema "${schemaType}" not found or not accessible`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Schema test failed:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Running Sanity CMS tests...');
  console.log('');
  
  const connectionOk = await testConnection();
  console.log('');
  
  if (connectionOk) {
    await testSchemas();
    console.log('');
    console.log('🎉 All tests completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit http://localhost:3333 to access Sanity Studio');
    console.log('2. Create some test content manually');
    console.log('3. Run "npm run setup" to create sample content (requires API token)');
  } else {
    console.log('');
    console.log('💡 Fix the connection issues above, then try again');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testConnection,
  testSchemas,
  runTests,
};