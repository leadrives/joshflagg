const fs = require('fs');
const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-02-06',
  token: process.env.SANITY_WRITE_TOKEN
});

async function publish() {
  try {
    // Read the prepared published document
    const publishedDoc = JSON.parse(fs.readFileSync('published-homepage.json', 'utf8'));
    
    console.log('🚀 Publishing homePage with testimonialsSection...');
    console.log('📝 Has testimonialsSection:', !!publishedDoc.testimonialsSection);
    
    // Create or replace published document
    await client.createOrReplace(publishedDoc);
    console.log('✅ Published homePage');
    
    // Delete draft
    await client.delete('drafts.homePage');
    console.log('🗑️ Deleted draft');
    
    console.log('🎯 testimonialsSection is now live!');
    
    // Clean up temp files
    fs.unlinkSync('temp-homepage.json');
    fs.unlinkSync('published-homepage.json');
    console.log('🧹 Cleaned up temp files');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

publish();