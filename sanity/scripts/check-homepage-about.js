import readClient from '../lib/sanityClientRead.js';

async function checkHomePage() {
  console.log('🔍 Checking homePage aboutCarousel field...');
  
  const homePage = await readClient.fetch('*[_type == "homePage"][0]{ _id, title, heroSection, aboutCarousel }');
  
  if (homePage) {
    console.log('\n📋 HomePage document:');
    console.log('   ID:', homePage._id);
    console.log('   Title:', homePage.title);
    console.log('   Has Hero Section:', !!homePage.heroSection);
    console.log('   About Carousel:', homePage.aboutCarousel ? 'HAS DATA' : 'EMPTY');
    
    if (homePage.aboutCarousel) {
      console.log('   About slides count:', homePage.aboutCarousel.slides?.length || 0);
    }
  } else {
    console.log('❌ No homePage found');
  }
}

checkHomePage().catch(console.error);