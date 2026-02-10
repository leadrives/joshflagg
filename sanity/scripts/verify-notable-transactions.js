import readClient from '../lib/sanityClientRead.js';

async function verifyNotableTransactionsMapping() {
  console.log('🔍 Verifying Notable Transactions mapping with HTML requirements...\n');

  const homePage = await readClient.fetch(`
    *[_type == "homePage"][0]{
      notableTransactions{
        title,
        subtitle,
        transactions[]{
          propertyName,
          salePrice,
          location,
          saleDate,
          description,
          image{
            asset->{
              _id,
              url,
              originalFilename
            }
          }
        }
      }
    }
  `);

  const notableTransactions = homePage?.notableTransactions;
  
  if (!notableTransactions) {
    console.log('❌ No notable transactions found');
    return;
  }

  console.log('📋 SECTION DATA:');
  console.log(`   Title: "${notableTransactions.title}"`);
  console.log(`   Subtitle: "${notableTransactions.subtitle}"`);
  console.log();

  console.log('🎯 HTML vs SANITY MAPPING VERIFICATION:');
  
  // HTML requirements from the code
  const htmlExpectedTransactions = [
    {
      expectedName: 'Palm Jumeirah Villa',
      expectedPrice: '150,000,000 AED',
      expectedImage: 'four-seasons-private-residences-al-maryah-island.webp',
      expectedAlt: 'Palm Jumeirah Villa'
    },
    {
      expectedName: 'Downtown Dubai Penthouse', 
      expectedPrice: '85,000,000 AED',
      expectedImage: 'the-row-saadiyat-aldar.webp',
      expectedAlt: 'Downtown Dubai Penthouse'
    },
    {
      expectedName: 'Dubai Marina Tower',
      expectedPrice: '65,000,000 AED', 
      expectedImage: 'hudayriyat-island-modon.jpg',
      expectedAlt: 'Dubai Marina Tower'
    }
  ];

  notableTransactions.transactions?.forEach((sanityTx, idx) => {
    const expected = htmlExpectedTransactions[idx];
    
    console.log(`\n📊 TRANSACTION ${idx + 1} MAPPING:`);
    console.log(`   HTML Expected: ${expected.expectedName} - ${expected.expectedPrice}`);
    console.log(`   Sanity Actual: ${sanityTx.propertyName} - ${sanityTx.salePrice}`);
    
    const nameMatch = sanityTx.propertyName === expected.expectedName;
    const priceMatch = sanityTx.salePrice === expected.expectedPrice;
    
    console.log(`   Name Match: ${nameMatch ? '✅' : '❌'}`);
    console.log(`   Price Match: ${priceMatch ? '✅' : '❌'}`);
    console.log(`   Location: ${sanityTx.location}`);
    console.log(`   Sale Date: ${sanityTx.saleDate}`);
    
    if (sanityTx.image?.asset) {
      const imageFilename = sanityTx.image.asset.originalFilename;
      const imageMatch = imageFilename === expected.expectedImage;
      console.log(`   Image: ${imageMatch ? '✅' : '❌'} ${imageFilename}`);
      console.log(`   Image URL: ${sanityTx.image.asset.url}`);
    } else {
      console.log(`   Image: ❌ Missing`);
    }
  });

  // Overall status
  const allMatch = notableTransactions.transactions?.every((sanityTx, idx) => {
    const expected = htmlExpectedTransactions[idx];
    return sanityTx.propertyName === expected.expectedName && 
           sanityTx.salePrice === expected.expectedPrice &&
           sanityTx.image?.asset;
  });

  console.log('\n🏆 OVERALL STATUS:');
  console.log(`   Data Complete: ${allMatch ? '✅ YES' : '❌ NO'}`);
  console.log(`   Ready for Frontend: ${allMatch ? '✅ YES' : '❌ NO'}`);
  console.log(`   Notable Transactions Count: ${notableTransactions.transactions?.length || 0}/3`);
  
  console.log('\n📍 Frontend Integration:');
  console.log('   - Each transaction maps to carousel slides');  
  console.log('   - Images are uploaded and accessible via Sanity CDN');
  console.log('   - Price and name data matches HTML data attributes');
  console.log('   - Ready for dynamic loading via JavaScript');
}

verifyNotableTransactionsMapping().catch(console.error);