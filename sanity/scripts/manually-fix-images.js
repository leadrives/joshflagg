import writeClient from '../lib/sanityClientWrite.js';

async function manuallyFixImages() {
  console.log('🔧 Manually fixing About section images...\n');

  try {
    // Get the image asset IDs
    const imageAssets = await writeClient.fetch(`
      *[_type == "sanity.imageAsset" && originalFilename match "your-image*"] | order(originalFilename) {
        _id,
        originalFilename
      }
    `);
    
    console.log('Found image assets:', imageAssets);

    if (imageAssets.length >= 2) {
      // Get current about section
      const aboutSection = await writeClient.fetch('*[_type == "aboutSection"][0]');
      
      // Update slides with images
      const updatedSlides = aboutSection.slides.map((slide, idx) => {
        if (idx === 0) {
          // Slide 1 - use first image (your-image-1.jpg)
          return {
            ...slide,
            backgroundImage: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: imageAssets[0]._id
              }
            }
          };
        } else if (idx === 2) {
          // Slide 3 - use second image (your-image-2.jpg)
          return {
            ...slide,
            backgroundImage: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: imageAssets[1]._id
              }
            }
          };
        }
        return slide; // Keep slide 2 unchanged
      });

      // Replace the entire document with updated slides
      const updated = await writeClient
        .patch('aboutSection')
        .set({ slides: updatedSlides })
        .commit();
      
      console.log('✅ Successfully updated About section with images');

      // Verify the update
      const verification = await writeClient.fetch(`
        *[_type == "aboutSection"][0].slides[]{
          title,
          "hasImage": defined(backgroundImage.asset._ref),
          "imageId": backgroundImage.asset._ref
        }
      `);

      console.log('\n🎯 Verification:');
      verification.forEach((slide, idx) => {
        console.log(`Slide ${idx + 1}: ${slide.title}`);
        console.log(`  Has Image: ${slide.hasImage ? '✅' : '❌'}`);
        if (slide.imageId) {
          console.log(`  Image ID: ${slide.imageId}`);
        }
      });

    } else {
      console.log('❌ Not enough image assets found');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

manuallyFixImages().catch(console.error);