import writeClient from '../lib/sanityClientWrite.js';
import readClient from '../lib/sanityClientRead.js';

async function moveAboutToHomePage() {
  console.log('🔄 Moving About section data to homePage.aboutCarousel...\n');

  try {
    // First, get the separate aboutSection document we created
    const aboutSection = await readClient.fetch('*[_type == "aboutSection"][0]');
    
    if (!aboutSection) {
      console.log('❌ No separate aboutSection found to move');
      return;
    }

    console.log('📦 Found aboutSection with', aboutSection.slides?.length || 0, 'slides');

    // Transform the data to match the homePage aboutCarousel schema
    const aboutCarouselData = {
      slides: aboutSection.slides.map(slide => ({
        title: slide.title,
        description: slide.description,
        image: slide.backgroundImage,  // This has the asset reference
        cta: slide.buttonText,
        // Note: We're losing buttonLink, subtitle, isActive, slideIndex 
        // because the homepage schema doesn't have these fields
      }))
    };

    // Update the homePage document with the about carousel data
    const updated = await writeClient
      .patch('homePage')
      .set({ aboutCarousel: aboutCarouselData })
      .commit();

    console.log('✅ Updated homePage.aboutCarousel with', aboutCarouselData.slides.length, 'slides');

    // Verify the update
    const verification = await readClient.fetch('*[_type == "homePage"][0].aboutCarousel');
    console.log('\n🎯 Verification:');
    console.log('   aboutCarousel exists:', !!verification);
    console.log('   Slides count:', verification?.slides?.length || 0);
    
    verification?.slides?.forEach((slide, idx) => {
      console.log(`   Slide ${idx + 1}: "${slide.title}" - CTA: "${slide.cta}"`);
      console.log(`     Has Image: ${slide.image ? '✅' : '❌'}`);
    });

    // Optional: Remove the separate aboutSection document
    console.log('\n🗑️  Cleaning up separate aboutSection document...');
    await writeClient.delete('aboutSection');
    console.log('✅ Removed separate aboutSection document');

  } catch (error) {
    console.error('💥 Error moving about data:', error);
  }
}

moveAboutToHomePage().catch(console.error);