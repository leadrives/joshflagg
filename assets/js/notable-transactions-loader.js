/**
 * Notable Transactions Loader for Dynamic Content Loading
 * Created: 2026-02-04
 * Purpose: Load real notable transactions data from JSON with robust error handling
 * Rollback: Falls back to original hardcoded data if JSON fails to load
 * Bootstrap Integration: Works with existing Bootstrap carousel functionality
 */

class NotableTransactionsLoader {
  constructor() {
    this.transactions = null;
    this.fallbackData = [
      {
        id: "fallback-palm-jumeirah",
        name: "Palm Jumeirah Villa",
        price: "150,000,000",
        currency: "AED",
        status: "Sold",
        images: { 
          main: "assets/images/four-seasons-private-residences-al-maryah-island.webp" 
        }
      },
      {
        id: "fallback-downtown-penthouse", 
        name: "Downtown Dubai Penthouse",
        price: "85,000,000",
        currency: "AED",
        status: "Sold",
        images: { 
          main: "assets/images/the-row-saadiyat-aldar.webp" 
        }
      },
      {
        id: "fallback-dubai-marina",
        name: "Dubai Marina Tower", 
        price: "65,000,000",
        currency: "AED",
        status: "Sold",
        images: { 
          main: "assets/images/hudayriyat-island-modon.jpg" 
        }
      }
    ];
    this.isInitialized = false;
    this.loadAttempts = 0;
    this.maxRetries = 3;
  }

  /**
   * Initialize the notable transactions loader
   */
  async init() {
    try {
      await this.loadTransactions();
      this.renderCarousel();
      this.initializeBootstrapCarousel();
      this.isInitialized = true;
      console.log('✅ Notable Transactions Loader: Successfully initialized with real data');
    } catch (error) {
      console.warn('⚠️ Notable Transactions Loader: Failed to load real data, using fallback');
      console.error('Error details:', error);
      this.useFallbackData();
    }
  }

  /**
   * Load notable transactions from JSON file with retry logic
   */
  async loadTransactions() {
    this.loadAttempts++;
    
    try {
      const response = await fetch('assets/data/properties.json?t=' + Date.now());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.notableTransactions || !Array.isArray(data.notableTransactions)) {
        throw new Error('Invalid JSON structure: notableTransactions not found');
      }
      
      if (data.notableTransactions.length === 0) {
        throw new Error('No notable transactions data available');
      }
      
      this.transactions = data.notableTransactions;
      return this.transactions;
      
    } catch (error) {
      if (this.loadAttempts < this.maxRetries) {
        console.warn(`Notable Transactions: Retry ${this.loadAttempts}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.loadTransactions();
      }
      throw error;
    }
  }

  /**
   * Use fallback data when JSON loading fails
   */
  useFallbackData() {
    this.transactions = this.fallbackData;
    this.renderCarousel();
    this.initializeBootstrapCarousel();
    console.log('📦 Notable Transactions: Using fallback data');
  }

  /**
   * Render the notable transactions carousel
   */
  renderCarousel() {
    const carouselInner = document.querySelector('#notableCarousel .carousel-inner');
    const detailPrice = document.querySelector('.detail-price');
    const detailName = document.querySelector('.detail-name');
    
    if (!carouselInner) {
      console.error('Notable Transactions: Carousel container not found');
      return;
    }

    // Clear existing content
    carouselInner.innerHTML = '';

    // Create carousel slides
    this.transactions.forEach((transaction, index) => {
      const slide = this.createSlide(transaction, index);
      carouselInner.appendChild(slide);
    });

    // Update detail info with first transaction
    if (this.transactions.length > 0 && detailPrice && detailName) {
      const firstTransaction = this.transactions[0];
      detailPrice.textContent = `${firstTransaction.price} ${firstTransaction.currency}`;
      detailName.textContent = firstTransaction.name;
    }
  }

  /**
   * Create a single carousel slide
   */
  createSlide(transaction, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = `carousel-item ${index === 0 ? 'active' : ''}`;
    slideDiv.setAttribute('data-slide', index.toString());
    
    slideDiv.innerHTML = `
      <div class="carousel-card">
        <img src="${transaction.images.main}" 
             class="card-img" 
             alt="${transaction.name}"
             data-price="${transaction.price} ${transaction.currency}" 
             data-name="${transaction.name}">
        <div class="status-label">${transaction.status}</div>
      </div>
    `;
    
    return slideDiv;
  }

  /**
   * Initialize Bootstrap carousel functionality with preview animation
   */
  initializeBootstrapCarousel() {
    const carouselElement = document.getElementById('notableCarousel');
    
    if (!carouselElement) {
      console.error('Notable Transactions: Carousel element not found');
      return;
    }

    // Ensure Bootstrap carousel is initialized
    try {
      const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
      if (existingCarousel) {
        existingCarousel.dispose();
      }
      
      // Create new carousel instance
      new bootstrap.Carousel(carouselElement, {
        interval: false,
        ride: false
      });

      // Set up the preview animation system
      this.initializePreviewAnimation();

    } catch (error) {
      console.warn('Notable Transactions: Bootstrap carousel initialization failed', error);
    }
  }

  /**
   * Initialize the preview animation system (prev/next slides in background)
   */
  initializePreviewAnimation() {
    const carouselEl = document.getElementById('notableCarousel');
    const priceEl = document.querySelector('.detail-price');
    const nameEl = document.querySelector('.detail-name');
    const slides = document.querySelectorAll('#notableCarousel .carousel-item');
    const prevBtn = document.querySelector('[data-bs-target="#notableCarousel"][data-bs-slide="prev"]');
    const nextBtn = document.querySelector('[data-bs-target="#notableCarousel"][data-bs-slide="next"]');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    let isTransitioning = false;

    // Position slides for multi-preview layout
    const positionSlides = () => {
      slides.forEach((slide, index) => {
        slide.classList.remove('prev-preview', 'next-preview');
        
        if (index === (currentIndex - 1 + totalSlides) % totalSlides) {
          slide.classList.add('prev-preview');
        } else if (index === (currentIndex + 1) % totalSlides) {
          slide.classList.add('next-preview');
        }
      });
    };

    // Update property info
    const updatePropertyInfo = (slideIndex) => {
      const activeSlide = slides[slideIndex];
      const activeImg = activeSlide.querySelector('.card-img');
      
      if (activeImg && priceEl && nameEl) {
        const price = activeImg.dataset.price;
        const name = activeImg.dataset.name;
        
        if (price) priceEl.textContent = price;
        if (name) nameEl.textContent = name;
      }
    };

    // Handle manual navigation
    const navigateToSlide = (targetIndex) => {
      if (isTransitioning) return;
      
      isTransitioning = true;
      currentIndex = targetIndex;
      
      // Update Bootstrap carousel
      const carousel = bootstrap.Carousel.getInstance(carouselEl);
      if (carousel) {
        carousel.to(targetIndex);
      }
      
      setTimeout(() => {
        isTransitioning = false;
        positionSlides();
        updatePropertyInfo(currentIndex);
      }, 100);
    };

    // Custom button handlers
    if (prevBtn) {
      // Remove existing listeners to avoid conflicts
      prevBtn.replaceWith(prevBtn.cloneNode(true));
      const newPrevBtn = document.querySelector('[data-bs-target="#notableCarousel"][data-bs-slide="prev"]');
      
      newPrevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        navigateToSlide(newIndex);
      });
    }

    if (nextBtn) {
      // Remove existing listeners to avoid conflicts
      nextBtn.replaceWith(nextBtn.cloneNode(true));
      const newNextBtn = document.querySelector('[data-bs-target="#notableCarousel"][data-bs-slide="next"]');
      
      newNextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const newIndex = (currentIndex + 1) % totalSlides;
        navigateToSlide(newIndex);
      });
    }

    // Handle carousel events
    if (carouselEl) {
      carouselEl.addEventListener('slide.bs.carousel', function (e) {
        if (!isTransitioning) {
          isTransitioning = true;
          currentIndex = parseInt(e.relatedTarget.dataset.slide);
        }
      });
      
      carouselEl.addEventListener('slid.bs.carousel', function (e) {
        currentIndex = parseInt(e.relatedTarget.dataset.slide);
        positionSlides();
        updatePropertyInfo(currentIndex);
        isTransitioning = false;
      });

      // Initialize layout
      setTimeout(() => {
        positionSlides();
        updatePropertyInfo(currentIndex);
      }, 200);
    }

    // Store references for external access
    this.carouselControls = {
      positionSlides,
      updatePropertyInfo,
      navigateToSlide,
      currentIndex: () => currentIndex,
      totalSlides
    };
  }

  /**
   * Get transaction data for external use
   */
  getTransactions() {
    return this.transactions || [];
  }

  /**
   * Check if loader is initialized
   */
  isLoaded() {
    return this.isInitialized;
  }

  /**
   * Emergency rollback to original hardcoded state
   */
  emergencyRollback() {
    console.warn('🚨 Notable Transactions: Emergency rollback triggered');
    
    const carouselInner = document.querySelector('#notableCarousel .carousel-inner');
    if (!carouselInner) return;

    // Restore original hardcoded HTML
    carouselInner.innerHTML = `
      <!-- Slide 1 -->
      <div class="carousel-item active" data-slide="0">
        <div class="carousel-card">
          <img src="assets/images/four-seasons-private-residences-al-maryah-island.webp" 
               class="card-img" 
               alt="Palm Jumeirah Villa"
               data-price="150,000,000 AED" 
               data-name="Palm Jumeirah Villa">
          <div class="status-label">Sold</div>
        </div>
      </div>

      <!-- Slide 2 -->
      <div class="carousel-item" data-slide="1">
        <div class="carousel-card">
          <img src="assets/images/the-row-saadiyat-aldar.webp" 
               class="card-img" 
               alt="Downtown Dubai Penthouse"
               data-price="85,000,000 AED" 
               data-name="Downtown Dubai Penthouse">
          <div class="status-label">Sold</div>
        </div>
      </div>

      <!-- Slide 3 -->
      <div class="carousel-item" data-slide="2">
        <div class="carousel-card">
          <img src="assets/images/hudayriyat-island-modon.jpg" 
               class="card-img" 
               alt="Dubai Marina Tower"
               data-price="65,000,000 AED" 
               data-name="Dubai Marina Tower">
          <div class="status-label">Sold</div>
        </div>
      </div>
    `;

    // Reset detail info
    const detailPrice = document.querySelector('.detail-price');
    const detailName = document.querySelector('.detail-name');
    if (detailPrice) detailPrice.textContent = '150,000,000 AED';
    if (detailName) detailName.textContent = 'Palm Jumeirah Villa';

    // Reinitialize with original animation system
    this.initializeBootstrapCarousel();
    console.log('🔄 Notable Transactions: Emergency rollback completed');
  }

  /**
   * Get loader status for debugging
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      transactionCount: this.transactions ? this.transactions.length : 0,
      loadAttempts: this.loadAttempts,
      dataSource: this.transactions === this.fallbackData ? 'fallback' : 'json'
    };
  }
}

// Global instance
let notableTransactionsLoader = null;

// Auto-initialization when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize loader
  notableTransactionsLoader = new NotableTransactionsLoader();
  
  // Wait for other scripts to load and Bootstrap to be ready
  setTimeout(async () => {
    try {
      await notableTransactionsLoader.init();
    } catch (error) {
      console.error('Fatal error in Notable Transactions Loader:', error);
      // Final fallback - ensure something is displayed
      if (notableTransactionsLoader) {
        notableTransactionsLoader.emergencyRollback();
      }
    }
  }, 1000); // Increased delay to ensure all scripts are loaded
});

// Export for global access
window.notableTransactionsLoader = notableTransactionsLoader;