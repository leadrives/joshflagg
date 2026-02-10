import writeClient from '../lib/sanityClientWrite.js';
import { uploadAsset, resolveImagePath } from './_utils/assetUploader.js';

async function setupNotableTransactions() {
  console.log('🏆 Setting up Notable Transactions (SOLD Properties)...\n');

  try {
    // Upload the notable transaction images
    console.log('📤 Uploading notable transaction images...');
    
    const transaction1Image = await uploadAsset(
      resolveImagePath('assets/images/four-seasons-private-residences-al-maryah-island.webp'),
      'assets/images/four-seasons-private-residences-al-maryah-island.webp'
    );
    
    const transaction2Image = await uploadAsset(
      resolveImagePath('assets/images/the-row-saadiyat-aldar.webp'),
      'assets/images/the-row-saadiyat-aldar.webp'
    );
    
    const transaction3Image = await uploadAsset(
      resolveImagePath('assets/images/hudayriyat-island-modon.jpg'),
      'assets/images/hudayriyat-island-modon.jpg'
    );

    // Create notable transactions data matching HTML structure
    const notableTransactionsData = {
      title: 'Notable Transactions',
      subtitle: '$3B+ in total sales volume',
      transactions: [
        {
          propertyName: 'Palm Jumeirah Villa',
          salePrice: '150,000,000 AED', 
          location: 'Palm Jumeirah, Dubai',
          saleDate: '2023-08-15', // Example date
          image: transaction1Image,
          description: 'Luxury waterfront villa with private beach access and panoramic views of Dubai Marina skyline.'
        },
        {
          propertyName: 'Downtown Dubai Penthouse',
          salePrice: '85,000,000 AED',
          location: 'Downtown Dubai', 
          saleDate: '2023-06-20', // Example date
          image: transaction2Image,
          description: 'Ultra-luxury penthouse in the heart of Downtown Dubai with spectacular Burj Khalifa views.'
        },
        {
          propertyName: 'Dubai Marina Tower',
          salePrice: '65,000,000 AED',
          location: 'Dubai Marina',
          saleDate: '2023-04-10', // Example date
          image: transaction3Image,
          description: 'Premium high-rise residence offering stunning marina and Arabian Gulf vistas.'
        }
      ]
    };

    // Update the homePage with notable transactions
    const updated = await writeClient
      .patch('homePage')
      .set({ notableTransactions: notableTransactionsData })
      .commit();

    console.log('✅ Updated homePage with notable transactions');

    // Verify the update
    const verification = await writeClient.fetch('*[_type == "homePage"][0].notableTransactions');
    console.log('\n🎯 Verification:');
    console.log('   Title:', verification.title);
    console.log('   Subtitle:', verification.subtitle);
    console.log('   Transactions count:', verification.transactions?.length || 0);
    
    verification.transactions?.forEach((tx, idx) => {
      console.log(`\n   Transaction ${idx + 1}:`);
      console.log(`     Name: ${tx.propertyName}`);
      console.log(`     Price: ${tx.salePrice}`);
      console.log(`     Location: ${tx.location}`);
      console.log(`     Has Image: ${tx.image ? '✅' : '❌'}`);
      console.log(`     Description: ${tx.description.substring(0, 50)}...`);
    });

    console.log('\n🎉 Notable Transactions setup completed!');
    console.log('📍 Now you can see this data in Sanity Studio under Homepage > Notable Transactions Section');

  } catch (error) {
    console.error('💥 Error setting up notable transactions:', error);
  }
}

setupNotableTransactions().catch(console.error);