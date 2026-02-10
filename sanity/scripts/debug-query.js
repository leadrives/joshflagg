import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01'
});

async function debugQuery() {
  try {
    console.log('🔍 Debug: Listing all homePage documents...');
    
    const allDocs = await client.fetch(`*[_type == "homePage"]{
      _id,
      _rev,
      title,
      "hasNotableTransactions": defined(notableTransactions),
      "transactionCount": count(notableTransactions.transactions)
    }`);
    
    console.log('All homePage documents:');
    console.log(JSON.stringify(allDocs, null, 2));
    
    if (allDocs.length > 0) {
      console.log('\n🔍 Checking first document transactions...');
      
      const firstDoc = allDocs[0];
      const transactions = await client.fetch(`*[_id == "${firstDoc._id}"][0].notableTransactions.transactions`);
      
      console.log('Transactions:');
      console.log(JSON.stringify(transactions, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugQuery();