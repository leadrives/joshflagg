import { createClient } from '@sanity/client';
import 'dotenv/config';

// Get project configuration with fallbacks
const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.SANITY_API_VERSION || process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-06';
const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!projectId) {
  console.error('❌ Missing SANITY_PROJECT_ID in environment variables');
  console.error('💡 Add SANITY_PROJECT_ID to your .env file');
  process.exit(1);
}

if (!token) {
  console.error('❌ Missing SANITY_WRITE_TOKEN in environment variables');
  console.error('💡 Get a token from: https://manage.sanity.io/projects/' + projectId + '/settings/tokens');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false, // We want fresh data for writes
});

export default client;