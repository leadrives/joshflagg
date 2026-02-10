/**
 * Notable Transactions - Sanity Integration
 * Loads notable transaction properties from Sanity homePage.notableTransactions
 * Fallback to existing loader if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for notable transactions data
  const NOTABLE_TRANSACTIONS_QUERY = `*[_type=="homePage"][0]{
    notableTransactions[]->{
      title,
      legacyId,
      listingType,
      location,
      fullAddress,
      priceDisplay,
      currency,
      status,
      saleDate,
      mainImage{
        asset->{url}
      },
      description
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    carouselInner: '#notableCarousel .carousel-inner',
    detailPrice: '.detail-price',
    detailName: '.detail-name',
    carouselElement: '#notableCarousel'
  };

  /**
   * Create a single carousel slide matching existing structure
   * @param {object} transaction - Property data from Sanity
   * @param {number} index - Slide index
   * @returns {HTMLElement} - Carousel slide element
   */
  function createSlide(transaction, index) {
    const slideDiv = document.createElement('div');
    slideDiv.className = `carousel-item ${index === 0 ? 'active' : ''}`;
    slideDiv.setAttribute('data-slide', index.toString());
    
    // Format price display
    const priceDisplay = transaction.priceDisplay || 
                        `${transaction.price} ${transaction.currency || 'AED'}`;
    
    // Get image URL
    const imageUrl = transaction.mainImage?.asset?.url || 
                    'assets/images/four-seasons-private-residences-al-maryah-island.webp';
    
    // Get property name/title
    const propertyName = transaction.title || transaction.name || 'Luxury Property';
    
    // Get status - map Sanity values to display text
    const statusMap = { 'sold': 'Sold', 'for-sale': 'For Sale' };
    const status = statusMap[transaction.status] || transaction.status || 'Available';
    
    slideDiv.innerHTML = `
      <div class="carousel-card">
        <img src="${imageUrl}" 
             class="card-img" 
             alt="${propertyName}"
             data-price="${priceDisplay}" 
             data-name="${propertyName}">
        <div class="status-label">${status}</div>
      </div>
    `;
    
    return slideDiv;
  }

  /**
   * Process transaction data to ensure compatibility
   * @param {array} transactions - Raw transactions from Sanity
   * @returns {array} - Processed transactions
   */
  function processTransactions(transactions) {
    if (!Array.isArray(transactions)) return [];

    const statusMap = { 'sold': 'Sold', 'for-sale': 'For Sale' };

    return transactions
      .filter(transaction => 
        transaction.listingType === 'notable' && 
        transaction.mainImage?.asset?.url
      )
      .map(transaction => ({
        id: transaction.legacyId || transaction._id,
        name: transaction.title,
        price: transaction.priceDisplay || `${transaction.price || '0'} ${transaction.currency || 'AED'}`,
        currency: transaction.currency || 'AED',
        status: statusMap[transaction.status] || transaction.status || 'Available',
        location: transaction.fullAddress || transaction.location,
        saleDate: transaction.saleDate,
        images: {
          main: transaction.mainImage.asset.url
        },
        // Keep both formats for compatibility
        title: transaction.title,
        priceDisplay: transaction.priceDisplay
      }));
  }

  /**
   * Render the notable transactions carousel
   * @param {array} transactions - Processed transaction data
   */
  function renderCarousel(transactions) {
    const carouselInner = document.querySelector(SELECTORS.carouselInner);
    
    if (!carouselInner) {
      console.error('❌ Notable Transactions: Carousel container not found');
      return false;
    }

    if (!transactions || transactions.length === 0) {
      console.warn('⚠️ No notable transactions data available');
      return false;
    }

    // Clear existing content
    carouselInner.innerHTML = '';

    // Create carousel slides
    transactions.forEach((transaction, index) => {
      const slide = createSlide(transaction, index);
      carouselInner.appendChild(slide);
    });

    // Update ALL detail-price and detail-name elements (mobile + desktop)
    if (transactions.length > 0) {
      const firstTransaction = transactions[0];
      document.querySelectorAll(SELECTORS.detailPrice).forEach(el => {
        el.textContent = firstTransaction.price;
      });
      document.querySelectorAll(SELECTORS.detailName).forEach(el => {
        el.textContent = firstTransaction.name || firstTransaction.title;
      });
    }

    console.log(`✅ Notable Transactions: Rendered ${transactions.length} slides from Sanity`);
    return true;
  }

  /**
   * Initialize Bootstrap carousel functionality
   * (Simplified version - full functionality is in original loader)
   */
  function initializeBootstrapCarousel() {
    const carouselElement = document.querySelector(SELECTORS.carouselElement);
    
    if (!carouselElement) {
      console.error('❌ Notable Transactions: Carousel element not found');
      return;
    }

    try {
      // Ensure Bootstrap carousel is initialized
      const existingCarousel = bootstrap.Carousel.getInstance(carouselElement);
      if (existingCarousel) {
        existingCarousel.dispose();
      }
      
      // Create new carousel instance
      new bootstrap.Carousel(carouselElement, {
        interval: false,
        ride: false
      });

      // Set up preview animation + button handlers for mobile + desktop
      const slides = carouselElement.querySelectorAll('.carousel-item');
      let currentIndex = 0;
      const totalSlides = slides.length;

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
          const carousel = bootstrap.Carousel.getInstance(carouselElement);
          if (!carousel) return;
          if (direction === 'prev') {
            carousel.prev();
          } else {
            carousel.next();
          }
        });
      });

      // Single slid event listener handles detail updates + preview positioning
      carouselElement.addEventListener('slid.bs.carousel', function(e) {
        currentIndex = parseInt(e.relatedTarget.dataset.slide) || 0;
        positionSlides();

        const activeImg = e.relatedTarget.querySelector('.card-img');
        if (activeImg) {
          const price = activeImg.dataset.price;
          const name = activeImg.dataset.name;
          if (price) document.querySelectorAll(SELECTORS.detailPrice).forEach(el => el.textContent = price);
          if (name) document.querySelectorAll(SELECTORS.detailName).forEach(el => el.textContent = name);
        }
      });

      // Initialize preview positions
      setTimeout(() => positionSlides(), 200);

      console.log('✅ Bootstrap carousel initialized for Sanity data');
      
    } catch (error) {
      console.warn('⚠️ Bootstrap carousel initialization failed:', error);
    }
  }

  /**
   * Load and apply notable transactions from Sanity
   */
  async function loadNotableTransactionsFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available, will use fallback loader');
      return false;
    }

    try {
      console.log('🔄 Loading notable transactions from Sanity...');
      
      // Query Sanity for notable transactions data
      const result = await window.SanityRead.query(NOTABLE_TRANSACTIONS_QUERY);
      
      if (!result || !result.notableTransactions || result.notableTransactions.length === 0) {
        console.warn('⚠️ No notable transactions found in Sanity, will use fallback loader');
        return false;
      }

      console.log('📦 Notable transactions data loaded:', result.notableTransactions);

      // Process transactions data
      const processedTransactions = processTransactions(result.notableTransactions);
      
      if (processedTransactions.length === 0) {
        console.warn('⚠️ No valid notable transactions after processing, will use fallback loader');
        return false;
      }

      // Render carousel
      const success = renderCarousel(processedTransactions);
      
      if (!success) {
        console.warn('⚠️ Failed to render Sanity data, will use fallback loader');
        return false;
      }

      // Initialize Bootstrap carousel
      initializeBootstrapCarousel();
      
      // Set flag to prevent original loader from running
      window.__SANITY_NOTABLE_DONE__ = true;
      
      console.log('✅ Notable transactions loaded from Sanity successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to load notable transactions from Sanity:', error);
      console.log('🔄 Will fall back to existing loader');
      return false;
    }
  }

  /**
   * Initialize notable transactions section
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Check if carousel exists on this page
    if (!document.querySelector(SELECTORS.carouselElement)) {
      console.log('ℹ️ Notable transactions carousel not found on this page');
      return;
    }

    // Small delay to ensure SanityRead and Bootstrap are initialized
    setTimeout(async () => {
      const success = await loadNotableTransactionsFromSanity();
      
      if (!success) {
        console.log('🔄 Sanity loading failed, original loader will handle fallback');
      }
    }, 500); // Run before the original loader's 1000ms delay
  }

  // Initialize
  init();

})();