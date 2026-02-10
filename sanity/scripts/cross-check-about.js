import readClient from '../lib/sanityClientRead.js';

async function crossCheckAboutSection() {
  console.log('🔍 Cross-checking About section data in Sanity...\n');
  
  // Get the aboutSection document
  const aboutSection = await readClient.fetch(`
    *[_type == "aboutSection"][0]{
      _id,
      title,
      subtitle,
      slides[]{
        _key,
        isActive,
        subtitle,
        title,
        description,
        buttonText,
        buttonLink,
        backgroundImage{
          _type,
          asset->{
            _id,
            url,
            originalFilename,
            mimeType
          }
        },
        slideIndex
      }
    }
  `);

  if (!aboutSection) {
    console.log('❌ No aboutSection found in Sanity!');
    return;
  }

  console.log('✅ About Section Found');
  console.log('📋 Document ID:', aboutSection._id);
  console.log('📋 Title:', aboutSection.title);
  console.log('📋 Subtitle:', aboutSection.subtitle);
  console.log('📋 Number of slides:', aboutSection.slides?.length || 0);
  console.log();

  // Check each slide in detail
  aboutSection.slides?.forEach((slide, idx) => {
    console.log(`🎯 SLIDE ${idx + 1}:`);
    console.log(`   Key: ${slide._key}`);
    console.log(`   Active: ${slide.isActive ? '✅' : '❌'}`);
    console.log(`   Subtitle: "${slide.subtitle}"`);
    console.log(`   Title: "${slide.title}"`);
    console.log(`   Description Length: ${slide.description?.length || 0} characters`);
    console.log(`   Button Text: "${slide.buttonText}"`);
    console.log(`   Button Link: "${slide.buttonLink}"`);
    console.log(`   Slide Index: ${slide.slideIndex}`);
    
    if (slide.backgroundImage?.asset) {
      console.log(`   Image: ✅ ${slide.backgroundImage.asset.originalFilename || 'Image uploaded'}`);
      console.log(`   Image Type: ${slide.backgroundImage.asset.mimeType || 'Unknown type'}`);
      console.log(`   Image URL: ${slide.backgroundImage.asset.url || 'No URL'}`);
    } else {
      console.log(`   Image: ❌ Missing`);
    }
    console.log();
  });

  // Check for missing images
  console.log('🖼️  IMAGE STATUS SUMMARY:');
  const expectedImages = [
    'img.avif',
    'img2.webp', 
    'img3.avif'
  ];
  
  expectedImages.forEach((imageName, idx) => {
    const slide = aboutSection.slides?.[idx];
    const hasImage = slide?.backgroundImage?.asset;
    console.log(`   Slide ${idx + 1} (${imageName}): ${hasImage ? '✅ Has image' : '❌ Missing image'}`);
  });
}

crossCheckAboutSection().catch(console.error);