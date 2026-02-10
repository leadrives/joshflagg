import { createClient } from 'sanity'

// Read-only client (no token needed for public data)
export const client = createClient({
  projectId: 'xwla8vtz', // Your project ID from sanity.config.ts
  dataset: 'production',
  apiVersion: '2024-02-06',
  useCdn: false, // Don't use CDN for fresh data during development
})

// Write client (requires authentication token)
export const writeClient = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production', 
  apiVersion: '2024-02-06',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // You'll need to set this for write operations
})