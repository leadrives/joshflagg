import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env from sanity/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2024-02-06',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const VALLEY_ID = '24e7821d-de38-4983-b386-db9f50e16698';
const GRAND_POLO_ID = 'fa0142d5-58be-4d96-8294-0a4a84c848bf';

const communityMap = {
  'The Valley': VALLEY_ID,
  'Grand Polo Club & Resort': GRAND_POLO_ID
};

async function migrate() {
  console.log('Starting migration...');
  // Fetch both published and drafts
  const properties = await client.fetch('*[_type == "property"]');

  for (const doc of properties) {
    if (typeof doc.community === 'string' && communityMap[doc.community]) {
      console.log(`Migrating property: ${doc.title} (${doc._id})`);
      
      const newRef = {
        _type: 'reference',
        _ref: communityMap[doc.community]
      };

      try {
        await client
          .patch(doc._id)
          .set({ community: newRef })
          .commit();
        console.log(`✅ Updated ${doc.title}`);
      } catch (err) {
        console.error(`❌ Failed to update ${doc.title}:`, err.message);
      }
    } else {
      console.log(`Skipping ${doc.title}: Community is ${JSON.stringify(doc.community)}`);
    }
  }
}

migrate().catch(console.error);
