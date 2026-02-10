import readClient from '../lib/sanityClientRead.js';

async function analyzePropertyStructure() {
  console.log('🔍 Analyzing property structure and requirements...\n');

  // Check existing properties  
  const properties = await readClient.fetch('*[_type == "property"]{ _id, title, status, salePrice, location }');
  console.log('📊 Current properties in database:', properties.length);
  
  if (properties.length > 0) {
    console.log('\nExisting properties:');
    properties.forEach((prop, idx) => {
      console.log(`  ${idx + 1}. ${prop.title} - ${prop.status || 'No status'} - ${prop.salePrice || 'No price'}`);
    });
  }

  // Check current homepage notable transactions
  const homePage = await readClient.fetch('*[_type == "homePage"][0]{ notableTransactions }');
  console.log('\n📋 Current homePage notableTransactions:');
  console.log('  Has data:', !!homePage?.notableTransactions);
  console.log('  Transactions count:', homePage?.notableTransactions?.transactions?.length || 0);

  // Analyze HTML requirements
  console.log('\n🎯 HTML Notable Transactions Requirements:');
  const htmlTransactions = [
    {
      name: 'Palm Jumeirah Villa',
      price: '150,000,000 AED',
      image: 'four-seasons-private-residences-al-maryah-island.webp',
      status: 'Sold'
    },
    {
      name: 'Downtown Dubai Penthouse', 
      price: '85,000,000 AED',
      image: 'the-row-saadiyat-aldar.webp',
      status: 'Sold'
    },
    {
      name: 'Dubai Marina Tower',
      price: '65,000,000 AED', 
      image: 'hudayriyat-island-modon.jpg',
      status: 'Sold'
    }
  ];

  console.log('Required notable transactions (SOLD):');
  htmlTransactions.forEach((tx, idx) => {
    console.log(`  ${idx + 1}. ${tx.name} - ${tx.price} - ${tx.status}`);
    console.log(`     Image: ${tx.image}`);
  });

  console.log('\n📝 PLAN RECOMMENDATION:');
  console.log('1. Update notableTransactions schema to match HTML data structure');
  console.log('2. Add status field to distinguish SOLD vs FOR SALE');
  console.log('3. Populate notableTransactions with the 3 SOLD properties from HTML');
  console.log('4. Keep exclusiveListings for current FOR SALE properties');
  console.log('5. Ensure image mapping matches existing files');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. First, upload the required images to Sanity Assets');
  console.log('2. Update the notableTransactions with proper data structure'); 
  console.log('3. Populate with the 3 sold transactions from HTML');
  console.log('4. Test the data structure matches frontend requirements');
}

analyzePropertyStructure().catch(console.error);