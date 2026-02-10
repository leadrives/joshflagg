/**
 * Testimonials Section - Sanity Integration
 * Loads testimonials content from Sanity homePage.testimonialsSection
 * Fallback to existing hardcoded content if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for homepage testimonials data - Fixed references  
  const TESTIMONIALS_QUERY = `*[_type=="homePage"][0]{
    testimonialsSection{
      quote,
      stats[]{
        number,
        prefix,
        suffix,
        label
      },
      featuredTestimonials[]->{
        _id,
        clientName,
        testimonialText,
        rating
      }
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    quoteElement: '.ft-quote',
    slider: '.ft-slider',
    statsWrapper: '.ft-stats',
    prevBtn: '.ft-prev',
    nextBtn: '.ft-next'
  };

  let currentSlide = 0;
  let testimonials = [];

  /**
   * Load testimonials data from Sanity
   */
  async function loadTestimonialsData() {
    console.log('🎯 Testimonials: Loading data from Sanity...');
    
    if (!window.SanityRead) {
      console.warn('⚠️ Testimonials: SanityRead not available, using fallback content');
      return null;
    }

    try {
      const data = await window.SanityRead.query(TESTIMONIALS_QUERY);
      
      if (!data || !data.testimonialsSection) {
        console.warn('⚠️ Testimonials: No testimonials data found, using fallback content');
        return null;
      }

      console.log('✅ Testimonials: Data loaded successfully:', data);
      return data.testimonialsSection;
    } catch (error) {
      console.error('❌ Testimonials: Error loading data:', error);
      return null;
    }
  }

  /**
   * Update the main quote
   */
  function updateQuote(quote) {
    const quoteElement = document.querySelector(SELECTORS.quoteElement);
    if (quoteElement && quote) {
      quoteElement.innerHTML = `"${quote.replace(/\n/g, '<br>')}"`;
      console.log('✅ Testimonials: Quote updated');
    }
  }

  /**
   * Create testimonial slide HTML
   */
  function createTestimonialSlide(testimonial, isActive = false) {
    const activeClass = isActive ? ' active' : '';
    return `
      <div class="ft-slide${activeClass}">
        <p class="ft-text">
          "${testimonial.testimonialText}"
        </p>
        <span class="ft-author">— ${testimonial.clientName}</span>
      </div>
    `;
  }

  /**
   * Update testimonials slider
   */
  function updateTestimonials(testimonialsData) {
    const slider = document.querySelector(SELECTORS.slider);
    
    if (!slider || !testimonialsData || testimonialsData.length === 0) {
      console.warn('⚠️ Testimonials: Cannot update testimonials - missing data or slider');
      return;
    }

    // Store testimonials for navigation
    testimonials = testimonialsData;
    
    // Create slides HTML
    let slidesHTML = '';
    testimonialsData.forEach((testimonial, index) => {
      slidesHTML += createTestimonialSlide(testimonial, index === 0);
    });

    // Update slider content
    slider.innerHTML = slidesHTML;
    console.log('✅ Testimonials: Slider updated with', testimonialsData.length, 'testimonials');
  }

  /**
   * Create stat HTML element
   */
  function createStatElement(stat, index = 0, isOriginal = true) {
    const prefix = stat.prefix || '';
    const suffix = stat.suffix || '';
    // Middle stat (index 1) gets center class to match existing layout
    const centerClass = index === 1 ? ' center' : '';
    
    // For original stats, show 0 and let animation count up
    // For duplicate stats (loop), show the final number
    const displayNumber = isOriginal ? '0' : stat.number;
    
    return `
      <div class="ft-stat${centerClass}">
        <span class="ft-number" data-target="${stat.number}">${prefix}${displayNumber}</span><span class="plus">${suffix}</span>
        <span class="ft-line"></span>
        <span class="ft-label">${stat.label}</span>
      </div>
    `;
  }

  /**
   * Update stats section
   */
  function updateStats(statsData) {
    const statsWrapper = document.querySelector(SELECTORS.statsWrapper);
    
    if (!statsWrapper) {
      console.warn('⚠️ Testimonials: Cannot update stats - stats wrapper not found (.ft-stats)');
      return;
    }

    if (!statsData || statsData.length === 0) {
      console.warn('⚠️ Testimonials: No stats data available');
      return;
    }

    console.log('📊 Updating stats with data:', statsData);

    // Create main stats (show 0, will animate to target)
    let statsHTML = '';
    statsData.forEach((stat, index) => {
      statsHTML += createStatElement(stat, index, true);
    });

    // Add duplicate stats for seamless loop (show final values) 
    statsData.forEach((stat, index) => {
      statsHTML += createStatElement(stat, index, false);
    });

    // Update stats wrapper content
    statsWrapper.innerHTML = statsHTML;
    console.log('✅ Testimonials: Stats updated with', statsData.length, 'items');
    
    // Trigger number animation if animation function exists
    if (typeof window.animateNumbers === 'function') {
      setTimeout(() => {
        window.animateNumbers();
      }, 100);
    }
  }

  /**
   * Initialize slider navigation
   */
  function initializeSliderNavigation() {
    const prevBtn = document.querySelector(SELECTORS.prevBtn);
    const nextBtn = document.querySelector(SELECTORS.nextBtn);

    if (!prevBtn || !nextBtn) {
      console.warn('⚠️ Testimonials: Navigation buttons not found');
      return;
    }

    // Previous slide
    prevBtn.addEventListener('click', () => {
      if (testimonials.length === 0) return;
      
      currentSlide = (currentSlide - 1 + testimonials.length) % testimonials.length;
      updateActiveSlide();
    });

    // Next slide
    nextBtn.addEventListener('click', () => {
      if (testimonials.length === 0) return;
      
      currentSlide = (currentSlide + 1) % testimonials.length;
      updateActiveSlide();
    });

    console.log('✅ Testimonials: Navigation initialized');
  }

  /**
   * Update active slide
   */
  function updateActiveSlide() {
    const slides = document.querySelectorAll('.ft-slide');
    
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });
  }

  /**
   * Initialize testimonials section
   */
  async function initializeTestimonials() {
    console.log('🎯 Testimonials: Initializing section...');

    // Add debugging for dependencies
    console.log('🔍 SanityConfig available:', typeof window.SanityConfig !== 'undefined');
    console.log('🔍 SanityRead available:', typeof window.SanityRead !== 'undefined');

    try {
      const testimonialsData = await loadTestimonialsData();

      if (testimonialsData) {
        // Update content with Sanity data
        updateQuote(testimonialsData.quote);
        updateTestimonials(testimonialsData.featuredTestimonials);
        updateStats(testimonialsData.stats);
      } else {
        console.log('📝 Testimonials: Using existing hardcoded content as fallback');
      }

      // Initialize navigation regardless of data source
      initializeSliderNavigation();
      
      console.log('✅ Testimonials: Section initialized successfully');
    } catch (error) {
      console.error('❌ Testimonials: Error during initialization:', error);
      // Still initialize navigation for hardcoded content
      initializeSliderNavigation();
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTestimonials);
  } else {
    initializeTestimonials();
  }

  // Debug logging
  console.log('📍 Testimonials script loaded successfully');

})();