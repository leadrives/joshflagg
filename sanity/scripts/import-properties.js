import fs from 'fs';
import path from 'path';
import writeClient from '../lib/sanityClientWrite.js';
import { uploadAsset, resolveImagePath } from './_utils/assetUploader.js';

const DRY_RUN = process.env.DRY_RUN === '1';

/**
 * Generate deterministic document ID
 */
function generateDocId(legacyId) {
  return `property.${legacyId}`;
}

/**
 * Convert property JSON to Sanity document
 */
async function convertPropertyToSanity(propertyData, listingType) {
  const {
    id,
    name,
    title,
    price,
    currency,
    status,
    saleDate,
    community,
    location,
    fullAddress,
    bedrooms,
    area,
    handover,
    paymentPlan,
    description,
    images = {}
  } = propertyData;

  // Upload images
  let mainImage = null;
  let heroImage = null;

  if (images.main) {
    const absolutePath = resolveImagePath(images.main);
    mainImage = await uploadAsset(absolutePath, images.main);
  }

  if (images.hero) {
    const absolutePath = resolveImagePath(images.hero);
    heroImage = await uploadAsset(absolutePath, images.hero);
  }

  // Build Sanity document
  const sanityDoc = {
    _id: generateDocId(id),
    _type: 'property',
    legacyId: id,
    listingType,
    title: title || name,
    priceDisplay: price,
    currency: currency || 'AED',
    status,
    saleDate,
    community,
    location: location || fullAddress,
    fullAddress: fullAddress || location,
    bedroomsDisplay: bedrooms,
    areaDisplay: area,
    handover,
    paymentPlan,
    description
  };

  // Add images if uploaded successfully
  if (mainImage) {
    sanityDoc.mainImage = mainImage;
  }
  
  if (heroImage) {
    sanityDoc.heroImage = heroImage;
  }

  return sanityDoc;
}

/**
 * Upsert property document
 */
async function upsertProperty(sanityDoc) {
  try {
    const { legacyId, _id } = sanityDoc;
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would upsert property: ${legacyId} (${sanityDoc.listingType})`);
      return { created: false, updated: false, dryRun: true };
    }

    // Check if document exists
    const existing = await writeClient.getDocument(_id);
    
    if (existing) {
      // Update existing document
      const updated = await writeClient
        .patch(_id)
        .set(sanityDoc)
        .commit();
      
      console.log(`✅ Updated property: ${legacyId} (${sanityDoc.listingType})`);
      return { created: false, updated: true, document: updated };
    } else {
      // Create new document
      const created = await writeClient.create(sanityDoc);
      
      console.log(`🆕 Created property: ${legacyId} (${sanityDoc.listingType})`);
      return { created: true, updated: false, document: created };
    }
  } catch (error) {
    console.error(`❌ Failed to upsert property ${sanityDoc.legacyId}:`, error.message);
    return { created: false, updated: false, error: error.message };
  }
}

/**
 * Import properties from JSON
 */
async function importProperties() {
  console.log('🚀 Starting property import...\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Read properties JSON
    const jsonPath = path.resolve(process.cwd(), '../assets/data/properties.json');
    const propertiesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let created = 0;
    let updated = 0;
    let failed = 0;
    let missingImages = [];

    // Process notable transactions
    console.log('📋 Processing Notable Transactions...');
    if (propertiesData.notableTransactions) {
      for (const property of propertiesData.notableTransactions) {
        try {
          const sanityDoc = await convertPropertyToSanity(property, 'notable');
          const result = await upsertProperty(sanityDoc);
          
          if (result.created) created++;
          if (result.updated) updated++;
          if (result.error) failed++;
          
          // Track missing images
          if (property.images?.main && !sanityDoc.mainImage) {
            missingImages.push(`${property.id}: ${property.images.main}`);
          }
          if (property.images?.hero && !sanityDoc.heroImage) {
            missingImages.push(`${property.id}: ${property.images.hero}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process notable transaction ${property.id}:`, error.message);
          failed++;
        }
      }
    }

    // Process exclusive listings
    console.log('\n📋 Processing Exclusive Listings...');
    if (propertiesData.exclusiveListings) {
      for (const property of propertiesData.exclusiveListings) {
        try {
          const sanityDoc = await convertPropertyToSanity(property, 'exclusive');
          const result = await upsertProperty(sanityDoc);
          
          if (result.created) created++;
          if (result.updated) updated++;
          if (result.error) failed++;
          
          // Track missing images
          if (property.images?.main && !sanityDoc.mainImage) {
            missingImages.push(`${property.id}: ${property.images.main}`);
          }
          if (property.images?.hero && !sanityDoc.heroImage) {
            missingImages.push(`${property.id}: ${property.images.hero}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process exclusive listing ${property.id}:`, error.message);
          failed++;
        }
      }
    }

    // Print summary
    console.log('\n📊 IMPORT SUMMARY');
    console.log('==================');
    console.log(`✅ Created: ${created}`);
    console.log(`🔄 Updated: ${updated}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (missingImages.length > 0) {
      console.log(`\n📁 Missing Image Files (${missingImages.length}):`);
      missingImages.forEach(img => console.log(`   - ${img}`));
    }
    
    if (DRY_RUN) {
      console.log('\n💡 This was a DRY RUN. Set DRY_RUN=0 to perform actual import.');
    }

  } catch (error) {
    console.error('💥 Fatal error during import:', error);
    process.exit(1);
  }
}

// Run import
if (import.meta.url === `file://${process.argv[1]}`) {
  importProperties()
    .then(() => {
      console.log('\n🎉 Property import completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}