import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import writeClient from '../../lib/sanityClientWrite.js';

const CACHE_FILE = path.join(process.cwd(), 'scripts/.asset-cache.json');

/**
 * Load asset cache from disk
 */
function loadAssetCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (error) {
    console.warn('Warning: Could not load asset cache:', error.message);
  }
  return {};
}

/**
 * Save asset cache to disk
 */
function saveAssetCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Error saving asset cache:', error.message);
  }
}

/**
 * Calculate SHA1 hash of file
 */
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(fileBuffer).digest('hex');
}

/**
 * Get MIME type from file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'image/jpeg';
}

/**
 * Upload asset to Sanity and return image field value
 * @param {string} absoluteFilePath - Absolute path to the file
 * @param {string} originalRelativePath - Original relative path for reference
 * @param {Object} options - Options object
 * @param {string} options.mimeType - Optional mime type override
 * @returns {Promise<Object>} Sanity image field value or null if file not found
 */
export async function uploadAsset(absoluteFilePath, originalRelativePath, options = {}) {
  try {
    // Check if file exists
    if (!fs.existsSync(absoluteFilePath)) {
      console.warn(`⚠️  File not found: ${absoluteFilePath}`);
      return null;
    }

    // Load cache
    const cache = loadAssetCache();
    
    // Calculate file hash
    const fileHash = getFileHash(absoluteFilePath);
    
    // Check if asset is already uploaded
    if (cache[fileHash]) {
      console.log(`✓ Using cached asset: ${originalRelativePath}`);
      return {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: cache[fileHash].assetId
        }
      };
    }

    // Determine MIME type
    const mimeType = options.mimeType || getMimeType(absoluteFilePath);
    
    // Read file
    const fileStream = fs.createReadStream(absoluteFilePath);
    
    console.log(`📤 Uploading: ${originalRelativePath}`);
    
    // Upload to Sanity
    const uploadedAsset = await writeClient.assets.upload('image', fileStream, {
      filename: path.basename(absoluteFilePath),
      contentType: mimeType,
    });

    // Cache the result
    cache[fileHash] = {
      assetId: uploadedAsset._id,
      url: uploadedAsset.url,
      originalPath: originalRelativePath,
      uploadedAt: new Date().toISOString()
    };
    
    // Save cache
    saveAssetCache(cache);
    
    console.log(`✅ Uploaded: ${originalRelativePath} -> ${uploadedAsset._id}`);
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: uploadedAsset._id
      }
    };
    
  } catch (error) {
    console.error(`❌ Failed to upload ${originalRelativePath}:`, error.message);
    return null;
  }
}

/**
 * Resolve relative path to absolute path from repo root
 * @param {string} relativePath - Path like "assets/images/..." or "blog/images/..."
 * @returns {string} Absolute path
 */
export function resolveImagePath(relativePath) {
  // Get repo root (2 levels up from this file: /sanity/scripts/)
  const repoRoot = path.resolve(process.cwd(), '../');
  
  // Handle both with and without leading slash
  const cleanPath = relativePath.replace(/^\/+/, '');
  
  return path.join(repoRoot, cleanPath);
}

/**
 * Upload multiple assets
 * @param {Array} imageArray - Array of image paths
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of Sanity image field values
 */
export async function uploadAssets(imageArray, options = {}) {
  const results = [];
  
  for (const imagePath of imageArray) {
    if (!imagePath) continue;
    
    const absolutePath = resolveImagePath(imagePath);
    const result = await uploadAsset(absolutePath, imagePath, options);
    
    if (result) {
      results.push(result);
    }
  }
  
  return results;
}