/**
 * Brand Partners Carousel - Sanity Integration
 * Loads brand partner logos from Sanity homePage.brandPartners
 * Fallback to existing hardcoded logos if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for brand partners data
  const BRAND_PARTNERS_QUERY = `*[_type=="homePage"][0]{
    brandPartners[]->{
      name,
      website,
      logo{
        asset->{url}
      },
      displayOrder,
      isActive
    }
  }`;

  // DOM selector for the carousel track
  const CAROUSEL_TRACK_SELECTOR = '.brand-carousel-track';

  /**
   * Create logo image element
   * @param {object} partner - Brand partner data from Sanity
   * @returns {HTMLElement} - Logo image or wrapped link element
   */
  function createLogoElement(partner) {
    const img = document.createElement('img');
    img.src = partner.logo?.asset?.url;
    img.alt = partner.name || 'Brand Partner';
    img.loading = 'lazy'; // Performance optimization

    // If website URL exists, wrap in link
    if (partner.website) {
      const link = document.createElement('a');
      link.href = partner.website;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.appendChild(img);
      return link;
    }

    return img;
  }

  /**
   * Process and sort brand partners data
   * @param {array} partners - Raw brand partners array from Sanity
   * @returns {array} - Processed and sorted partners
   */
  function processPartners(partners) {
    if (!Array.isArray(partners)) return [];

    return partners
      // Filter active partners only
      .filter(partner => partner.isActive !== false && partner.logo?.asset?.url)
      // Sort by displayOrder (ascending), fallback to name
      .sort((a, b) => {
        const orderA = a.displayOrder || 999;
        const orderB = b.displayOrder || 999;
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        // Fallback to alphabetical by name
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }

  /**
   * Store original logos for fallback
   */
  function storeOriginalLogos() {
    const track = document.querySelector(CAROUSEL_TRACK_SELECTOR);
    if (!track) return null;

    // Clone the original track content
    return track.cloneNode(true);
  }

  /**
   * Restore original logos
   * @param {HTMLElement} originalTrack - Cloned original track
   */
  function restoreOriginalLogos(originalTrack) {
    if (!originalTrack) return;
    
    const currentTrack = document.querySelector(CAROUSEL_TRACK_SELECTOR);
    if (currentTrack && currentTrack.parentNode) {
      currentTrack.parentNode.replaceChild(originalTrack, currentTrack);
      console.log('🔄 Restored original brand logos as fallback');
    }
  }

  /**
   * Update brand carousel with Sanity data
   * @param {array} partners - Processed brand partners data
   */
  function updateBrandCarousel(partners) {
    const track = document.querySelector(CAROUSEL_TRACK_SELECTOR);
    
    if (!track) {
      console.warn('⚠️ Brand carousel track not found');
      return;
    }

    if (!partners || partners.length === 0) {
      console.warn('⚠️ No brand partners data available');
      return;
    }

    // Clear existing content
    track.innerHTML = '';

    // Create logo elements
    const logoElements = partners.map(partner => createLogoElement(partner));

    // Add original logos
    logoElements.forEach(element => {
      track.appendChild(element);
    });

    // Duplicate for seamless loop (matching original behavior)
    logoElements.forEach(element => {
      track.appendChild(element.cloneNode(true));
    });

    console.log(`✅ Updated brand carousel with ${partners.length} partners`);
    
    // Log partners for debugging
    partners.forEach(partner => {
      console.log(`📊 Brand Partner: ${partner.name} (Order: ${partner.displayOrder || 'N/A'})`);
    });
  }

  /**
   * Load and apply brand partners from Sanity
   */
  async function loadBrandPartnersFromSanity() {
    // Store original content for fallback
    const originalTrack = storeOriginalLogos();

    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available, keeping existing brand partners');
      return;
    }

    try {
      console.log('🔄 Loading brand partners from Sanity...');
      
      // Query Sanity for brand partners data
      const result = await window.SanityRead.query(BRAND_PARTNERS_QUERY);
      
      if (!result || !result.brandPartners || result.brandPartners.length === 0) {
        console.warn('⚠️ No brand partners found in Sanity, keeping existing logos');
        return;
      }

      console.log('📦 Brand partners data loaded:', result.brandPartners);

      // Process partners data
      const processedPartners = processPartners(result.brandPartners);
      
      if (processedPartners.length === 0) {
        console.warn('⚠️ No active brand partners with valid logos found');
        return;
      }

      // Update carousel
      updateBrandCarousel(processedPartners);
      
      console.log('✅ Brand partners carousel updated successfully');
      
    } catch (error) {
      console.error('❌ Failed to load brand partners from Sanity:', error);
      console.log('🔄 Restoring original brand partners as fallback');
      
      // Restore original content on error
      restoreOriginalLogos(originalTrack);
    }
  }

  /**
   * Initialize brand partners section
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Check if carousel track exists
    if (!document.querySelector(CAROUSEL_TRACK_SELECTOR)) {
      console.warn('⚠️ Brand carousel track not found on this page');
      return;
    }

    // Small delay to ensure SanityRead is initialized
    setTimeout(() => {
      loadBrandPartnersFromSanity();
    }, 200);
  }

  // Initialize
  init();

})();