const client = require('./lib/sanityClientWrite');

async function publishHomePage() {
  try {
    console.log('🚀 Publishing draft homePage...');
    
    // Get the draft
    const draft = await client.getDocument('drafts.homePage');
    if (!draft) {
      console.log('❌ No draft homePage found');
      return;
    }
    
    console.log('📝 Found draft with testimonialsSection:', !!draft.testimonialsSection);
    
    // Create published version
    const published = {
      ...draft,
      _id: 'homePage'
    };
    
    // Replace published version
    await client.createOrReplace(published);
    console.log('✅ Published homePage');
    
    // Delete draft
    await client.delete('drafts.homePage');
    console.log('🗑️ Deleted draft');
    
    console.log('🎯 testimonialsSection is now live!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

publishHomePage();