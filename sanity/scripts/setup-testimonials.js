/**
 * Setup Testimonials Section
 * 
 * This script creates testimonials from HTML data and adds the testimonials section to homePage.
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN
});

// HTML testimonials data
const htmlTestimonials = [
  {
    clientName: 'James Bloomingdale',
    testimonialText: 'We interviewed a number of his competitors (most at least 25 years his senior) and were impressed by his immediate understanding of the property, his poise and his honesty. Ahmad is brilliant, professional and wise beyond his years. Wouldn\'t hire anyone else in the future.',
    rating: 5,
    serviceType: 'consultation',
    isPublished: true,
    isFeatured: true,
    dateSubmitted: '2023-12-01',
    source: 'in-person'
  },
  {
    clientName: 'Sarah & Michael Chen',
    testimonialText: 'Mohamad Ahmad represented us in the sale of our Dubai Marina penthouse and exceeded all expectations. His market knowledge, negotiation skills, and attention to detail resulted in a sale price well above our initial asking price. Professional, responsive, and truly dedicated to his clients.',
    rating: 5,
    serviceType: 'sale',
    propertyDetails: {
      propertyName: 'Dubai Marina Penthouse',
      propertyType: 'Penthouse',
      location: 'Dubai Marina',
      transactionType: 'sale',
      completionDate: '2023-06-15'
    },
    isPublished: true,
    isFeatured: true,
    dateSubmitted: '2023-06-20',
    source: 'email'
  },
  {
    clientName: 'Jennifer Rodriguez',
    testimonialText: 'Working with Ahmad was an absolute pleasure. His expertise in luxury real estate is unmatched, and his ability to understand exactly what we were looking for made our home buying experience seamless. We found our dream home within weeks of starting our search.',
    rating: 5,
    serviceType: 'purchase',
    isPublished: true,
    isFeatured: true,
    dateSubmitted: '2023-09-10',
    source: 'website'
  },
  {
    clientName: 'David Thompson',
    testimonialText: 'Ahmad\'s reputation precedes him, and rightfully so. His deep understanding of the Dubai real estate market and his extensive network of connections made all the difference in our transaction. Highly professional and results-driven.',
    rating: 5,
    serviceType: 'investment',
    isPublished: true,
    isFeatured: true,
    dateSubmitted: '2023-11-05',
    source: 'social'
  }
];

async function setupTestimonialsSection() {
  console.log('🎯 Setting up Testimonials Section...');
  
  try {
    // Step 1: Create testimonial documents
    console.log('📝 Creating testimonial documents...');
    const testimonialIds = [];
    
    for (const testimonialData of htmlTestimonials) {
      const testimonialDoc = {
        _type: 'testimonial',
        ...testimonialData
      };
      
      const result = await client.create(testimonialDoc);
      testimonialIds.push(result._id);
      console.log(`✅ Created testimonial: ${testimonialData.clientName} (ID: ${result._id})`);
    }
    
    // Step 2: Set up stats data
    const statsData = [
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
    ];
    
    // Step 3: Update homePage with testimonials section
    console.log('🏠 Updating homePage with testimonials section...');
    
    const testimonialsSection = {
      quote: 'Mohamad Ahmad is a global luxury lifestyle expert',
      featuredTestimonials: testimonialIds.map(id => ({
        _type: 'reference',
        _ref: id
      })),
      stats: statsData
    };
    
    // Check if it's a draft first
    let targetId = 'homePage';
    try {
      const draft = await client.getDocument('drafts.homePage');
      if (draft) {
        targetId = 'drafts.homePage';
        console.log('📝 Updating draft version');
      }
    } catch (e) {
      console.log('📄 Updating published version');
    }
    
    await client
      .patch(targetId)
      .set({ testimonialsSection })
      .commit();
    
    console.log('✅ Updated homePage with testimonials section');
    
    // Step 4: Verification
    console.log('\n🎯 Verification:');
    console.log(`   Testimonials created: ${testimonialIds.length}`);
    console.log(`   Stats configured: ${statsData.length}`);
    console.log(`   Main quote: "${testimonialsSection.quote}"`);
    
    console.log('\n📋 Created Testimonials:');
    for (let i = 0; i < htmlTestimonials.length; i++) {
      const testimonial = htmlTestimonials[i];
      console.log(`${i + 1}. ${testimonial.clientName}`);
      console.log(`   Rating: ${testimonial.rating}★`);
      console.log(`   Service: ${testimonial.serviceType}`);
      console.log(`   Text: ${testimonial.testimonialText.substring(0, 100)}...`);
      console.log('');
    }
    
    console.log('🎉 Testimonials section setup completed!');
    console.log('📍 You can now see this data in Sanity Studio under:');
    console.log('   - Testimonials (individual documents)');
    console.log('   - Homepage > Testimonials Section');
    
  } catch (error) {
    console.error('❌ Error setting up testimonials section:', error);
    process.exit(1);
  }
}

// Run the script
setupTestimonialsSection();