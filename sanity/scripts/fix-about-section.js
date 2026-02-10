import writeClient from '../lib/sanityClientWrite.js';

async function fixAboutSectionIssues() {
  console.log('🔧 Fixing About section issues...\n');

  try {
    // Fix the button link for slide 3 to match HTML
    console.log('📝 Fixing Slide 3 button link...');
    
    const updated = await writeClient
      .patch('aboutSection')
      .set({
        'slides[2].buttonLink': '#consultationModal'
      })
      .commit();
    
    console.log('✅ Updated Slide 3 button link to "#consultationModal"');

    // Verify the fix
    const aboutSection = await writeClient.fetch('*[_type == "aboutSection"][0].slides[2]{ buttonText, buttonLink }');
    console.log('🎯 Slide 3 button status:');
    console.log(`   Button Text: "${aboutSection.buttonText}"`);
    console.log(`   Button Link: "${aboutSection.buttonLink}"`);

  } catch (error) {
    console.error('💥 Error fixing About section:', error);
  }
}

fixAboutSectionIssues().catch(console.error);