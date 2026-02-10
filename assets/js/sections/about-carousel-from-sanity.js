/**
 * About Carousel Section - Sanity Integration
 * Loads about carousel content from Sanity homePage.aboutCarousel
 * Fallback to existing hardcoded content if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for about carousel data
  const ABOUT_CAROUSEL_QUERY = `*[_type=="homePage"][0]{
    aboutCarousel{
      slides[]{
        title,
        description,
        cta,
        image{
          asset->{url}
        }
      }
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    carouselInner: '#carouselExample .carousel-inner',
    carouselItems: '#carouselExample .carousel-item'
  };

  /**
   * Create carousel slide HTML
   * @param {object} slideData - Slide data from Sanity
   * @param {number} index - Slide index
   * @returns {string} - HTML string for carousel slide
   */
  function createSlideHTML(slideData, index) {
    const isActive = index === 0 ? 'active' : '';
    const imageUrl = slideData.image?.asset?.url || 'assets/images/carousel/img.avif';
    
    // Create subtitle based on title
    let subtitle = '';
    switch(slideData.title) {
      case 'A GLOBAL LUXURY LIFESTYLE EXPERT':
        subtitle = 'A GLOBAL LUXURY LIFESTYLE EXPERT';
        break;
      case '$3B+ in Total Sales':
        subtitle = 'INFLUENCING THE DUBAI REAL ESTATE LANDSCAPE';
        break;
      case 'Global Luxury Recognition':
        subtitle = 'A LUXURY REAL ESTATE ICON';
        break;
      default:
        subtitle = slideData.title.toUpperCase();
    }

    // Create main title based on content
    let mainTitle = '';
    switch(slideData.title) {
      case 'A GLOBAL LUXURY LIFESTYLE EXPERT':
        mainTitle = 'Top 25 Ranked<br>Agent';
        break;
      case '$3B+ in Total Sales':
        mainTitle = '$3B+ in Total Sales';
        break;
      case 'Global Luxury Recognition':
        mainTitle = 'Global Luxury<br>Recognition';
        break;
      default:
        mainTitle = slideData.title;
    }

    // Create CTA href based on content
    let ctaHref = '#';
    switch(slideData.title) {
      case 'A GLOBAL LUXURY LIFESTYLE EXPERT':
        ctaHref = 'blog/index.html';
        break;
      case '$3B+ in Total Sales':
        ctaHref = '#notable-transactions';
        break;
      case 'Global Luxury Recognition':
        ctaHref = '#';
        break;
    }

    // Create CTA text
    const ctaText = slideData.cta || 'Learn More';

    return `
      <div class="carousel-item ${isActive}">
        <div class="carousel-content d-md-flex">
          <!-- Background image for slide -->
          <div class="carousel-image" style="background-image: url('${imageUrl}');"></div>
          
          <!-- Text content for slide -->
          <div class="carousel-text">
            <p class="carousel-subtitle">${subtitle}</p>
            <h2 class="carousel-title">${mainTitle}</h2>
            <p class="carousel-description">
              ${slideData.description}
            </p>
            <a href="${ctaHref}" class="btn btn-outline-dark" ${ctaHref === '#' ? 'data-bs-toggle="modal" data-bs-target="#consultationModal"' : ''}>${ctaText}</a>

            <!-- Carousel Navigation Controls -->
            <div class="carousel-controls-wrapper mt-4">
              <button class="carousel-arrow carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">←</button>
              <!-- Custom line-style indicators -->
              <div class="carousel-indicators custom-indicators m-0">
                ${generateIndicators(index)}
              </div>
              <button class="carousel-arrow carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">→</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate indicators HTML
   * @param {number} activeIndex - Currently active slide index
   * @returns {string} - HTML string for indicators
   */
  function generateIndicators(activeIndex) {
    let indicators = '';
    for (let i = 0; i < 3; i++) {
      const activeClass = i === activeIndex ? ' active' : '';
      indicators += `<button type="button" data-bs-target="#carouselExample" data-bs-slide-to="${i}" class="${activeClass}"></button>`;
    }
    return indicators;
  }

  /**
   * Update about carousel content
   * @param {object} aboutCarousel - About carousel data from Sanity
   */
  function updateAboutCarousel(aboutCarousel) {
    const carouselInner = document.querySelector(SELECTORS.carouselInner);
    
    if (!carouselInner || !aboutCarousel || !aboutCarousel.slides) {
      console.warn('❌ Carousel container not found or no slide data');
      return;
    }

    console.log('🔄 Updating about carousel with', aboutCarousel.slides.length, 'slides');

    // Generate new carousel HTML
    const slidesHTML = aboutCarousel.slides.map((slide, index) => createSlideHTML(slide, index)).join('');
    
    // Update carousel inner content
    carouselInner.innerHTML = slidesHTML;
    
    console.log('✅ About carousel updated successfully');
  }

  /**
   * Load and apply about carousel content from Sanity
   */
  async function loadAboutCarouselFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available, keeping existing about carousel content');
      return;
    }

    try {
      console.log('🔄 Loading about carousel content from Sanity...');
      
      // Query Sanity for about carousel data
      const result = await window.SanityRead.query(ABOUT_CAROUSEL_QUERY);
      
      if (!result || !result.aboutCarousel) {
        console.warn('⚠️ No about carousel data found in Sanity, keeping existing content');
        return;
      }

      const aboutCarousel = result.aboutCarousel;
      console.log('📦 About carousel data loaded:', aboutCarousel);

      // Update content
      updateAboutCarousel(aboutCarousel);
      
      console.log('✅ About carousel section updated from Sanity successfully');
      
    } catch (error) {
      console.error('❌ Failed to load about carousel from Sanity:', error);
      console.log('🔄 Keeping existing about carousel content as fallback');
    }
  }

  /**
   * Initialize about carousel section
   */
  function init() {
    console.log('🚀 About carousel section initializing...');
    
    // Wait for DOM and SanityRead to be ready
    if (document.readyState === 'loading') {
      console.log('⏳ DOM still loading, waiting...');
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    console.log('✅ DOM ready, checking SanityRead...');
    
    // Longer delay to ensure SanityRead is initialized
    setTimeout(() => {
      if (window.SanityRead) {
        console.log('✅ SanityRead available, loading about carousel data...');
        loadAboutCarouselFromSanity();
      } else {
        console.error('❌ SanityRead not available for about carousel!');
        // Try again after a longer delay
        setTimeout(() => {
          if (window.SanityRead) {
            console.log('✅ SanityRead available on retry, loading about carousel data...');
            loadAboutCarouselFromSanity();
          } else {
            console.error('❌ SanityRead still not available for about carousel after retry!');
          }
        }, 1000);
      }
    }, 800); // Slightly longer delay than hero section
  }

  // Initialize
  console.log('🚀 About carousel section script loaded');
  init();

})();