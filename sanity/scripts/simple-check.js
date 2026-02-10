import readClient from '../lib/sanityClientRead.js';

async function checkSimple() {
  try {
    console.log('🔍 Comprehensive Sanity Content Check\n');
    
    // Check all documents
    const allDocs = await readClient.fetch('*[defined(_type)] { _type, _id }');
    console.log('📊 Total documents:', allDocs.length);
    
    // Count by type
    const counts = {};
    allDocs.forEach(doc => {
      counts[doc._type] = (counts[doc._type] || 0) + 1;
    });
    
    console.log('\n📋 Documents by type:');
    Object.entries(counts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    // Check properties specifically
    console.log('\n🏠 Properties check:');
    const properties = await readClient.fetch('*[_type == "property"] { _id, legacyId, title }');
    console.log(`   Found ${properties.length} properties`);
    properties.forEach(p => console.log(`   - ${p.legacyId}: ${p.title}`));
    
    // Check homePage
    console.log('\n🏠 HomePage check:');
    const homePage = await readClient.fetch('*[_type == "homePage"][0] { _id, title, heroSection }');
    if (homePage) {
      console.log('   ✅ HomePage exists');
      console.log('   Hero subtitle:', homePage.heroSection?.subtitle || 'Not set');
    } else {
      console.log('   ❌ HomePage not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSimple();