import fs from 'fs';
import writeClient from '../lib/sanityClientWrite.js';
import { uploadAsset, resolveImagePath } from './_utils/assetUploader.js';

const DRY_RUN = process.env.DRY_RUN === '1';

/**
 * Create about section with carousel slides
 */
async function createAboutSection() {
  console.log('🚀 Creating about section content...\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Upload carousel images
    console.log('📤 Uploading carousel images...');
    
    const slide1Image = await uploadAsset(
      resolveImagePath('assets/images/carousel/img.avif'), 
      'assets/images/carousel/img.avif'
    );
    
    const slide2Image = await uploadAsset(
      resolveImagePath('assets/images/carousel/img2.webp'), 
      'assets/images/carousel/img2.webp'
    );
    
    const slide3Image = await uploadAsset(
      resolveImagePath('assets/images/carousel/img3.avif'), 
      'assets/images/carousel/img3.avif'
    );

    // About section data from the HTML
    const aboutData = {
      _type: 'aboutSection',
      _id: 'aboutSection',
      title: 'About Ahmad',
      subtitle: 'Learn more about Mohamad Ahmad',
      slides: [
        {
          _key: 'slide1',
          _type: 'carouselSlide',
          isActive: true,
          subtitle: 'A GLOBAL LUXURY LIFESTYLE EXPERT',
          title: 'Top 25 Ranked\nAgent',
          description: `Known as one of Dubai's premier luxury real estate specialists, Ahmad is a contributor to several real estate publications, news and television outlets. He has been featured in Emirates Business, Gulf News, Arabian Business Magazine and Property Finder among others. Follow him for the latest luxury news, and come back for weekly videos and highlights.`,
          buttonText: 'In the Press',
          buttonLink: 'blog/index.html',
          backgroundImage: slide1Image,
          slideIndex: 0
        },
        {
          _key: 'slide2',
          _type: 'carouselSlide',
          isActive: false,
          subtitle: 'INFLUENCING THE DUBAI REAL ESTATE LANDSCAPE',
          title: '$3B+ in Total Sales',
          description: `Ahmad's record-selling achievements include the highest sale in Downtown Dubai, the most expensive penthouse transaction in Dubai Marina, the record-breaking sale in Emirates Hills, as well as the largest villa sale in Palm Jumeirah. He sold the property for just under 150,000,000 AED. He has also been the listing agent for reputable estates including luxury penthouses in Burj Khalifa and exclusive villas in Emirates Hills.`,
          buttonText: 'Notable Sales',
          buttonLink: '#notable-transactions',
          backgroundImage: slide2Image,
          slideIndex: 1
        },
        {
          _key: 'slide3',
          _type: 'carouselSlide',
          isActive: false,
          subtitle: 'A LUXURY REAL ESTATE ICON',
          title: 'Global Luxury\nRecognition',
          description: `Mohamad Ahmad is one of UAE's most successful and sought-after Dubai luxury real estate agents, having completed more than 11 billion AED in residential real estate sales in the past decade. Ahmad has been recognized by Gulf News as one of the top-ranked agents in Dubai and nationally by sales volume and as a top 25 real estate agent in the region by Arabian Business.`,
          buttonText: 'Learn More',
          buttonLink: '#consultation-modal',
          backgroundImage: slide3Image,
          slideIndex: 2
        }
      ]
    };

    if (DRY_RUN) {
      console.log('[DRY RUN] Would create aboutSection with data:');
      console.log('Slides:', aboutData.slides.length);
      aboutData.slides.forEach((slide, idx) => {
        console.log(`  Slide ${idx + 1}: ${slide.title.replace(/\n/g, ' ')}`);
        console.log(`    Subtitle: ${slide.subtitle}`);
        console.log(`    Button: ${slide.buttonText}`);
        console.log(`    Image: ${slide.backgroundImage ? '✅ Uploaded' : '❌ Missing'}`);
      });
      return;
    }

    // Check if aboutSection document exists
    let existingAbout;
    try {
      existingAbout = await writeClient.getDocument('aboutSection');
    } catch (error) {
      // Document doesn't exist, which is fine
    }
    
    if (existingAbout) {
      // Update existing document
      const updated = await writeClient
        .patch('aboutSection')
        .set(aboutData)
        .commit();
      
      console.log('✅ Updated aboutSection');
    } else {
      // Create new document
      const created = await writeClient.create(aboutData);
      
      console.log('🆕 Created aboutSection');
    }

    // Verify the content was created
    const aboutSection = await writeClient.fetch('*[_type == "aboutSection"][0]');
    console.log('\n🎯 About section in Sanity:');
    console.log(`   Title: ${aboutSection.title}`);
    console.log(`   Slides: ${aboutSection.slides.length}`);
    
    aboutSection.slides.forEach((slide, idx) => {
      console.log(`\n   Slide ${idx + 1}:`);
      console.log(`     Title: ${slide.title.replace(/\n/g, ' | ')}`);
      console.log(`     Subtitle: ${slide.subtitle}`);
      console.log(`     Button: ${slide.buttonText}`);
      console.log(`     Image: ${slide.backgroundImage ? '✅ Has image' : '❌ No image'}`);
    });

  } catch (error) {
    console.error('💥 Error creating about section:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createAboutSection()
    .then(() => {
      console.log('\n🎉 About section creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 About section creation failed:', error);
      process.exit(1);
    });
}