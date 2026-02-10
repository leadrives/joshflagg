/**
 * Add Testimonials Section to HomePage
 * 
 * This script adds the testimonials section to the homePage with the existing testimonials.
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN
});

async function addTestimonialsToHomePage() {
  console.log('🏠 Adding testimonials section to homePage...');
  
  try {
    // Get existing testimonials
    const testimonials = await client.fetch(`*[_type == "testimonial" && isPublished == true && isFeatured == true]{
      _id
    }`);
    
    console.log(`📋 Found ${testimonials.length} featured testimonials`);
    
    // Set up testimonials section data
    const testimonialsSection = {
      quote: 'Mohamad Ahmad is a global luxury lifestyle expert',
      featuredTestimonials: testimonials.map(t => ({
        _type: 'reference',
        _ref: t._id
      })),
      stats: [
        {
          number: 50,
          suffix: '+',
          label: 'SALES OVER $20M',
          prefix: ''
        },
        {
          number: 3,
          suffix: 'B+',
          label: 'IN TOTAL SALES VOLUME',
          prefix: '$'
        },
        {
          number: 100,
          suffix: '+',
          label: 'SALES OVER $10M',
          prefix: ''
        }
      ]
    };
    
    console.log('📝 Creating testimonials section data...');
    console.log(`   Quote: "${testimonialsSection.quote}"`);
    console.log(`   Featured testimonials: ${testimonialsSection.featuredTestimonials.length}`);
    console.log(`   Stats: ${testimonialsSection.stats.length}`);
    
    // Try to update draft first, then published
    let updated = false;
    
    try {
      const draftResult = await client
        .patch('drafts.homePage')
        .set({ testimonialsSection })
        .commit();
      
      console.log('✅ Updated draft homePage with testimonials section');
      updated = true;
    } catch (draftError) {
      console.log('📄 No draft found, updating published version...');
    }
    
    if (!updated) {
      await client
        .patch('homePage')
        .set({ testimonialsSection })
        .commit();
      
      console.log('✅ Updated published homePage with testimonials section');
    }
    
    // Verification
    console.log('\n🎯 Verification:');
    
    const updatedHomePage = await client.fetch(`*[_id == "homePage" || _id == "drafts.homePage"]{
      _id,
      "hasTestimonials": defined(testimonialsSection),
      "testimonialData": testimonialsSection{
        quote,
        "testimonialCount": count(featuredTestimonials),
        "statsCount": count(stats)
      }
    }`);
    
    updatedHomePage.forEach(doc => {
      console.log(`\n📋 ${doc._id}:`);
      console.log(`   Has testimonials: ${doc.hasTestimonials ? '✅' : '❌'}`);
      if (doc.testimonialData) {
        console.log(`   Quote: "${doc.testimonialData.quote}"`);
        console.log(`   Featured testimonials: ${doc.testimonialData.testimonialCount}`);
        console.log(`   Stats: ${doc.testimonialData.statsCount}`);
      }
    });
    
    console.log('\n🎉 Testimonials section added to homePage!');
    console.log('📍 You can now see this in Sanity Studio under Homepage > Testimonials Section');
    
  } catch (error) {
    console.error('❌ Error adding testimonials to homePage:', error);
    process.exit(1);
  }
}

// Run the script
addTestimonialsToHomePage();