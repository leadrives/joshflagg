import fs from 'fs';
import writeClient from '../lib/sanityClientWrite.js';
import { uploadAsset, resolveImagePath } from './_utils/assetUploader.js';

const DRY_RUN = process.env.DRY_RUN === '1';

/**
 * Create or update the homePage document with hero section data
 */
async function createHeroSection() {
  console.log('🚀 Creating hero section content...\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Upload hero fallback image
    console.log('📤 Uploading hero fallback image...');
    const heroImagePath = resolveImagePath('assets/images/hero/vcgt8tivc2pewre3tvjz.avif');
    const heroImage = await uploadAsset(heroImagePath, 'assets/images/hero/vcgt8tivc2pewre3tvjz.avif');

    // Hero section data from the HTML
    const heroData = {
      _type: 'homePage',
      _id: 'homePage',
      title: 'Homepage',
      heroSection: {
        subtitle: 'OVER $3B+ IN TOTAL SALES VOLUME PER THE LABJ 2024',
        title: "One of UAE's Most\\nSuccessful and Sought after\\nLuxury Real Estate Agents",
        primaryButtonText: 'Find a Home',
        primaryButtonAction: 'modal', // for consultation modal
        secondaryButtonText: 'Sold Properties',
        secondaryButtonAction: 'scroll', // for #notable-transactions
        mediaType: 'video',
        videoUrl: 'assets/videos/Jumeirah Residences Emirates Towers.mp4',
        posterImage: heroImage
      }
    };

    if (DRY_RUN) {
      console.log('[DRY RUN] Would create/update homePage with hero data:');
      console.log(JSON.stringify(heroData, null, 2));
      return;
    }

    // Check if homePage document exists
    const existingHomePage = await writeClient.getDocument('homePage');
    
    if (existingHomePage) {
      // Update existing document
      const updated = await writeClient
        .patch('homePage')
        .set({ heroSection: heroData.heroSection })
        .commit();
      
      console.log('✅ Updated homePage with hero section');
    } else {
      // Create new document
      const created = await writeClient.create(heroData);
      
      console.log('🆕 Created homePage with hero section');
    }

    // Verify the content was created
    const homePage = await writeClient.fetch('*[_type == "homePage"][0]');
    console.log('\\n🎯 Hero section in Sanity:');
    console.log('   Subtitle:', homePage.heroSection.subtitle);
    console.log('   Title:', homePage.heroSection.title);
    console.log('   Primary Button:', homePage.heroSection.primaryButtonText);
    console.log('   Secondary Button:', homePage.heroSection.secondaryButtonText);
    console.log('   Video URL:', homePage.heroSection.videoUrl);
    console.log('   Poster Image:', homePage.heroSection.posterImage ? '✅ Uploaded' : '❌ Missing');

  } catch (error) {
    console.error('💥 Error creating hero section:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createHeroSection()
    .then(() => {
      console.log('\\n🎉 Hero section creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Hero section creation failed:', error);
      process.exit(1);
    });
}