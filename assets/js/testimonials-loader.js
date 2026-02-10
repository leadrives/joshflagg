/**
 * Testimonials Loader
 * 
 * Dynamically loads testimonials data from Sanity and populates the ft-authority-section
 * 
 * Features:
 * - Loads testimonials from Sanity CMS
 * - Populates main quote and stats
 * - Creates dynamic testimonial slides
 * - Handles slide navigation
 * - Maintains responsive design
 */

class TestimonialsLoader {
  constructor() {
    this.apiUrl = '/api/homepage'; // This should point to your Sanity API endpoint
    this.currentSlide = 0;
    this.testimonials = [];
    this.stats = [];
    this.quote = '';
    
    console.log('🎯 TestimonialsLoader: Initializing testimonials loader...');
    this.init();
  }
  
  async init() {
    try {
      await this.loadTestimonialsData();
      this.populateQuote();
      this.populateStats();
      this.populateTestimonials();
      this.initializeSlider();
      console.log('✅ TestimonialsLoader: Successfully loaded testimonials');
    } catch (error) {
      console.error('❌ TestimonialsLoader: Error initializing testimonials:', error);
      // Keep original HTML content as fallback
    }
  }
  
  async loadTestimonialsData() {
    console.log('📡 TestimonialsLoader: Fetching testimonials data...');
    
    try {
      // For now, use a mock API call - replace with actual Sanity endpoint
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Failed to fetch testimonials data');
      
      const data = await response.json();
      
      this.testimonials = data.testimonialsSection?.featuredTestimonials || [];
      this.stats = data.testimonialsSection?.stats || [];
      this.quote = data.testimonialsSection?.quote || '';
      
      console.log(`📋 TestimonialsLoader: Loaded ${this.testimonials.length} testimonials`);
      
    } catch (error) {
      console.warn('⚠️ TestimonialsLoader: API not available, using fallback data');
      // Use hardcoded data as fallback for development
      this.loadFallbackData();
    }
  }
  
  loadFallbackData() {
    this.quote = "Mohamad Ahmad is a global luxury lifestyle expert";
    
    this.testimonials = [
      {
        clientName: "James Bloomingdale",
        testimonialText: "We interviewed a number of his competitors (most at least 25 years his senior) and were impressed by his immediate understanding of the property, his poise and his honesty. Ahmad is brilliant, professional and wise beyond his years. Wouldn't hire anyone else in the future.",
        rating: 5
      },
      {
        clientName: "Sarah & Michael Chen", 
        testimonialText: "Mohamad Ahmad represented us in the sale of our Dubai Marina penthouse and exceeded all expectations. His market knowledge, negotiation skills, and attention to detail resulted in a sale price well above our initial asking price. Professional, responsive, and truly dedicated to his clients.",
        rating: 5
      },
      {
        clientName: "Jennifer Rodriguez",
        testimonialText: "Working with Ahmad was an absolute pleasure. His expertise in luxury real estate is unmatched, and his ability to understand exactly what we were looking for made our home buying experience seamless. We found our dream home within weeks of starting our search.",
        rating: 5
      },
      {
        clientName: "David Thompson",
        testimonialText: "Ahmad's reputation precedes him, and rightfully so. His deep understanding of the Dubai real estate market and his extensive network of connections made all the difference in our transaction. Highly professional and results-driven.",
        rating: 5
      }
    ];
    
    this.stats = [
      { number: 50, suffix: "+", label: "SALES OVER $20M" },
      { number: 3, prefix: "$", suffix: "B+", label: "IN TOTAL SALES VOLUME" },
      { number: 100, suffix: "+", label: "SALES OVER $10M" }
    ];
  }
  
  populateQuote() {
    if (!this.quote) return;
    
    const quoteElement = document.querySelector('#ft-authority-section .ft-quote');
    if (quoteElement) {
      // Format quote with line breaks for better display
      const formattedQuote = this.quote
        .replace(/global luxury lifestyle/gi, 'global luxury lifestyle<br>')
        .replace(/Mohamad Ahmad is a/gi, '"Mohamad Ahmad is a<br>');
      
      quoteElement.innerHTML = formattedQuote + '"';
      console.log('✅ TestimonialsLoader: Updated main quote');
    }
  }
  
  populateStats() {
    if (!this.stats || this.stats.length === 0) return;
    
    const statsContainer = document.querySelector('.ft-stats');
    if (!statsContainer) return;
    
    // Clear existing stats but keep structure
    const existingStats = statsContainer.querySelectorAll('.ft-stat');
    
    // Update the first 3 stats (the duplicates will remain for seamless loop)
    this.stats.forEach((stat, index) => {
      if (index < 3 && existingStats[index]) {
        const statElement = existingStats[index];
        
        // Update number
        const numberElement = statElement.querySelector('.ft-number');
        if (numberElement) {
          numberElement.textContent = (stat.prefix || '') + stat.number;
          numberElement.setAttribute('data-target', stat.number);
        }
        
        // Update suffix
        const plusElement = statElement.querySelector('.plus');
        if (plusElement) {
          plusElement.textContent = stat.suffix || '';
        }
        
        // Update label
        const labelElement = statElement.querySelector('.ft-label');
        if (labelElement) {
          labelElement.textContent = stat.label;
        }
      }
    });
    
    console.log('✅ TestimonialsLoader: Updated stats');
  }
  
  populateTestimonials() {
    if (!this.testimonials || this.testimonials.length === 0) return;
    
    const sliderContainer = document.querySelector('.ft-slider');
    if (!sliderContainer) return;
    
    // Clear existing slides
    sliderContainer.innerHTML = '';
    
    // Create new slides from Sanity data
    this.testimonials.forEach((testimonial, index) => {
      const slide = document.createElement('div');
      slide.className = `ft-slide ${index === 0 ? 'active' : ''}`;
      
      slide.innerHTML = `
        <p class="ft-text">
          "${testimonial.testimonialText}"
        </p>
        <span class="ft-author">— ${testimonial.clientName}</span>
      `;
      
      sliderContainer.appendChild(slide);
    });
    
    console.log(`✅ TestimonialsLoader: Created ${this.testimonials.length} testimonial slides`);
  }
  
  initializeSlider() {
    const prevBtn = document.querySelector('.ft-prev');
    const nextBtn = document.querySelector('.ft-next');
    
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => this.previousSlide());
      nextBtn.addEventListener('click', () => this.nextSlide());
      
      console.log('✅ TestimonialsLoader: Initialized slider navigation');
    }
  }
  
  nextSlide() {
    const slides = document.querySelectorAll('.ft-slide');
    if (slides.length === 0) return;
    
    slides[this.currentSlide].classList.remove('active');
    this.currentSlide = (this.currentSlide + 1) % slides.length;
    slides[this.currentSlide].classList.add('active');
    
    console.log(`🔄 TestimonialsLoader: Switched to slide ${this.currentSlide + 1}`);
  }
  
  previousSlide() {
    const slides = document.querySelectorAll('.ft-slide');
    if (slides.length === 0) return;
    
    slides[this.currentSlide].classList.remove('active');
    this.currentSlide = this.currentSlide === 0 ? slides.length - 1 : this.currentSlide - 1;
    slides[this.currentSlide].classList.add('active');
    
    console.log(`🔄 TestimonialsLoader: Switched to slide ${this.currentSlide + 1}`);
  }
}

// Initialize testimonials loader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing Testimonials Loader...');
  
  // Check if testimonials section exists
  const testimonialsSection = document.getElementById('ft-authority-section');
  if (testimonialsSection) {
    window.testimonialsLoader = new TestimonialsLoader();
  } else {
    console.warn('⚠️ TestimonialsLoader: ft-authority-section not found');
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestimonialsLoader;
}