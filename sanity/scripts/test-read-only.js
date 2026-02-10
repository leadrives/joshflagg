import readClient from '../lib/sanityClientRead.js';

async function testReadOnlyConnection() {
  console.log('🔍 Testing Sanity read-only connection...');
  
  try {
    // Test basic connectivity without token
    const currentProject = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const currentDataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    
    console.log(`📋 Project: ${currentProject}`);
    console.log(`🗃️  Dataset: ${currentDataset}`);
    
    // Test read access
    const testQuery = '*[_type == "property"] | order(_createdAt desc) [0..2] { _id, legacyId, listingType }';
    const properties = await readClient.fetch(testQuery);
    
    console.log(`🏠 Found ${properties.length} existing properties`);
    properties.forEach(prop => {
      console.log(`   - ${prop.legacyId || 'no-legacy-id'} (${prop.listingType || 'unknown'})`);
    });
    
    console.log('✅ Read-only connection test passed!');
    console.log('💡 To run imports, add SANITY_WRITE_TOKEN to your .env file');
    console.log(`   Get token from: https://manage.sanity.io/projects/${currentProject}/settings/tokens`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('💡 Check your network connection and project ID');
    } else if (error.message.includes('401')) {
      console.error('💡 Project may be private - add SANITY_WRITE_TOKEN to .env');
    }
  }
}

// Run test
testReadOnlyConnection();