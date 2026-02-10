/**
 * About/Expertise Section - Sanity Integration
 * Loads expertise section content from Sanity homePage.aboutSection
 * Fallback to existing static content if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for about/expertise section
  const ABOUT_SECTION_QUERY = `*[_type=="homePage"][0]{
    aboutSection{
      title,
      content,
      expertiseImage{
        asset->{url},
        alt
      },
      achievements[]{
        number,
        label,
        description
      }
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    section: '.expertise-section',
    title: '.ahmad-custom-titles h3',
    subtitle: '.ahmad-custom-titles h2', 
    content: '.ahmad-custom-titles + p',
    image: '.hoverable-image__img-col img',
    imageContainer: '.hoverable-image__img-col .full-bleed > div'
  };

  /**
   * Convert Sanity block content to HTML
   * @param {array} content - Sanity block content array
   * @returns {string} - HTML string
   */
  function blockContentToHtml(content) {
    if (!Array.isArray(content)) return '';
    
    return content.map(block => {
      if (block._type === 'block') {
        const text = block.children
          ?.map(child => child.text || '')
          .join('') || '';
        
        // Apply block styles
        switch (block.style) {
          case 'h1': return `<h1>${text}</h1>`;
          case 'h2': return `<h2>${text}</h2>`;
          case 'h3': return `<h3>${text}</h3>`;
          case 'h4': return `<h4>${text}</h4>`;
          case 'h5': return `<h5>${text}</h5>`;
          case 'h6': return `<h6>${text}</h6>`;
          case 'blockquote': return `<blockquote>${text}</blockquote>`;
          default: return `<p>${text}</p>`;
        }
      }
      return '';
    }).join('');
  }

  /**
   * Update expertise section content
   * @param {object} sectionData - About section data from Sanity
   */
  function updateExpertiseSection(sectionData) {
    if (!sectionData) {
      console.log('ℹ️ No about section data available');
      return false;
    }

    try {
      console.log('📝 Updating expertise section with Sanity data...');

      // Update title
      if (sectionData.title) {
        const titleElement = document.querySelector(SELECTORS.title);
        if (titleElement) {
          titleElement.textContent = sectionData.title;
          console.log('✅ Updated expertise title:', sectionData.title);
        }
      }

      // Update content from Sanity blocks
      if (sectionData.content && sectionData.content.length > 0) {
        const contentElement = document.querySelector(SELECTORS.content);
        if (contentElement) {
          // Convert block content to HTML
          const htmlContent = blockContentToHtml(sectionData.content);
          if (htmlContent.trim()) {
            contentElement.innerHTML = htmlContent;
            console.log('✅ Updated expertise content from Sanity blocks');
          }
        }
      }

      // Update expertise image
      if (sectionData.expertiseImage?.asset?.url) {
        const imageElement = document.querySelector(SELECTORS.image);
        if (imageElement) {
          imageElement.src = sectionData.expertiseImage.asset.url;
          imageElement.srcset = sectionData.expertiseImage.asset.url; // Simplified srcset
          
          // Update alt text if available
          if (sectionData.expertiseImage.alt) {
            imageElement.alt = sectionData.expertiseImage.alt;
          }
          
          console.log('✅ Updated expertise image from Sanity');
        }
      }

      // Note: Achievements are handled separately in the testimonials section
      // which manages the stats area

      return true;

    } catch (error) {
      console.error('❌ Error updating expertise section:', error);
      return false;
    }
  }

  /**
   * Load and apply expertise section data from Sanity
   */
  async function loadExpertiseSectionFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available for expertise section');
      return false;
    }

    try {
      console.log('🔄 Loading expertise section from Sanity...');
      
      // Query homepage data
      const result = await window.SanityRead.query(ABOUT_SECTION_QUERY);
      console.log('📦 About section query result:', result);
      
      const sectionData = result?.aboutSection;
      
      if (!sectionData) {
        console.warn('⚠️ No about section data found in Sanity');
        return false;
      }

      // Update section with Sanity data
      const success = updateExpertiseSection(sectionData);
      
      if (success) {
        console.log('✅ Expertise section loaded from Sanity successfully');
        // Set flag to indicate Sanity loading completed
        window.__SANITY_EXPERTISE_DONE__ = true;
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Failed to load expertise section from Sanity:', error);
      console.log('🔄 Keeping static fallback content');
      return false;
    }
  }

  /**
   * Initialize expertise section
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Check if section exists on this page
    if (!document.querySelector(SELECTORS.section)) {
      console.log('ℹ️ Expertise section not found on this page');
      return;
    }

    // Small delay to ensure SanityRead is initialized
    setTimeout(async () => {
      const success = await loadExpertiseSectionFromSanity();
      
      if (!success) {
        console.log('ℹ️ Expertise section: Using static fallback content');
      }
    }, 100); // Small delay after other loaders
  }

  // Initialize
  init();

})();