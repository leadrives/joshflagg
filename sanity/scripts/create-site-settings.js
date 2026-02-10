// Script to create initial siteSettings document with navigation data
import { createClient } from '@sanity/client';

const writeClient = createClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-02-06',
  token: process.env.SANITY_WRITE_TOKEN,
});

async function createSiteSettings() {
  console.log('🔄 Creating siteSettings document...');

  try {
    const siteSettings = {
      _type: 'siteSettings',
      title: 'Mohamad Ahmad - Real Estate',
      description: 'One of UAE\'s most successful luxury real estate agents with $3B+ in total sales volume',
      navigation: {
        leftLinks: [
          {
            label: 'ABOUT AHMAD',
            url: '#about-carousel',
            isModal: false
          },
          {
            label: 'NOTABLE SALES',
            url: '#notable-transactions', 
            isModal: false
          },
          {
            label: 'ALL PROJECTS',
            url: '#',
            isModal: true,
            modalTarget: '#projectsModal'
          }
        ],
        rightLinks: [
          {
            label: 'SEARCH HOMES',
            url: '#neighborhoods-section',
            isButton: false,
            isModal: false
          },
          {
            label: 'BOOK AN APPOINTMENT',
            url: '#',
            isButton: true,
            isModal: true,
            modalTarget: '#consultationModal'
          }
        ]
      }
    };

    const result = await writeClient.create(siteSettings);
    console.log('✅ SiteSettings document created:', result._id);
    console.log('📋 Navigation data:', result.navigation);

  } catch (error) {
    console.error('❌ Failed to create siteSettings:', error);
  }
}

createSiteSettings();