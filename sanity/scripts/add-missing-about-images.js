import writeClient from '../lib/sanityClientWrite.js';
import { uploadAsset, resolveImagePath } from './_utils/assetUploader.js';

async function addMissingAboutImages() {
  console.log('🖼️  Adding missing About section images...\n');

  try {
    // Try to upload alternative images for the missing AVIF files
    console.log('📤 Attempting to upload alternative images...');
    
    // For slide 1: Try using an existing JPG image as fallback
    let slide1Image = null;
    try {
      slide1Image = await uploadAsset(
        resolveImagePath('assets/images/your-image-1.jpg'), 
        'assets/images/your-image-1.jpg'
      );
      console.log('✅ Uploaded alternative image for Slide 1');
    } catch (error) {
      console.log('❌ Failed to upload alternative for Slide 1:', error.message);
    }

    // For slide 3: Try using another existing JPG image as fallback  
    let slide3Image = null;
    try {
      slide3Image = await uploadAsset(
        resolveImagePath('assets/images/your-image-2.jpg'), 
        'assets/images/your-image-2.jpg'
      );
      console.log('✅ Uploaded alternative image for Slide 3');
    } catch (error) {
      console.log('❌ Failed to upload alternative for Slide 3:', error.message);
    }

    // Update the about section with the new images
    console.log('\n🔄 Updating About section with new images...');
    
    const patches = [];
    
    if (slide1Image) {
      patches.push({
        'slides[0].backgroundImage': {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: slide1Image._id
          }
        }
      });
    }
    
    if (slide3Image) {
      patches.push({
        'slides[2].backgroundImage': {
          _type: 'image', 
          asset: {
            _type: 'reference',
            _ref: slide3Image._id
          }
        }
      });
    }

    if (patches.length > 0) {
      const updateObject = {};
      patches.forEach(patch => Object.assign(updateObject, patch));
      
      const updated = await writeClient
        .patch('aboutSection')
        .set(updateObject)
        .commit();
      
      console.log(`✅ Updated ${patches.length} image(s) in About section`);
    } else {
      console.log('❌ No images were successfully uploaded');
    }

    // Verify final status
    console.log('\n🎯 Final About section image status:');
    const aboutSection = await writeClient.fetch(`
      *[_type == "aboutSection"][0].slides[]{
        title,
        backgroundImage{
          asset->{
            originalFilename,
            url
          }
        }
      }
    `);

    aboutSection.forEach((slide, idx) => {
      console.log(`   Slide ${idx + 1} (${slide.title}): ${slide.backgroundImage?.asset ? '✅ Has image' : '❌ Missing image'}`);
      if (slide.backgroundImage?.asset) {
        console.log(`     File: ${slide.backgroundImage.asset.originalFilename}`);
      }
    });

  } catch (error) {
    console.error('💥 Error adding images:', error);
  }
}

addMissingAboutImages().catch(console.error);