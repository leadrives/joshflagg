import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function checkTestimonialsStatus() {
  try {
    console.log('🔍 Checking testimonials status in both published and draft...');
    
    // Check published version
    const published = await client.fetch(`*[_id == "homePage"][0]{
      _id,
      "hasTestimonials": defined(testimonialsSection),
      "testimonialData": testimonialsSection
    }`);
    
    console.log('\n📄 Published Version:');
    console.log('   Has testimonials:', published?.hasTestimonials ? '✅' : '❌');
    if (published?.testimonialData) {
      console.log('   Quote:', published.testimonialData.quote);
      console.log('   Featured testimonials:', published.testimonialData.featuredTestimonials?.length || 0);
      console.log('   Stats:', published.testimonialData.stats?.length || 0);
    }
    
    // Check draft version
    const draft = await client.fetch(`*[_id == "drafts.homePage"][0]{
      _id,
      "hasTestimonials": defined(testimonialsSection),
      "testimonialData": testimonialsSection
    }`);
    
    console.log('\n📝 Draft Version:');
    console.log('   Has testimonials:', draft?.hasTestimonials ? '✅' : '❌');
    if (draft?.testimonialData) {
      console.log('   Quote:', draft.testimonialData.quote);
      console.log('   Featured testimonials:', draft.testimonialData.featuredTestimonials?.length || 0);
      console.log('   Stats:', draft.testimonialData.stats?.length || 0);
    }
    
    // Also list all testimonials
    const testimonials = await client.fetch(`*[_type == "testimonial" && isPublished == true]{
      _id,
      clientName,
      testimonialText,
      rating,
      isFeatured
    }`);
    
    console.log('\n📋 Available Testimonials:');
    testimonials.forEach((testimonial, index) => {
      console.log(`${index + 1}. ${testimonial.clientName}`);
      console.log(`   Rating: ${testimonial.rating}★`);
      console.log(`   Featured: ${testimonial.isFeatured ? '✅' : '❌'}`);
      console.log(`   ID: ${testimonial._id}`);
      console.log('');
    });
    
    console.log(`Total testimonials: ${testimonials.length}`);
    
  } catch (error) {
    console.error('❌ Error checking testimonials status:', error);
  }
}

checkTestimonialsStatus();