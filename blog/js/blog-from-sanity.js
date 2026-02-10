/**
 * Blog Data from Sanity
 * Loads blog posts from Sanity and provides data in the format blog-manager.js expects
 * Stores data globally for blog-manager to consume
 */

(function() {
  'use strict';

  // GROQ query for blog posts
  const BLOG_POSTS_QUERY = `*[_type=="blogPost"]|order(publishedDate desc){
    _id,
    title,
    slug,
    excerpt,
    featuredImage{
      asset->{url}
    },
    publishedDate,
    category,
    tags,
    featured,
    readTimeText,
    readingTime,
    author{
      name,
      bio
    },
    content,
    seoSettings{
      metaTitle,
      metaDescription
    }
  }`;

  /**
   * Convert Sanity blog data to the format blog-manager.js expects
   * @param {array} sanityPosts - Blog posts from Sanity
   * @returns {object} - Formatted blog data object
   */
  function formatBlogData(sanityPosts) {
    if (!Array.isArray(sanityPosts)) return { blogs: [] };

    const formattedBlogs = sanityPosts.map(post => ({
      // Core fields expected by blog-manager
      id: post.slug?.current || post._id,
      title: post.title || 'Untitled Post',
      slug: post.slug?.current || post._id,
      author: post.author?.name || 'Mohamad Ahmad',
      date: post.publishedDate || new Date().toISOString().split('T')[0],
      readTime: post.readTimeText || (post.readingTime ? `${post.readingTime} min read` : '5 min read'),
      category: post.category || 'Market Analysis',
      tags: post.tags || [],
      excerpt: post.excerpt || '',
      featuredImage: getImageUrl(post.featuredImage),
      featured: post.featured || false,
      
      // Additional fields that might be used
      content: {
        introduction: post.excerpt || ''
      },
      
      // SEO fields
      metaTitle: post.seoSettings?.metaTitle || post.title,
      metaDescription: post.seoSettings?.metaDescription || post.excerpt
    }));

    return {
      blogs: formattedBlogs
    };
  }

  /**
   * Get image URL with fallback
   * @param {object} imageField - Sanity image field
   * @returns {string} - Image URL or fallback
   */
  function getImageUrl(imageField) {
    const sanityUrl = imageField?.asset?.url;
    
    if (sanityUrl) {
      return sanityUrl;
    }
    
    // Fallback images based on context
    const fallbacks = [
      'images/featured-blog.avif',
      '../assets/images/featured-blog.avif',
      'blog/images/featured-blog.avif'
    ];
    
    // Return first fallback for now
    return fallbacks[0];
  }

  /**
   * Format blog data for homepage preview
   * @param {array} sanityPosts - Blog posts from Sanity
   * @returns {object} - Homepage blog preview data
   */
  function formatHomepagePreviews(sanityPosts) {
    if (!Array.isArray(sanityPosts) || sanityPosts.length === 0) {
      return null;
    }

    // Get featured post or first post
    const featuredPost = sanityPosts.find(post => post.featured) || sanityPosts[0];
    
    // Get 2 additional recent posts for small cards (excluding featured)
    const recentPosts = sanityPosts
      .filter(post => post._id !== featuredPost._id)
      .slice(0, 2);

    return {
      featured: {
        title: featuredPost.title,
        slug: featuredPost.slug?.current || featuredPost._id,
        featuredImage: getImageUrl(featuredPost.featuredImage),
        excerpt: featuredPost.excerpt
      },
      recent: recentPosts.map(post => ({
        title: post.title,
        slug: post.slug?.current || post._id,
        featuredImage: getImageUrl(post.featuredImage),
        excerpt: post.excerpt
      }))
    };
  }

  /**
   * Update homepage blog preview section
   * @param {object} previewData - Homepage preview data
   */
  function updateHomepagePreviews(previewData) {
    if (!previewData) return;

    // Update featured post
    const featuredLink = document.querySelector('.recent-featured-post .recent-post-card');
    const featuredImg = featuredLink?.querySelector('img');
    const featuredTitle = featuredLink?.querySelector('.post-title');
    
    if (featuredLink && previewData.featured) {
      featuredLink.href = `blog/${previewData.featured.slug}.html`;
      if (featuredImg) {
        featuredImg.src = previewData.featured.featuredImage;
        featuredImg.alt = previewData.featured.title;
      }
      if (featuredTitle) {
        featuredTitle.textContent = previewData.featured.title;
      }
    }

    // Update recent posts
    const smallCards = document.querySelectorAll('.recent-posts-grid .recent-post-card.small');
    previewData.recent.forEach((post, index) => {
      if (smallCards[index]) {
        const card = smallCards[index];
        const img = card.querySelector('img');
        const title = card.querySelector('.post-title');
        
        card.href = `blog/${post.slug}.html`;
        if (img) {
          img.src = post.featuredImage;
          img.alt = post.title;
        }
        if (title) {
          title.textContent = post.title;
        }
      }
    });

    console.log('✅ Homepage blog previews updated from Sanity');
  }

  /**
   * Load and process blog data from Sanity
   */
  async function loadBlogsFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available, blog-manager will use JSON fallback');
      return false;
    }

    try {
      console.log('🔄 Loading blog posts from Sanity...');
      
      // Query Sanity for blog posts
      const sanityPosts = await window.SanityRead.query(BLOG_POSTS_QUERY);
      
      if (!sanityPosts || sanityPosts.length === 0) {
        console.warn('⚠️ No blog posts found in Sanity, using JSON fallback');
        return false;
      }

      console.log('📦 Blog posts loaded from Sanity:', sanityPosts.length, 'posts');

      // Format data for blog-manager
      const formattedData = formatBlogData(sanityPosts);
      
      // Store globally for blog-manager to consume
      window.__SANITY_BLOGS__ = formattedData;
      
      // Update homepage previews if on homepage
      if (document.querySelector('.recent-posts-section')) {
        const previewData = formatHomepagePreviews(sanityPosts);
        updateHomepagePreviews(previewData);
      }
      
      console.log('✅ Blog data from Sanity ready for consumption');
      
      // Log sample of formatted data for debugging
      console.log('📊 Sample blog data:', formattedData.blogs.slice(0, 2));
      
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load blog posts from Sanity:', error);
      console.log('🔄 blog-manager will fall back to JSON data');
      return false;
    }
  }

  /**
   * Initialize blog data loading
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Small delay to ensure SanityRead is initialized
    setTimeout(async () => {
      const success = await loadBlogsFromSanity();
      
      if (success) {
        // Dispatch event to notify blog-manager that Sanity data is ready
        window.dispatchEvent(new CustomEvent('sanity-blogs-loaded', {
          detail: { blogData: window.__SANITY_BLOGS__ }
        }));
      }
    }, 300); // Run before blog-manager initializes
  }

  // Initialize
  init();

})();