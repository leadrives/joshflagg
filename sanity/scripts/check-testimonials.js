import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function checkTestimonials() {
  try {
    console.log('🔍 Checking testimonials in database...');
    
    // Check if any testimonials exist
    const testimonials = await client.fetch(`*[_type == "testimonial"]{
      _id,
      clientName,
      testimonialText,
      rating,
      isPublished,
      isFeatured
    }`);
    
    console.log(`\n📊 Found ${testimonials.length} testimonials in database`);
    
    if (testimonials.length > 0) {
      console.log('\n📋 Existing Testimonials:');
      testimonials.forEach((testimonial, index) => {
        console.log(`${index + 1}. ${testimonial.clientName || 'No name'}`);
        console.log(`   Rating: ${testimonial.rating || 'N/A'}★`);
        console.log(`   Published: ${testimonial.isPublished ? '✅' : '❌'}`);
        console.log(`   Featured: ${testimonial.isFeatured ? '✅' : '❌'}`);
        console.log(`   Text: ${testimonial.testimonialText?.substring(0, 100) || 'No text'}...`);
        console.log('');
      });
    } else {
      console.log('\n❌ No testimonials found in database');
      console.log('💡 Need to create testimonials from HTML data');
    }
    
    // Also check if homePage has testimonials field
    console.log('\n🔍 Checking if homePage has testimonials field...');
    const homePage = await client.fetch(`*[_type == "homePage"][0]{
      _id,
      "hasTestimonials": defined(testimonials),
      "testimonialFields": {
        "hasSection": defined(testimonials.section),
        "hasQuote": defined(testimonials.quote),  
        "hasSlides": defined(testimonials.slides),
        "hasStats": defined(testimonials.stats)
      }
    }`);
    
    console.log('HomePage testimonials structure:');
    console.log(JSON.stringify(homePage, null, 2));
    
  } catch (error) {
    console.error('❌ Error checking testimonials:', error);
  }
}

checkTestimonials();