import fs from 'fs';
import path from 'path';
import writeClient from '../lib/sanityClientWrite.js';
import { uploadAsset, resolveImagePath } from './_utils/assetUploader.js';

const DRY_RUN = process.env.DRY_RUN === '1';

/**
 * Generate deterministic document ID
 */
function generateDocId(legacyId) {
  return `blogPost.${legacyId}`;
}

/**
 * Convert text content to Portable Text blocks
 */
function textToPortableText(text) {
  if (!text) return [];
  
  // Split by paragraphs and create blocks
  return text.split('\n\n')
    .filter(para => para.trim())
    .map(para => ({
      _type: 'block',
      _key: Math.random().toString(36).substr(2, 9),
      style: 'normal',
      children: [{
        _type: 'span',
        _key: Math.random().toString(36).substr(2, 9),
        text: para.trim(),
        marks: []
      }]
    }));
}

/**
 * Convert blog sections to Portable Text
 */
function sectionsToPortableText(sections) {
  if (!sections || !Array.isArray(sections)) return [];
  
  const blocks = [];
  
  sections.forEach(section => {
    // Add section title as h2
    if (section.title) {
      blocks.push({
        _type: 'block',
        _key: Math.random().toString(36).substr(2, 9),
        style: 'h2',
        children: [{
          _type: 'span',
          _key: Math.random().toString(36).substr(2, 9),
          text: section.title,
          marks: []
        }]
      });
    }
    
    // Add section content as paragraphs
    if (section.content) {
      const contentBlocks = textToPortableText(section.content);
      blocks.push(...contentBlocks);
    }
  });
  
  return blocks;
}

/**
 * Convert complete blog content to Portable Text
 */
function convertContentToPortableText(blogData) {
  const blocks = [];
  
  // Add introduction
  if (blogData.content?.introduction) {
    const introBlocks = textToPortableText(blogData.content.introduction);
    blocks.push(...introBlocks);
  }
  
  // Add sections
  if (blogData.content?.sections) {
    const sectionBlocks = sectionsToPortableText(blogData.content.sections);
    blocks.push(...sectionBlocks);
  }
  
  // Add conclusion
  if (blogData.content?.conclusion) {
    const conclusionBlocks = textToPortableText(blogData.content.conclusion);
    blocks.push(...conclusionBlocks);
  }
  
  return blocks;
}

/**
 * Convert blog JSON to Sanity document
 */
async function convertBlogToSanity(blogData) {
  const {
    id,
    title,
    slug,
    excerpt,
    featuredImage,
    date,
    readTime,
    category,
    tags,
    featured,
    content,
    relatedArticles
  } = blogData;

  // Upload featured image
  let featuredImageAsset = null;
  if (featuredImage) {
    // Blog images are typically in blog/images/
    const imagePath = featuredImage.startsWith('images/') 
      ? `blog/${featuredImage}` 
      : featuredImage;
    
    const absolutePath = resolveImagePath(imagePath);
    featuredImageAsset = await uploadAsset(absolutePath, imagePath);
  }

  // Convert content to Portable Text
  const portableTextContent = convertContentToPortableText(blogData);

  // Build Sanity document
  const sanityDoc = {
    _id: generateDocId(id),
    _type: 'blogPost',
    legacyId: id,
    title,
    slug: {
      _type: 'slug',
      current: slug
    },
    excerpt,
    publishedDate: date,
    readTimeText: readTime,
    category,
    tags: Array.isArray(tags) ? tags : [],
    featured: Boolean(featured),
    content: portableTextContent
  };

  // Add featured image if uploaded successfully
  if (featuredImageAsset) {
    sanityDoc.featuredImage = featuredImageAsset;
  }

  // Handle related articles (store as slugs for now)
  if (relatedArticles && Array.isArray(relatedArticles)) {
    sanityDoc.relatedArticleSlugs = relatedArticles;
  }

  return sanityDoc;
}

/**
 * Upsert blog document
 */
async function upsertBlog(sanityDoc) {
  try {
    const { legacyId, _id } = sanityDoc;
    
    if (DRY_RUN) {
      console.log(`[DRY RUN] Would upsert blog: ${legacyId}`);
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
      
      console.log(`✅ Updated blog: ${legacyId}`);
      return { created: false, updated: true, document: updated };
    } else {
      // Create new document
      const created = await writeClient.create(sanityDoc);
      
      console.log(`🆕 Created blog: ${legacyId}`);
      return { created: true, updated: false, document: created };
    }
  } catch (error) {
    console.error(`❌ Failed to upsert blog ${sanityDoc.legacyId}:`, error.message);
    return { created: false, updated: false, error: error.message };
  }
}

/**
 * Link related articles by slug (second pass)
 */
async function linkRelatedArticles() {
  if (DRY_RUN) {
    console.log('[DRY RUN] Would link related articles');
    return;
  }

  try {
    console.log('\n🔗 Linking related articles...');
    
    // Get all blog posts with relatedArticleSlugs
    const blogsWithRelated = await writeClient.fetch(`
      *[_type == "blogPost" && defined(relatedArticleSlugs)] {
        _id,
        legacyId,
        relatedArticleSlugs
      }
    `);

    for (const blog of blogsWithRelated) {
      if (!blog.relatedArticleSlugs || blog.relatedArticleSlugs.length === 0) continue;
      
      // Find related articles by slug
      const relatedRefs = [];
      for (const slug of blog.relatedArticleSlugs) {
        const relatedBlog = await writeClient.fetch(`
          *[_type == "blogPost" && slug.current == $slug][0] { _id }
        `, { slug });
        
        if (relatedBlog) {
          relatedRefs.push({
            _type: 'reference',
            _ref: relatedBlog._id
          });
        }
      }
      
      if (relatedRefs.length > 0) {
        await writeClient
          .patch(blog._id)
          .set({ relatedArticles: relatedRefs })
          .unset(['relatedArticleSlugs'])
          .commit();
        
        console.log(`🔗 Linked ${relatedRefs.length} related articles for: ${blog.legacyId}`);
      }
    }
  } catch (error) {
    console.error('❌ Error linking related articles:', error.message);
  }
}

/**
 * Import blogs from JSON
 */
async function importBlogs() {
  console.log('🚀 Starting blog import...\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Read blogs JSON
    const jsonPath = path.resolve(process.cwd(), '../blog/data/blogs.json');
    const blogsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let created = 0;
    let updated = 0;
    let failed = 0;
    let missingImages = [];

    // Process each blog
    console.log('📝 Processing blog posts...');
    if (blogsData.blogs && Array.isArray(blogsData.blogs)) {
      for (const blog of blogsData.blogs) {
        try {
          const sanityDoc = await convertBlogToSanity(blog);
          const result = await upsertBlog(sanityDoc);
          
          if (result.created) created++;
          if (result.updated) updated++;
          if (result.error) failed++;
          
          // Track missing images
          if (blog.featuredImage && !sanityDoc.featuredImage) {
            missingImages.push(`${blog.id}: ${blog.featuredImage}`);
          }
        } catch (error) {
          console.error(`❌ Failed to process blog ${blog.id}:`, error.message);
          failed++;
        }
      }
    }

    // Link related articles
    if (!DRY_RUN) {
      await linkRelatedArticles();
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
  importBlogs()
    .then(() => {
      console.log('\n🎉 Blog import completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}