/**
 * Publish Draft HomePage
 * Publishes the draft homePage document to make testimonialsSection live
 */

import {createClient} from '@sanity/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-02-06',
  token: process.env.SANITY_WRITE_TOKEN
});

async function publishHomePage() {
  console.log('🚀 Publishing draft homePage...');

  try {
    // Get the draft document
    const draft = await client.getDocument('drafts.homePage');
    
    if (!draft) {
      console.log('❌ No draft homePage found');
      return;
    }

    console.log('📝 Found draft homePage with testimonialsSection:', !!draft.testimonialsSection);

    // Create published version by removing the 'drafts.' prefix from _id
    const publishedDoc = {
      ...draft,
      _id: draft._id.replace('drafts.', '')
    };

    // Create or update the published document
    await client.createOrReplace(publishedDoc);
    
    // Delete the draft
    await client.delete('drafts.homePage');

    console.log('✅ Successfully published homePage');
    console.log('🎯 testimonialsSection is now live!');
    
  } catch (error) {
    console.error('❌ Error publishing homePage:', error);
    process.exit(1);
  }
}

publishHomePage();