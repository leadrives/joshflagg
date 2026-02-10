/**
 * Fix Notable Transactions Missing Keys
 * 
 * This script fixes the missing _key properties in the Notable Transactions array
 * that are required for Sanity Studio to properly edit the list.
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';

// Sanity client configuration
const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN
});

async function fixNotableTransactionKeys() {
  console.log('🔧 Fixing Notable Transactions missing keys...');
  
  try {
    // Get current homePage document
    const homePage = await client.getDocument('homePage');
    console.log('✅ Retrieved homePage document');
    
    // Check if notable transactions exist and have missing keys
    if (!homePage.notableTransactions?.transactions) {
      console.log('❌ No notable transactions found');
      return;
    }
    
    const transactions = homePage.notableTransactions.transactions;
    console.log(`📋 Found ${transactions.length} transactions`);
    
    // Check which transactions are missing keys
    const transactionsWithoutKeys = transactions.filter(t => !t._key);
    console.log(`🔍 Found ${transactionsWithoutKeys.length} transactions without keys`);
    
    if (transactionsWithoutKeys.length === 0) {
      console.log('✅ All transactions already have keys!');
      return;
    }
    
    // Add keys to transactions that don't have them
    const transactionsWithKeys = transactions.map((transaction, index) => {
      if (!transaction._key) {
        // Generate unique key based on property name
        const baseKey = transaction.propertyName?.replace(/\s+/g, '') || `transaction${index + 1}`;
        const uniqueKey = `${baseKey}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        
        console.log(`🔑 Adding key "${uniqueKey}" to ${transaction.propertyName}`);
        
        return {
          ...transaction,
          _key: uniqueKey
        };
      }
      return transaction;
    });
    
    // Update the document
    const result = await client
      .patch('homePage')
      .set({
        'notableTransactions.transactions': transactionsWithKeys
      })
      .commit();
    
    console.log('✅ Successfully updated Notable Transactions with keys');
    
    // Also update draft if it exists
    try {
      const draftHomePage = await client.getDocument('drafts.homePage');
      if (draftHomePage) {
        console.log('🔧 Updating draft version as well...');
        
        await client
          .patch('drafts.homePage')
          .set({
            'notableTransactions.transactions': transactionsWithKeys
          })
          .commit();
        
        console.log('✅ Successfully updated draft Notable Transactions with keys');
      }
    } catch (draftError) {
      console.log('ℹ️ No draft version found, which is okay');
    }
    
    // Verification
    console.log('\n📋 Verification of Updated Transactions:');
    transactionsWithKeys.forEach((transaction, index) => {
      console.log(`${index + 1}. ${transaction.propertyName}`);
      console.log(`   Key: ${transaction._key}`);
      console.log(`   Price: ${transaction.salePrice}`);
      console.log(`   Location: ${transaction.location}\n`);
    });
    
    console.log('🎉 Notable Transactions keys fixed successfully!');
    console.log('📝 You can now edit the Notable Transactions list in Sanity Studio');
    
  } catch (error) {
    console.error('❌ Error fixing Notable Transactions keys:', error);
    process.exit(1);
  }
}

// Run the script
fixNotableTransactionKeys();