import readClient from '../lib/sanityClientRead.js';

async function finalCrossCheck() {
  console.log('🎯 FINAL About Section Cross-Check\n');
  
  const aboutSection = await readClient.fetch(`
    *[_type == "aboutSection"][0]{
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
        slideIndex,
        backgroundImage{
          asset->{
            _id,
            originalFilename,
            mimeType,
            url
          }
        }
      }
    }
  `);

  if (!aboutSection) {
    console.log('❌ No About section found!');
    return;
  }

  console.log('✅ About Section Status:');
  console.log(`   Title: ${aboutSection.title}`);
  console.log(`   Subtitle: ${aboutSection.subtitle}`);
  console.log(`   Slides: ${aboutSection.slides.length}`);
  console.log();

  // Compare with HTML expectations
  const htmlExpectations = [
    {
      subtitle: "A GLOBAL LUXURY LIFESTYLE EXPERT",
      title: "Top 25 Ranked\nAgent", 
      buttonText: "In the Press",
      buttonLink: "blog/index.html",
      originalImage: "img.avif"
    },
    {
      subtitle: "INFLUENCING THE DUBAI REAL ESTATE LANDSCAPE",
      title: "$3B+ in Total Sales",
      buttonText: "Notable Sales", 
      buttonLink: "#notable-transactions",
      originalImage: "img2.webp"
    },
    {
      subtitle: "A LUXURY REAL ESTATE ICON",
      title: "Global Luxury\nRecognition",
      buttonText: "Learn More",
      buttonLink: "#consultationModal",
      originalImage: "img3.avif"
    }
  ];

  console.log('📋 DETAILED COMPARISON:');
  aboutSection.slides.forEach((slide, idx) => {
    const expected = htmlExpectations[idx];
    console.log(`\n🎯 SLIDE ${idx + 1}:`);
    
    // Check each field
    const subtitleMatch = slide.subtitle === expected.subtitle;
    const titleMatch = slide.title === expected.title;
    const buttonTextMatch = slide.buttonText === expected.buttonText;
    const buttonLinkMatch = slide.buttonLink === expected.buttonLink;
    const hasImage = !!slide.backgroundImage?.asset;
    
    console.log(`   ✓ Subtitle: ${subtitleMatch ? '✅' : '❌'} "${slide.subtitle}"`);
    console.log(`   ✓ Title: ${titleMatch ? '✅' : '❌'} "${slide.title}"`);
    console.log(`   ✓ Button Text: ${buttonTextMatch ? '✅' : '❌'} "${slide.buttonText}"`);
    console.log(`   ✓ Button Link: ${buttonLinkMatch ? '✅' : '❌'} "${slide.buttonLink}"`);
    console.log(`   ✓ Image: ${hasImage ? '✅' : '❌'} ${hasImage ? slide.backgroundImage.asset.originalFilename : 'Missing'}`);
    console.log(`   ✓ Expected: ${expected.originalImage} → ${hasImage ? 'Alternative uploaded' : 'Still missing'}`);
    console.log(`   ✓ Active: ${slide.isActive ? '✅' : '❌'}`);
    
    if (hasImage) {
      console.log(`   ✓ Image URL: ${slide.backgroundImage.asset.url}`);
    }
  });

  // Overall status
  const allImagesPresent = aboutSection.slides.every(slide => !!slide.backgroundImage?.asset);
  const allContentMatches = aboutSection.slides.every((slide, idx) => {
    const expected = htmlExpectations[idx];
    return slide.subtitle === expected.subtitle &&
           slide.title === expected.title &&
           slide.buttonText === expected.buttonText &&
           slide.buttonLink === expected.buttonLink;
  });

  console.log('\n🏆 OVERALL STATUS:');
  console.log(`   Content Match: ${allContentMatches ? '✅ Perfect' : '❌ Issues found'}`);
  console.log(`   Images: ${allImagesPresent ? '✅ All present' : '❌ Some missing'}`);
  console.log(`   Ready for Frontend: ${allContentMatches && allImagesPresent ? '✅ YES' : '❌ NO'}`);
}

finalCrossCheck().catch(console.error);