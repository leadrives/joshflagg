/**
 * Fix Notable Transactions Missing Keys via CLI
 * 
 * This script uses GROQ to create a migration for fixing missing _key properties.
 */

import { createClient } from '@sanity/client';

// Use API version that's widely supported
const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function analyzeKeyIssues() {
  console.log('🔍 Analyzing Notable Transactions key issues...');
  
  try {
    // Query both published and draft versions with explicit IDs
    const publishedQuery = `*[_type == "homePage" && _id == "homePage"][0]{
      "transactions": notableTransactions.transactions
    }`;
    
    const draftQuery = `*[_type == "homePage" && _id == "drafts.homePage"][0]{
      "transactions": notableTransactions.transactions
    }`;
    
    const [publishedData, draftData] = await Promise.all([
      client.fetch(publishedQuery),
      client.fetch(draftQuery)
    ]);
    
    console.log('\n📋 Published Version:');
    if (publishedData?.transactions) {
      publishedData.transactions.forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.propertyName || 'Unnamed'}`);
        console.log(`   Has _key: ${transaction._key ? '✅ YES' : '❌ NO'}`);
        if (transaction._key) {
          console.log(`   Key: ${transaction._key}`);
        }
        console.log('');
      });
    } else {
      console.log('   No published data found');
    }
    
    console.log('\n📋 Draft Version:');
    if (draftData?.transactions) {
      draftData.transactions.forEach((transaction, index) => {
        console.log(`${index + 1}. ${transaction.propertyName || 'Unnamed'}`);
        console.log(`   Has _key: ${transaction._key ? '✅ YES' : '❌ NO'}`);
        if (transaction._key) {
          console.log(`   Key: ${transaction._key}`);
        }
        console.log('');
      });
    } else {
      console.log('   No draft data found');
    }
    
    // Analysis summary
    const publishedMissingKeys = publishedData?.transactions ? publishedData.transactions.filter(t => !t._key).length : 0;
    const draftMissingKeys = draftData?.transactions ? draftData.transactions.filter(t => !t._key).length : 0;
    
    console.log('\n📊 Analysis Summary:');
    console.log(`   Published transactions missing keys: ${publishedMissingKeys}`);
    console.log(`   Draft transactions missing keys: ${draftMissingKeys}`);
    
    if (draftMissingKeys === 0 && draftData?.transactions?.length > 0) {
      console.log('\n✅ FIXED! Draft version has proper keys');
      console.log('🔧 Next steps:');
      console.log('1. Go to Sanity Studio (http://localhost:3333)');
      console.log('2. Open the Homepage document');
      console.log('3. You should see the Notable Transactions section is now editable');
      console.log('4. Publish the document to make the fixes live');
      console.log('');
      console.log('🎉 The missing keys issue has been resolved!');
    } else if (publishedMissingKeys > 0 || draftMissingKeys > 0) {
      console.log('\n🔧 Recommended Actions:');
      console.log('1. Go to Sanity Studio (http://localhost:3333)');
      console.log('2. Navigate to the Homepage document');
      console.log('3. Go to the Notable Transactions section');
      console.log('4. Remove all transactions from the list');
      console.log('5. Add them back one by one (this will auto-generate keys)');
      console.log('6. Publish the changes');
      
      console.log('\n💡 Alternative: Copy from draft to published');
      if (draftData?.transactions && draftData.transactions.length > 0 && draftData.transactions.every(t => t._key)) {
        console.log('   The draft version has proper keys. Consider publishing it.');
      }
    } else {
      console.log('\n✅ All transactions have proper keys!');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing key issues:', error);
  }
}

// Run analysis
analyzeKeyIssues();