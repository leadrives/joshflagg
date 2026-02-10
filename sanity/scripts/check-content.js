import readClient from '../lib/sanityClientRead.js';

async function checkContent() {
  try {
    console.log('🔍 Checking current Sanity content...\n');
    
    // Check homePage document
    const homePage = await readClient.fetch('*[_type == "homePage"][0]');
    console.log('📄 HomePage document:', homePage ? '✅ EXISTS' : '❌ NOT FOUND');
    
    if (homePage && homePage.heroSection) {
      console.log('\n🎯 HERO SECTION DATA:');
      console.log('   Subtitle:', homePage.heroSection.subtitle);
      console.log('   Title:', homePage.heroSection.title.replace(/\\n/g, ' | '));
      console.log('   Primary Button:', homePage.heroSection.primaryButtonText);
      console.log('   Secondary Button:', homePage.heroSection.secondaryButtonText);
      console.log('   Media Type:', homePage.heroSection.mediaType);
      console.log('   Video URL:', homePage.heroSection.videoUrl);
      console.log('   Poster Image:', homePage.heroSection.posterImage ? '✅ Has image' : '❌ No image');
    }
    
    // Check properties
    const properties = await readClient.fetch('*[_type == "property"] | order(_createdAt desc) [0..5] { _id, legacyId, listingType, title, priceDisplay }');
    console.log('\n🏠 PROPERTIES (' + properties.length + ' total):');
    properties.forEach(prop => {
      console.log(`   - ${prop.legacyId}: ${prop.title} (${prop.listingType}) - ${prop.priceDisplay} AED`);
    });
    
    // Check blogs
    const blogs = await readClient.fetch('*[_type == "blogPost"] | order(_createdAt desc) [0..5] { _id, legacyId, title }');
    console.log('\n📝 BLOG POSTS (' + blogs.length + ' total):');
    blogs.forEach(blog => {
      console.log(`   - ${blog.legacyId}: ${blog.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking content:', error.message);
  }
}

checkContent();