/**
 * Property Loader for Dynamic Exclusive Listings
 * Created: 2026-02-04
 * Purpose: Load real property data from JSON with robust error handling
 * Rollback: Falls back to original dummy data if JSON fails to load
 */

class PropertyLoader {
  constructor() {
    this.properties = null;
    this.fallbackData = [
      {
        name: "Burj Khalifa Penthouse",
        fullAddress: "Burj Khalifa, Downtown Dubai, UAE",
        price: "85,000,000",
        currency: "AED",
        status: "FOR SALE",
        images: { hero: "assets/images/your-image-1.jpg" }
      },
      {
        name: "Emirates Hills Villa", 
        fullAddress: "Emirates Hills, Dubai, UAE",
        price: "125,000,000",
        currency: "AED",
        status: "FOR SALE",
        images: { hero: "assets/images/your-image-2.jpg" }
      }
    ];
    this.currentSlideIndex = 0;
    this.totalSlides = 0;
  }

  /**
   * Initialize the property loader
   */
  async init() {
    try {
      await this.loadProperties();
      this.renderExclusiveListings();
      this.initializeSlider();
      console.log('✅ Property Loader: Successfully initialized with real data');
    } catch (error) {
      console.warn('⚠️ Property Loader: Failed to load real data, using fallback');
      console.error('Error details:', error);
      this.useFallbackData();
    }
  }

  /**
   * Load properties from JSON file
   */
  async loadProperties() {
    try {
      const response = await fetch('assets/data/properties.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.exclusiveListings || !Array.isArray(data.exclusiveListings)) {
        throw new Error('Invalid JSON structure: Missing exclusiveListings array');
      }
      
      this.properties = data.exclusiveListings;
      console.log('✅ Property Loader: JSON data loaded successfully');
      
    } catch (error) {
      console.error('❌ Property Loader: JSON loading failed:', error);
      throw error;
    }
  }

  /**
   * Use fallback data when JSON fails
   */
  useFallbackData() {
    this.properties = this.fallbackData;
    this.renderExclusiveListings();
    this.initializeSlider();
    console.log('🔄 Property Loader: Using fallback data');
  }

  /**
   * Render exclusive listings with real or fallback data
   */
  renderExclusiveListings() {
    const sliderContainer = document.querySelector('.ex-listing-slider');
    if (!sliderContainer) {
      console.error('❌ Property Loader: Slider container not found');
      return;
    }

    // Clear existing slides
    sliderContainer.innerHTML = '';
    
    // Generate slides from data
    this.properties.forEach((property, index) => {
      const slide = this.createSlideElement(property, index === 0);
      sliderContainer.appendChild(slide);
    });
    
    this.totalSlides = this.properties.length;
    console.log(`✅ Property Loader: Rendered ${this.totalSlides} exclusive listings`);
  }

  /**
   * Create slide element from property data
   */
  createSlideElement(property, isActive = false) {
    const slide = document.createElement('div');
    slide.className = isActive ? 'ex-listing-slide active' : 'ex-listing-slide';
    slide.style.backgroundImage = `url('${property.images.hero}')`;

    const priceFormatted = this.formatPrice(property.price, property.currency);

    slide.innerHTML = `
      <div class="ex-listing-overlay">
        <!-- Hover content -->
        <div class="ex-listing-center-content">
          <div class="ex-line"></div>
          <div class="ex-monogram">
            <img src="assets/images/Logo/mronelogo2.png" alt="MR One Properties" class="ex-monogram-img">
          </div>
          <div class="ex-tag">${property.status}</div>
          <h3 class="ex-address">${property.name}</h3>
          <div class="ex-location">${property.fullAddress}</div>
          <div class="ex-price">${priceFormatted}</div>
        </div>

        <!-- Default bottom-left content -->
        <div class="ex-bottom-content">
          <h3 class="ex-address">${property.name}</h3>
          <div class="ex-location">${property.fullAddress}</div>
          <div class="ex-price">${priceFormatted}</div>
        </div>

        <!-- Nav Arrows -->
        <div class="ex-nav">
          <button class="ex-prev" onclick="propertyLoader.previousSlide()">←</button>
          <button class="ex-next" onclick="propertyLoader.nextSlide()">→</button>
        </div>
      </div>
    `;

    return slide;
  }

  /**
   * Format price with proper number formatting
   */
  formatPrice(price, currency) {
    const numPrice = parseFloat(price.replace(/,/g, ''));
    if (isNaN(numPrice)) return `${price} ${currency}`;
    
    return `${numPrice.toLocaleString()} ${currency}`;
  }

  /**
   * Initialize slider functionality
   */
  initializeSlider() {
    // Reset current slide index
    this.currentSlideIndex = 0;
    
    // Auto-advance slider every 8 seconds
    setInterval(() => {
      this.nextSlide();
    }, 8000);

    console.log('✅ Property Loader: Slider initialized with auto-advance');
  }

  /**
   * Navigate to next slide
   */
  nextSlide() {
    const slides = document.querySelectorAll('.ex-listing-slide');
    if (slides.length === 0) return;

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

    slides[this.currentSlideIndex].classList.remove('active');
    this.currentSlideIndex = this.currentSlideIndex === 0 ? this.totalSlides - 1 : this.currentSlideIndex - 1;
    slides[this.currentSlideIndex].classList.add('active');
  }

  /**
   * Emergency rollback to original HTML
   */
  async emergencyRollback() {
    try {
      console.log('🚨 Property Loader: Executing emergency rollback...');
      
      const response = await fetch('assets/backup/exclusive-listings-original.html');
      if (!response.ok) throw new Error('Rollback file not found');
      
      const originalHtml = await response.text();
      const section = document.querySelector('.ex-listing-section');
      
      if (section && section.parentNode) {
        section.parentNode.innerHTML = originalHtml;
        console.log('✅ Property Loader: Emergency rollback completed');
      }
      
    } catch (error) {
      console.error('❌ Property Loader: Emergency rollback failed:', error);
      // Final fallback - reload page
      window.location.reload();
    }
  }
}

// Global instance
let propertyLoader;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  propertyLoader = new PropertyLoader();
  propertyLoader.init();
});

// Global functions for navigation
window.propertyLoader = {
  nextSlide: () => propertyLoader?.nextSlide(),
  previousSlide: () => propertyLoader?.previousSlide(), 
  emergencyRollback: () => propertyLoader?.emergencyRollback()
};