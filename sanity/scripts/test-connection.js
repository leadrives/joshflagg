import writeClient from '../lib/sanityClientWrite.js';

async function testConnection() {
  console.log('🔍 Testing Sanity connection...');
  
  try {
    // Test basic connectivity
    const projects = await writeClient.projects.list();
    console.log('✅ Successfully connected to Sanity');
    
    // Test current project access
    const currentProject = writeClient.config().projectId;
    const currentDataset = writeClient.config().dataset;
    
    console.log(`📋 Project: ${currentProject}`);
    console.log(`🗃️  Dataset: ${currentDataset}`);
    
    // Test write permissions
    const testQuery = '*[_type == "property"] | order(_createdAt desc) [0..2] { _id, legacyId, listingType }';
    const properties = await writeClient.fetch(testQuery);
    
    console.log(`🏠 Found ${properties.length} existing properties`);
    properties.forEach(prop => {
      console.log(`   - ${prop.legacyId} (${prop.listingType})`);
    });
    
    console.log('🎉 Connection test passed!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('401')) {
      console.error('💡 Check your SANITY_WRITE_TOKEN in .env file');
    } else if (error.message.includes('fetch')) {
      console.error('💡 Check your network connection and project ID');
    }
    
    process.exit(1);
  }
}

// Run test
testConnection();