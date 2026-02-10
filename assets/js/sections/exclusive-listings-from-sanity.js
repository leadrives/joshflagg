/**
 * Exclusive Listings - Sanity Integration
 * Loads exclusive listing properties from Sanity homePage.exclusiveListings
 * Fallback to existing property loader if Sanity fails
 */

(function() {
  'use strict';

  // Primary GROQ query using homepage references - Fixed dereference syntax
  const EXCLUSIVE_LISTINGS_HOMEPAGE_QUERY = `*[_type=="homePage"][0]{
    exclusiveListings{
      title,
      subtitle,
      "properties": properties[]-> {
        _id,
        title,
        legacyId,
        listingType,
        location,
        price,
        priceNumeric,
        propertyType,
        status,
        bedrooms,
        bathrooms,
        area,
        developer,
        community->{title},
        heroImage{
          asset->{url}
        },
        images[0]{
          asset->{url}
        }
      }
    }
  }`;

  /**
   * Update section title and subtitle from Sanity
   * @param {object} sectionData - Section configuration from homepage
   */
  function updateSectionTitleAndSubtitle(sectionData) {
    if (!sectionData) return;

    // Update section title
    if (sectionData.title) {
      const titleElement = document.querySelector('.ex-listing-title h2');
      if (titleElement) {
        titleElement.textContent = sectionData.title;
        console.log('✅ Updated section title:', sectionData.title);
      }
    }

    // Update section subtitle (if configured)
    if (sectionData.subtitle) {
      // Check if subtitle element exists, if not create it
      let subtitleElement = document.querySelector('.ex-listing-subtitle');
      if (!subtitleElement) {
        const titleContainer = document.querySelector('.ex-listing-title');
        if (titleContainer) {
          subtitleElement = document.createElement('p');
          subtitleElement.className = 'ex-listing-subtitle';
          subtitleElement.style.cssText = 'color: #666; font-size: 14px; margin-top: 8px; margin-bottom: 0;';
          titleContainer.appendChild(subtitleElement);
        }
      }
      
      if (subtitleElement) {
        subtitleElement.textContent = sectionData.subtitle;
        console.log('✅ Updated section subtitle:', sectionData.subtitle);
      }
    }
  }

  // Fallback query by property type
  const EXCLUSIVE_LISTINGS_TYPE_QUERY = `*[_type=="property" && listingType=="exclusive" && isExclusive==true][0...10]{
    title,
    legacyId,
    listingType,
    location,
    price,
    priceNumeric,
    propertyType,
    status,
    bedrooms,
    bathrooms,
    area,
    developer,
    community->{title},
    heroImage{
      asset->{url}
    },
    images[0]{
      asset->{url}
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    sliderContainer: '.ex-listing-slider',
    section: '.ex-listing-section'
  };

  /**
   * Create a single slide element matching existing structure
   * @param {object} property - Property data from Sanity
   * @param {number} index - Slide index
   * @returns {HTMLElement} - Slide element
   */
  function createSlideElement(property, index) {
    const slide = document.createElement('div');
    slide.className = index === 0 ? 'ex-listing-slide active' : 'ex-listing-slide';
    
    // Get the hero image (prefer heroImage over images array)
    const backgroundImage = property.heroImage?.asset?.url || 
                          property.images?.[0]?.asset?.url || 
                          'assets/images/Communities/Properties/KAIA.webp';
    
    slide.style.backgroundImage = `url('${backgroundImage}')`;

    // Format the price
    const priceFormatted = formatPrice(property.price || property.priceDisplay);
    
    // Get property details with fallbacks
    const propertyName = property.title || property.name || 'Luxury Property';
    const location = property.location || property.fullAddress || property.community || 'Dubai, UAE';
    const status = property.status || 'FOR SALE';

    slide.innerHTML = `
      <div class="ex-listing-overlay">

        <!-- Hover content -->
        <div class="ex-listing-center-content">
          <div class="ex-line"></div>
          <div class="ex-monogram">
            <img src="assets/images/Logo/mronelogo2.png" alt="MR One Properties" class="ex-monogram-img">
          </div>
          <div class="ex-tag">${status}</div>
          <h3 class="ex-address">${propertyName}</h3>
          <div class="ex-location">${location}</div>
          <div class="ex-price">${priceFormatted}</div>
        </div>

        <!-- Default bottom-left content -->
        <div class="ex-bottom-content">
          <h3 class="ex-address">${propertyName}</h3>
          <div class="ex-location">${location}</div>
          <div class="ex-price">${priceFormatted}</div>
        </div>

        <!-- Nav Arrows -->
        <div class="ex-nav">
          <button class="ex-prev" onclick="window.__SANITY_EXCLUSIVE_LOADER__?.previousSlide()">←</button>
          <button class="ex-next" onclick="window.__SANITY_EXCLUSIVE_LOADER__?.nextSlide()">→</button>
        </div>

      </div>
    `;

    return slide;
  }

  /**
   * Format price with proper number formatting
   * @param {string} price - Price string from Sanity
   * @returns {string} - Formatted price
   */
  function formatPrice(price) {
    // If we have a price already formatted, use it
    if (price && typeof price === 'string' && price.trim()) {
      // Add AED currency if not already included
      if (price.includes('AED') || price.includes('$') || price.includes('€')) {
        return price;
      }
      return `${price} AED`;
    }

    // Fallback pricing
    return `Price on Request AED`;
  }

  /**
   * Process property data for compatibility
   * @param {array} properties - Raw properties from Sanity
   * @returns {array} - Processed properties
   */
  function processProperties(properties) {
    if (!Array.isArray(properties)) {
      console.log('❌ processProperties: Input is not an array:', properties);
      return [];
    }

    console.log('📋 Processing properties:', properties.length, 'items');

    const filtered = properties.filter(property => {
      if (!property) {
        console.log('⚠️ Skipping null property');
        return false;
      }
      
      const hasHeroImage = property.heroImage?.asset?.url;
      const hasRegularImage = property.images?.[0]?.asset?.url;
      const hasAnyImage = hasHeroImage || hasRegularImage;
      
      console.log(`🔍 Property "${property.title}":`, {
        hasHeroImage: !!hasHeroImage,
        hasRegularImage: !!hasRegularImage,
        heroUrl: hasHeroImage,
        willInclude: hasAnyImage
      });
      
      return hasAnyImage;
    });

    console.log('✅ Filtered properties:', filtered.length, 'items');

    const processed = filtered.map(property => {
      const processed = {
        id: property.legacyId || property._id,
        name: property.title,
        fullAddress: property.location || property.community?.title || 'Dubai, UAE',
        price: property.price || 'Price on Request',
        currency: 'AED',
        status: formatStatus(property.status) || 'FOR SALE',
        community: property.community?.title,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        developer: property.developer,
        propertyType: property.propertyType,
        images: {
          hero: property.heroImage?.asset?.url || property.images?.[0]?.asset?.url
        },
        // Keep both formats for compatibility
        title: property.title,
        priceDisplay: property.price,
        location: property.location
      };
      
      console.log(`🏠 Processed "${property.title}":`, processed);
      return processed;
    });

    console.log('🎯 Final processed properties:', processed);
    return processed;
  }

  /**
   * Format status values for display
   * @param {string} status - Status value from Sanity
   * @returns {string} - Display status
   */
  function formatStatus(status) {
    if (!status) return 'FOR SALE';
    
    // Normalize status to lowercase for mapping
    const normalizedStatus = status.toLowerCase().trim();
    
    const statusMap = {
      'for-sale': 'FOR SALE',
      'for sale': 'FOR SALE',
      'sold': 'SOLD',
      'under-offer': 'UNDER OFFER',
      'under offer': 'UNDER OFFER', 
      'coming-soon': 'COMING SOON',
      'coming soon': 'COMING SOON'
    };
    
    // Return mapped value or uppercase the original
    return statusMap[normalizedStatus] || status.toUpperCase();
  }

  /**
   * Render exclusive listings slider
   * @param {array} properties - Processed property data
   */
  function renderExclusiveListings(properties) {
    const sliderContainer = document.querySelector(SELECTORS.sliderContainer);
    
    if (!sliderContainer) {
      console.error('❌ Exclusive Listings: Slider container not found');
      return false;
    }

    if (!properties || properties.length === 0) {
      console.warn('⚠️ No exclusive listings data available');
      return false;
    }

    // Clear existing slides
    sliderContainer.innerHTML = '';
    
    // Generate slides from data
    properties.forEach((property, index) => {
      const slide = createSlideElement(property, index);
      sliderContainer.appendChild(slide);
    });

    console.log(`✅ Exclusive Listings: Rendered ${properties.length} slides from Sanity`);
    return true;
  }

  /**
   * Simple slider functionality (mimicking original behavior)
   */
  class SanityExclusiveSlider {
    constructor(properties) {
      this.properties = properties || [];
      this.currentSlideIndex = 0;
      // If no properties provided, rely on DOM count
      this.totalSlides = this.properties.length > 0 ? this.properties.length : document.querySelectorAll('.ex-listing-slide').length;
      this.autoAdvanceInterval = null;
      
      // Expose globally for button callbacks
      window.__SANITY_EXCLUSIVE_LOADER__ = this;
    }

    /**
     * Initialize slider functionality
     */
    init() {
      // Re-count slides in case they changed
      const domSlides = document.querySelectorAll('.ex-listing-slide');
      this.totalSlides = domSlides.length;

      if (this.totalSlides === 0) return;

      // Auto-advance slider every 8 seconds (matching original)
      this.autoAdvanceInterval = setInterval(() => {
        this.nextSlide();
      }, 8000);

      console.log(`✅ Exclusive Listings: Slider initialized with ${this.totalSlides} slides`);
    }

    /**
     * Navigate to next slide
     */
    nextSlide() {
      const slides = document.querySelectorAll('.ex-listing-slide');
      if (slides.length === 0) return;
      
      // Update count
      this.totalSlides = slides.length;

      slides[this.currentSlideIndex].classList.remove('active');
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.totalSlides;
      slides[this.currentSlideIndex].classList.add('active');
    }

    /**
     * Navigate to previous slide
     */
    previousSlide() {
      const slides = document.querySelectorAll('.ex-listing-slide');
      if (slides.length === 0) return;
      
      // Update count
      this.totalSlides = slides.length;

      slides[this.currentSlideIndex].classList.remove('active');
      this.currentSlideIndex = this.currentSlideIndex === 0 ? this.totalSlides - 1 : this.currentSlideIndex - 1;
      slides[this.currentSlideIndex].classList.add('active');
    }

    /**
     * Cleanup
     */
    destroy() {
      if (this.autoAdvanceInterval) {
        clearInterval(this.autoAdvanceInterval);
      }
      window.__SANITY_EXCLUSIVE_LOADER__ = null;
    }
  }

  /**
   * Load and apply exclusive listings from Sanity
   */
  async function loadExclusiveListingsFromSanity() {
    console.log('🔍 Starting exclusive listings load from Sanity...');
    
    if (!window.SanityPropertyFetcher) {
      console.warn('⚠️ SanityPropertyFetcher not available, waiting...');
      // It might be loaded later if script order is tricky, but index.html has it before this file.
    }

    try {
      console.log('🔄 Loading exclusive listings from Sanity...');
      
      // 1. Try Curated List (HomePage)
      let sectionData = null;
      let properties = [];
      
      if (window.SanityPropertyFetcher) {
          const curatedResult = await window.SanityPropertyFetcher.getCuratedExclusiveListings();
          
          // Always apply title/subtitle from homepage settings if available
          if (curatedResult && (curatedResult.title || curatedResult.subtitle)) {
              sectionData = { title: curatedResult.title, subtitle: curatedResult.subtitle };
          }
          
          if (curatedResult && curatedResult.properties && curatedResult.properties.length > 0) {
              properties = curatedResult.properties;
              console.log('✨ Found curated exclusive listings:', properties.length);
          } else {
              // 2. Fallback - fetch all exclusive properties by type
              console.log('⚠️ No curated listings, fetching all exclusive properties...');
              properties = await window.SanityPropertyFetcher.getExclusiveListings();
          }
      }

      if (!properties || properties.length === 0) {
        console.warn('⚠️ No exclusive listings found in Sanity, initializing fallback slider');
        // Initialize fallback slider for static HTML
        const fallbackSlider = new SanityExclusiveSlider([]);
        fallbackSlider.init();
        return false;
      }

      // Update section title and subtitle
      updateSectionTitleAndSubtitle(sectionData);

      console.log('📦 Exclusive listings raw data loaded:', properties);

      // Process properties data (Adapt from Fetcher format to Slider format)
      // Fetcher returns { imageUrl, title, location, price, ... }
      // Slider expects { images: { hero: url }, name, fullAddress, ... }
      
      const processedProperties = properties.map(p => ({
        id: p._id,
        name: p.title,
        fullAddress: p.location || p.communityTitle || 'Dubai, UAE',
        price: p.price || 'Price on Request',
        currency: 'AED',
        status: p.status === 'for-sale' ? 'FOR SALE' : (p.status || 'FOR SALE').toUpperCase(),
        community: p.communityTitle,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        area: p.area,
        developer: p.developer,
        propertyType: p.propertyType,
        images: {
          hero: p.imageUrl
        },
        // Legacy compat if needed
        title: p.title,
        priceDisplay: p.price,
      })).filter(p => !!p.images.hero);

      console.log('✅ Properties processed:', processedProperties);
      
      if (processedProperties.length === 0) {
        console.warn('⚠️ No valid exclusive listings after processing, will use fallback loader');
        return false;
      }

      // Render slider
      console.log('🎨 Rendering slider...');
      const success = renderExclusiveListings(processedProperties);
      console.log('🎨 Render success:', success);
      
      if (!success) {
          return false;
      }

      // Initialize slider
      console.log('🎮 Initializing slider...');
      const slider = new SanityExclusiveSlider(processedProperties);
      slider.init();
      
      // Set flag to prevent original loader from running
      window.__SANITY_EXCLUSIVE_DONE__ = true;
      console.log('🚩 Set flag __SANITY_EXCLUSIVE_DONE__ = true');
      
      console.log('✅ Exclusive listings loaded from Sanity successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load exclusive listings from Sanity:', error);
      console.log('🔄 Initializing fallback slider for static content');
      // Initialize fallback slider for static HTML
      const fallbackSlider = new SanityExclusiveSlider([]);
      fallbackSlider.init();
      return false;
    }
  }

  /**
   * Initialize exclusive listings section
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Check if slider exists on this page
    if (!document.querySelector(SELECTORS.sliderContainer)) {
      console.log('ℹ️ Exclusive listings slider not found on this page');
      return;
    }

    // Small delay to ensure SanityRead is initialized
    setTimeout(async () => {
      const success = await loadExclusiveListingsFromSanity();
      
      if (!success) {
        console.log('🔄 Sanity loading failed, original property loader will handle fallback');
      }
    }, 200); // Run before the original loader
  }

  // Initialize
  init();

})();