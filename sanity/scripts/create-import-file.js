/**
 * Restore Notable Transactions Draft with Keys
 * 
 * This script recreates the draft with proper _key values so you can publish it.
 */

import fs from 'fs';

// Generate the complete NDJSON data for import (preserving all existing data)
const homepageData = {
  _id: 'drafts.homePage',
  _type: 'homePage',
  title: 'Homepage',
  aboutCarousel: {
    slides: [
      {
        _key: 'bb37d5c53bfe',
        cta: 'Note',
        description: 'Known as one of Dubai\'s premier luxury real estate specialists, Ahmad is a contributor to several real estate publications, news and television outlets. He has been featured in Emirates Business, Gulf News, Arabian Business Magazine and Property Finder among others. Follow him for the latest luxury news, and come back for weekly videos and highlights.',
        image: {
          _type: 'image',
          alt: 'test',
          asset: {
            _ref: 'image-148bf93ccfbef80c482140752c0b6f3cd948d493-1158x1551-webp',
            _type: 'reference'
          }
        },
        title: 'A GLOBAL LUXURY LIFESTYLE EXPERT'
      },
      {
        _key: 'b510994d2995',
        cta: 'Know More',
        description: 'Ahmad\'s record-selling achievements include the highest sale in Downtown Dubai, the most expensive penthouse transaction in Dubai Marina, the record-breaking sale in Emirates Hills, as well as the largest villa sale in Palm Jumeirah. He sold the property for just under 150,000,000 AED. He has also been the listing agent for reputable estates including luxury penthouses in Burj Khalifa and exclusive villas in Emirates Hills.',
        image: {
          _type: 'image',
          alt: 'Ahamd',
          asset: {
            _ref: 'image-09a71c4a1710423e0c067bf0a2e8a90f4e5e7012-1067x1600-jpg',
            _type: 'reference'
          }
        },
        title: '$3B+ in Total Sales'
      },
      {
        _key: 'e1e29a90c83c',
        cta: 'Get A Call',
        description: 'Mohamad Ahmad is one of UAE\'s most successful and sought-after Dubai luxury real estate agents, having completed more than 11 billion AED in residential real estate sales in the past decade. Ahmad has been recognized by Gulf News as one of the top-ranked agents in Dubai and nationally by sales volume and as a top 25 real estate agent in the region by Arabian Business.',
        image: {
          _type: 'image',
          alt: 'Ahamd',
          asset: {
            _ref: 'image-836bdff4a50ad2e92446ca9bed31d979f8780c58-3648x5472-png',
            _type: 'reference'
          }
        },
        title: 'Global Luxury Recognition'
      }
    ]
  },
  heroSection: {
    ctaText: 'Find Home ',
    heroImage: {
      _type: 'image',
      asset: {
        _ref: 'image-af52a2742ff1344d72536c7ce7aa66b281711c30-3000x2000-heif',
        _type: 'reference'
      }
    },
    heroVideo: {
      _type: 'file',
      asset: {
        _ref: 'file-a383dd4db130272e5d0ffd865914f3f8d022ef45-mp4',
        _type: 'reference'
      }
    },
    mediaType: 'image',
    subtitle: 'OVER $3B+ IN TOTAL SALES VOLUME PER THE LABJ 2024',
    title: 'One of UAE\'s Most\\nSuccessful and Sought after\\nLuxury Real Estate Agents'
  },
  notableTransactions: {
    title: 'Notable Transactions',
    subtitle: '$3B+ in total sales volume',
    transactions: [
      {
        _key: 'palmJumeirahVilla2024',
        propertyName: 'Palm Jumeirah Villa',
        location: 'Palm Jumeirah, Dubai',
        salePrice: '150,000,000 AED',
        saleDate: '2023-08-15',
        description: 'Luxury waterfront villa with private beach access and panoramic views of Dubai Marina skyline.',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-5c17d9eb858423f25b25f6b25d4ef67806798ff7-5035x3466-webp'
          }
        }
      },
      {
        _key: 'downtownDubaiPenthouse2024',
        propertyName: 'Downtown Dubai Penthouse',
        location: 'Downtown Dubai',
        salePrice: '85,000,000 AED',
        saleDate: '2023-06-20',
        description: 'Ultra-luxury penthouse in the heart of Downtown Dubai with spectacular Burj Khalifa views.',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-e4ce01943705854f5fc58cbff490ee06f093d827-1800x1029-webp'
          }
        }
      },
      {
        _key: 'dubaiMarinaTower2024',
        propertyName: 'Dubai Marina Tower',
        location: 'Dubai Marina',
        salePrice: '65,000,000 AED',
        saleDate: '2023-04-10',
        description: 'Premium high-rise residence offering stunning marina and Arabian Gulf vistas.',
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: 'image-1ff831bc37a28ea7dc3ea66138374c3e15810a0a-1718x1069-jpg'
          }
        }
      }
    ]
  }
};

// Create NDJSON file for import
const ndjsonContent = JSON.stringify(homepageData) + '\n';

fs.writeFileSync('notable-transactions-import.ndjson', ndjsonContent);

console.log('📄 Created notable-transactions-import.ndjson');
console.log('');
console.log('🔧 To import and fix the keys:');
console.log('');
console.log('1. Run the import command:');
console.log('   npx sanity dataset import notable-transactions-import.ndjson production --replace');
console.log('');
console.log('2. Go to Sanity Studio (http://localhost:3333)');
console.log('3. You should see the Homepage with Notable Transactions (with proper keys)');
console.log('4. Publish the document to make the fix live');
console.log('');
console.log('⚠️  WARNING: --replace will overwrite the existing homePage document');
console.log('   Make sure you have the backup we created earlier!');