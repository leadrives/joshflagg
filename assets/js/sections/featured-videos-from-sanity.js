/**
 * Featured Videos (Shorts) Section - Sanity Integration
 * Loads featured videos from Sanity homePage.featuredVideos
 * Fallback to existing static content if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for featured videos section
  const FEATURED_VIDEOS_QUERY = `*[_type=="homePage"][0]{
    featuredVideos {
      title,
      subtitle,
      videos[]{
        url,
        title
      }
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    section: '#featured-videos-section',
    title: '#featured-videos-section .section-title',
    subtitle: '#featured-videos-section .small-text',
    container: '.YouTubeShortsCarousel3D_root__viTF0'
  };

  /**
   * Update featured videos section content
   * @param {object} videosData - Featured videos data from Sanity
   */
  function updateFeaturedVideos(videosData) {
    if (!videosData) {
      console.log('ℹ️ No featured videos data available');
      return false;
    }

    try {
      console.log('📝 Updating featured videos with Sanity data...');

      // Update title
      if (videosData.title) {
        const titleEl = document.querySelector(SELECTORS.title);
        if (titleEl) {
          titleEl.textContent = videosData.title;
          console.log('✅ Updated featured videos title:', videosData.title);
        }
      }

      // Update subtitle
      if (videosData.subtitle) {
        const subtitleEl = document.querySelector(SELECTORS.subtitle);
        if (subtitleEl) {
          subtitleEl.textContent = videosData.subtitle;
          console.log('✅ Updated featured videos subtitle:', videosData.subtitle);
        }
      }

      // Update videos carousel
      if (videosData.videos && videosData.videos.length > 0 && typeof window.initYouTubeShorts3DCarousel === 'function') {
        console.log('🎬 Initializing 3D carousel with', videosData.videos.length, 'videos from Sanity');
        
        // Pass the videos array directly (expected format: [{url: "..."}])
        window.initYouTubeShorts3DCarousel(videosData.videos);
        console.log('✅ Featured videos carousel updated');
      } else {
        console.log('ℹ️ No videos in Sanity or init function missing, handling by fallback script');
        // Trigger default init if not already triggered (fallback script usually handles this, 
        // but if data was empty in Sanity, we might want to ensure default runs if we halted it?
        // In our case, the fallback script runs init with default data immediately, 
        // so this script effectively OVERRIDES it if data is present.
      }

      return true;

    } catch (error) {
      console.error('❌ Error updating featured videos:', error);
      return false;
    }
  }

  /**
   * Load and apply featured videos data from Sanity
   */
  async function loadFeaturedVideosFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available for featured videos section');
      return false;
    }

    try {
      console.log('🔄 Loading featured videos from Sanity...');
      
      // Query homepage data
      const result = await window.SanityRead.query(FEATURED_VIDEOS_QUERY);
      
      const videosData = result?.featuredVideos;
      
      if (!videosData) {
        console.warn('⚠️ No featured videos data found in Sanity');
        return false;
      }

      // Update section with Sanity data
      const success = updateFeaturedVideos(videosData);
      
      if (success) {
        console.log('✅ Featured videos loaded from Sanity successfully');
        window.__SANITY_VIDEOS_DONE__ = true;
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Failed to load featured videos from Sanity:', error);
      console.log('🔄 Keeping static fallback content');
      return false;
    }
  }
  
  /**
   * Initialize featured videos loader
   */
  function init() {
     // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Check if section exists on this page
    if (!document.querySelector(SELECTORS.section)) {
      console.log('ℹ️ Featured videos section not found on this page');
      return;
    }

    // Small delay to ensure SanityRead is initialized
    setTimeout(async () => {
       const success = await loadFeaturedVideosFromSanity();
       
       if (!success) {
         console.log('ℹ️ Featured videos: Using static fallback content');
       }
    }, 100); 
  }

  // Initialize
  init();

})();
