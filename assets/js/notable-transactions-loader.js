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
        id: "fallback-park-gate-2",
        name: "Park Gate 2 by Emaar",
        price: "AED 14,12M",
        currency: "",
        status: "For Sale",
        images: { 
          main: "https://cdn.sanity.io/images/xwla8vtz/production/b91d7214b4550e12f5e6dd0a7fc1143b15d5f70f-2450x1400.jpg" 
        }
      },
      {
        id: "fallback-mareva-oasis", 
        name: "Mareva at The Oasis",
        price: "AED 13.47M",
        currency: "",
        status: "For Sale",
        images: { 
          main: "https://cdn.sanity.io/images/xwla8vtz/production/a897cd3cb14602fc992041f5000aa19c9a89f9e4-2450x1400.jpg" 
        }
      },
      {
        id: "fallback-creek-beach-grove",
        name: "Creek Beach Grove", 
        price: "AED 2,000,000",
        currency: "",
        status: "For Sale",
        images: { 
          main: "https://cdn.sanity.io/images/xwla8vtz/production/2548aeb2cdb33766316a27ff84648d705ce39f42-1920x1000.jpg" 
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
   * Load notable transactions from Sanity (via shared Fetcher)
   */
  async loadTransactions() {
    this.loadAttempts++;
    
    try {
      // Use Shared Fetcher if available
      if (window.SanityPropertyFetcher) {
        console.log('🔄 Notable Transactions: Fetching from Sanity...');
        const sanityData = await window.SanityPropertyFetcher.getNotableTransactions();
        
        if (sanityData && sanityData.length > 0) {
            // Transform Sanity data to expected format
            this.transactions = sanityData.map(item => ({
                id: item._id,
                name: item.title,
                price: item.price || 'Price on Request',
                currency: '',
                status: item.status === 'sold' ? 'Sold' : (item.status === 'for-sale' ? 'For Sale' : (item.status || 'Available')),
                images: {
                    main: item.imageUrl || 'assets/images/placeholder.webp'
                }
            }));
            return this.transactions;
        }
      }

      // Fallback to local JSON if Sanity returns nothing or fails
      console.warn('⚠️ Notable Transactions: Sanity returned no data, trying local JSON...');
      const response = await fetch('assets/data/properties.json?t=' + Date.now());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.notableTransactions || !Array.isArray(data.notableTransactions)) {
        throw new Error('Invalid JSON structure: notableTransactions not found');
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

    // Update ALL detail-price and detail-name elements (mobile + desktop)
    if (this.transactions.length > 0) {
      const firstTransaction = this.transactions[0];
      const displayPrice = firstTransaction.currency 
        ? `${firstTransaction.price} ${firstTransaction.currency}` 
        : firstTransaction.price;
      document.querySelectorAll('.detail-price').forEach(el => el.textContent = displayPrice);
      document.querySelectorAll('.detail-name').forEach(el => el.textContent = firstTransaction.name);
    }
  }

  /**
   * Create a single carousel slide
   */
  createSlide(transaction, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = `carousel-item ${index === 0 ? 'active' : ''}`;
    slideDiv.setAttribute('data-slide', index.toString());
    
    const displayPrice = transaction.currency 
      ? `${transaction.price} ${transaction.currency}` 
      : transaction.price;

    slideDiv.innerHTML = `
      <div class="carousel-card">
        <img src="${transaction.images.main}" 
             class="card-img" 
             alt="${transaction.name}"
             data-price="${displayPrice}" 
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
    const slides = document.querySelectorAll('#notableCarousel .carousel-item');
    
    let currentIndex = 0;
    const totalSlides = slides.length;

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

    // Update property info — update ALL instances (mobile + desktop)
    const updatePropertyInfo = (slideIndex) => {
      const activeSlide = slides[slideIndex];
      if (!activeSlide) return;
      const activeImg = activeSlide.querySelector('.card-img');
      
      if (activeImg) {
        const price = activeImg.dataset.price;
        const name = activeImg.dataset.name;
        
        if (price) document.querySelectorAll('.detail-price').forEach(el => el.textContent = price);
        if (name) document.querySelectorAll('.detail-name').forEach(el => el.textContent = name);
      }
    };

    // Remove data-bs-slide attributes to prevent Bootstrap's built-in handler
    // from conflicting with our custom navigation logic
    const allNavBtns = document.querySelectorAll('[data-bs-target="#notableCarousel"][data-bs-slide]');
    allNavBtns.forEach(btn => {
      const direction = btn.getAttribute('data-bs-slide');
      btn.removeAttribute('data-bs-slide');
      btn.removeAttribute('data-bs-target');
      btn.setAttribute('data-notable-dir', direction);

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const carousel = bootstrap.Carousel.getInstance(carouselEl);
        if (!carousel) return;
        if (direction === 'prev') {
          carousel.prev();
        } else {
          carousel.next();
        }
      });
    });

    // Handle carousel events — single listener for all updates
    if (carouselEl) {
      carouselEl.addEventListener('slid.bs.carousel', function (e) {
        currentIndex = parseInt(e.relatedTarget.dataset.slide) || 0;
        positionSlides();
        updatePropertyInfo(currentIndex);
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
          <img src="https://cdn.sanity.io/images/xwla8vtz/production/b91d7214b4550e12f5e6dd0a7fc1143b15d5f70f-2450x1400.jpg" 
               class="card-img" 
               alt="Park Gate 2 by Emaar"
               data-price="AED 14,12M" 
               data-name="Park Gate 2 by Emaar">
          <div class="status-label">For Sale</div>
        </div>
      </div>

      <!-- Slide 2 -->
      <div class="carousel-item" data-slide="1">
        <div class="carousel-card">
          <img src="https://cdn.sanity.io/images/xwla8vtz/production/a897cd3cb14602fc992041f5000aa19c9a89f9e4-2450x1400.jpg" 
               class="card-img" 
               alt="Mareva at The Oasis"
               data-price="AED 13.47M" 
               data-name="Mareva at The Oasis">
          <div class="status-label">For Sale</div>
        </div>
      </div>

      <!-- Slide 3 -->
      <div class="carousel-item" data-slide="2">
        <div class="carousel-card">
          <img src="https://cdn.sanity.io/images/xwla8vtz/production/2548aeb2cdb33766316a27ff84648d705ce39f42-1920x1000.jpg" 
               class="card-img" 
               alt="Creek Beach Grove"
               data-price="AED 2,000,000" 
               data-name="Creek Beach Grove">
          <div class="status-label">For Sale</div>
        </div>
      </div>
    `;

    // Reset detail info
    document.querySelectorAll('.detail-price').forEach(el => el.textContent = 'AED 14,12M');
    document.querySelectorAll('.detail-name').forEach(el => el.textContent = 'Park Gate 2 by Emaar');

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
  // Check if Sanity loader has already handled this
  if (window.__SANITY_NOTABLE_DONE__) {
    console.log('ℹ️ Notable Transactions: Sanity loader already handled, skipping JSON loader');
    return;
  }

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