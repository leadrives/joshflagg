/**
 * Blog Manager - Dynamic Blog Functionality
 * Handles blog filtering, search, and dynamic content loading
 */

class BlogManager {
  constructor() {
    this.blogData = null;
    this.filteredBlogs = [];
    this.currentCategory = 'all';
    this.currentPage = 1;
    this.blogsPerPage = 6;
    this.searchTerm = '';
    
    this.init();
  }

  async init() {
    try {
      await this.loadBlogData();
      this.setupEventListeners();
      this.renderFeaturedBlog();
      this.renderBlogGrid();
    } catch (error) {
      console.error('Failed to initialize blog manager:', error);
      this.handleError();
    }
  }

  async loadBlogData() {
    // Check if Sanity data is available
    if (window.__SANITY_BLOGS__) {
      console.log('✅ Using blog data from Sanity');
      this.blogData = window.__SANITY_BLOGS__;
      this.filteredBlogs = [...this.blogData.blogs];
      console.log(`Successfully loaded ${this.blogData.blogs.length} blog articles from Sanity`);
      return;
    }

    try {
      console.log('Attempting to load blog data from data/blogs.json');
      const response = await fetch('data/blogs.json');
      if (!response.ok) {
        throw new Error(`Failed to load blog data: ${response.status} ${response.statusText}`);
      }
      this.blogData = await response.json();
      this.filteredBlogs = [...this.blogData.blogs];
      console.log(`Successfully loaded ${this.blogData.blogs.length} blog articles`);
    } catch (error) {
      console.warn('Failed to fetch blogs.json, using fallback data:', error);
      // Fallback to inline data when fetch fails (e.g., when serving files directly)
      this.blogData = this.getFallbackBlogData();
      this.filteredBlogs = [...this.blogData.blogs];
      console.log(`Using fallback data with ${this.blogData.blogs.length} blog articles`);
    }
  }

  getFallbackBlogData() {
    return {
      "blogs": [
        {
          "id": "why-villa-communities-next-to-top-schools-outperform-dubai",
          "title": "Why Villa Communities Next to Top Schools Will Outperform Under Dubai's E33 Strategy",
          "slug": "why-villa-communities-next-to-top-schools-outperform-dubai",
          "author": "Mohamad Ahmad",
          "date": "2025-02-05",
          "readTime": "11 min read",
          "category": "Investment Strategy",
          "tags": ["Dubai E33 Strategy", "Villa Communities", "Dubai Schools", "Real Estate Investment", "Mudon", "Tilal Al Ghaf"],
          "excerpt": "Dubai's Education 33 strategy is reshaping residential real estate. Discover why villa communities near premium schools are positioned for exceptional growth through 2033.",
          "featuredImage": "images/Why_Villa_Communities.webp",
          "featured": false
        },
        {
          "id": "can-ai-predict-real-estate-prices",
          "title": "Can AI Really Predict Real Estate Prices?",
          "slug": "can-ai-predict-real-estate-prices",
          "author": "Mohamad Ahmad",
          "date": "2026-02-05",
          "readTime": "15 min read",
          "category": "Technology",
          "tags": ["AI Technology", "Real Estate Prediction", "Market Analysis", "Investment Strategy"],
          "excerpt": "An honest analysis of AI's limitations in predicting real estate prices, examining why even billion-dollar companies like Zillow failed at property forecasting.",
          "featuredImage": "images/Can AI Really_Predict_Real_Estate_Prices.jpeg",
          "featured": true
        },
        {
          "id": "dubai-real-estate-market-2025-recap-record-year",
          "title": "Dubai Real Estate Market 2025 Recap: A Record Year",
          "slug": "dubai-real-estate-market-2025-recap-record-year",
          "author": "Mohamad Ahmad",
          "date": "2024-12-30",
          "readTime": "12 min read",
          "category": "Market Analysis",
          "tags": ["Dubai Real Estate", "Market Analysis", "2025 Recap", "Investment"],
          "excerpt": "Comprehensive review of Dubai's exceptional real estate performance in 2025, highlighting record-breaking sales, key trends, and market dynamics.",
          "featuredImage": "images/Dubai Real_Estate_Market_2025_Recap.webp",
          "featured": false
        },
        {
          "id": "15-best-restaurants-dubai-uae",
          "title": "15 Best Restaurants in Dubai, UAE",
          "slug": "15-best-restaurants-dubai-uae",
          "author": "Mohamad Ahmad",
          "date": "2024-07-25",
          "readTime": "10 min read",
          "category": "Lifestyle",
          "tags": ["Dining", "Restaurants", "Dubai Cuisine", "Fine Dining"],
          "excerpt": "Curated guide to Dubai's finest dining establishments, featuring diverse cuisines and exceptional culinary experiences.",
          "featuredImage": "images/dubaiSkyline.webp",
          "featured": false
        },
        {
          "id": "family-friendly-activities-dubai-uae",
          "title": "Family Friendly Activities in Dubai, UAE",
          "slug": "family-friendly-activities-dubai-uae",
          "author": "Mohamad Ahmad",
          "date": "2024-08-10",
          "readTime": "8 min read",
          "category": "Lifestyle",
          "tags": ["Family", "Activities", "Dubai Tourism", "Children"],
          "excerpt": "Comprehensive guide to family-friendly activities and attractions in Dubai, perfect for residents and visitors with children.",
          "featuredImage": "images/dubaiAppartments.webp",
          "featured": false
        }
      ]
    };
  }

  setupEventListeners() {
    // Category filter buttons
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleCategoryFilter(e.target.dataset.category);
      });
    });

    // Search input
    const searchInput = document.getElementById('blogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreBlogs();
      });
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        this.handleNewsletterSubmission(e);
      });
    }
  }

  handleCategoryFilter(category) {
    this.currentCategory = category;
    this.currentPage = 1;
    
    // Update active filter button
    document.querySelectorAll('.category-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    this.applyFilters();
    this.renderBlogGrid();
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase();
    this.currentPage = 1;
    this.applyFilters();
    this.renderBlogGrid();
  }

  applyFilters() {
    let filtered = [...this.blogData.blogs];

    // Apply category filter
    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(blog => 
        blog.category === this.currentCategory
      );
    }

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(this.searchTerm) ||
        blog.excerpt.toLowerCase().includes(this.searchTerm) ||
        blog.content.introduction.toLowerCase().includes(this.searchTerm) ||
        blog.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    this.filteredBlogs = filtered;
  }

  renderFeaturedBlog() {
    const featuredBlogCard = document.getElementById('featuredBlogCard');
    if (!featuredBlogCard || !this.blogData) return;

    // Get the first featured blog or most recent blog
    const featuredBlog = this.blogData.blogs.find(blog => blog.featured) || this.blogData.blogs[0];
    if (!featuredBlog) return;

    featuredBlogCard.innerHTML = this.generateFeaturedBlogHTML(featuredBlog);
  }

  generateFeaturedBlogHTML(blog) {
    return `
      <div class="featured-blog-image">
        <img src="${blog.featuredImage}" alt="${blog.title}" class="featured-image" onerror="this.src='../assets/images/featured-blog.avif'">
      </div>
      <div class="featured-blog-content">
        <div class="featured-blog-meta">
          <span class="featured-category">${blog.category}</span>
          <span class="featured-date">${this.formatDate(blog.date)}</span>
        </div>
        <h2 class="featured-title">
          <a href="${blog.slug}.html">${blog.title}</a>
        </h2>
        <p class="featured-excerpt">${blog.excerpt}</p>
        <div class="featured-author-info">
          <img src="../assets/images/Logo/mronelogo2.png" alt="${blog.author}" class="author-avatar">
          <div class="author-details">
            <span class="author-name">${blog.author}</span>
            <span class="author-title">Luxury Real Estate Expert</span>
          </div>
          <span class="read-time">${blog.readTime}</span>
        </div>
      </div>
    `;
  }

  renderBlogGrid() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    const blogsToShow = this.filteredBlogs.slice(0, this.currentPage * this.blogsPerPage);
    const hasMore = this.filteredBlogs.length > blogsToShow.length;

    // Clear existing content except featured blog
    blogGrid.innerHTML = '';

    // Render blog cards
    blogsToShow.forEach(blog => {
      const blogCard = this.generateBlogCardHTML(blog);
      blogGrid.insertAdjacentHTML('beforeend', blogCard);
    });

    // Update load more button
    this.updateLoadMoreButton(hasMore);

    // Add animation to new cards
    this.animateNewCards();
  }

  generateBlogCardHTML(blog) {
    return `
      <div class="col-lg-4 col-md-6 mb-4 blog-card-wrapper">
        <article class="blog-card" data-category="${blog.category}">
          <div class="blog-card-image">
            <img src="${blog.featuredImage}" alt="${blog.title}" class="blog-image" onerror="this.src='../assets/images/featured-blog.avif'">
            <div class="blog-card-overlay">
              <span class="blog-category">${blog.category}</span>
            </div>
          </div>
          <div class="blog-card-content">
            <div class="blog-meta">
              <span class="blog-date">${this.formatDate(blog.date)}</span>
              <span class="blog-read-time">${blog.readTime}</span>
            </div>
            <h3 class="blog-card-title">
              <a href="${blog.slug}.html">${blog.title}</a>
            </h3>
            <p class="blog-card-excerpt">${blog.excerpt}</p>
            <div class="blog-card-author">
              <span class="author-name">${blog.author}</span>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  loadMoreBlogs() {
    this.currentPage++;
    this.renderBlogGrid();
  }

  updateLoadMoreButton(hasMore) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    const textSpan = loadMoreBtn.querySelector('.load-more-text');
    const spinnerSpan = loadMoreBtn.querySelector('.load-more-spinner');

    if (hasMore) {
      loadMoreBtn.style.display = 'inline-flex';
      loadMoreBtn.disabled = false;
      if (textSpan) textSpan.textContent = 'Load More Articles';
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }

  animateNewCards() {
    const newCards = document.querySelectorAll('.blog-card-wrapper');
    newCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in-up');
      }, index * 100);
    });
  }

  handleNewsletterSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const consent = form.querySelector('input[type="checkbox"]').checked;
    
    if (!email || !consent) {
      alert('Please enter your email and agree to the terms.');
      return;
    }

    // Show loading state
    const submitBtn = form.querySelector('.newsletter-submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    submitBtn.disabled = true;

    // Simulate subscription
    setTimeout(() => {
      alert('Thank you for subscribing! You\'ll receive our latest insights soon.');
      form.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  }

  handleError() {
    console.error('Blog manager failed to initialize');
    
    // Show fallback content
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
      blogGrid.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-warning" role="alert">
            <h4>Unable to load blog articles</h4>
            <p>Please try refreshing the page or contact us if the problem persists.</p>
            <a href="../index.html" class="btn btn-primary">Return to Home</a>
          </div>
        </div>
      `;
    }
  }

  // Public method to get related articles for individual blog pages
  getRelatedArticles(currentBlogId, limit = 3) {
    if (!this.blogData) return [];
    
    const currentBlog = this.blogData.blogs.find(blog => blog.id === currentBlogId);
    if (!currentBlog) return [];

    // Get articles from same category first, then others
    let related = this.blogData.blogs.filter(blog => 
      blog.id !== currentBlogId && blog.category === currentBlog.category
    );

    // If not enough articles in same category, add from other categories
    if (related.length < limit) {
      const additional = this.blogData.blogs.filter(blog => 
        blog.id !== currentBlogId && 
        blog.category !== currentBlog.category &&
        !related.some(r => r.id === blog.id)
      );
      related = [...related, ...additional];
    }

    // Sort by date and limit
    return related
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {  // Listen for Sanity blog data if it loads after blog-manager initializes
  window.addEventListener('sanity-blogs-loaded', (event) => {
    if (window.blogManager && event.detail.blogData) {
      console.log('📦 Received Sanity blog data after initialization');
      window.blogManager.blogData = event.detail.blogData;
      window.blogManager.filteredBlogs = [...event.detail.blogData.blogs];
      window.blogManager.renderFeaturedBlog();
      window.blogManager.renderBlogGrid();
    }
  });
  window.blogManager = new BlogManager();
});

// Utility function for individual blog pages
function initBlogPage(blogId) {
  if (window.blogManager && window.blogManager.blogData) {
    const relatedArticles = window.blogManager.getRelatedArticles(blogId);
    renderRelatedArticles(relatedArticles);
  }
}

function renderRelatedArticles(articles) {
  const relatedContainer = document.getElementById('relatedArticles');
  if (!relatedContainer || !articles.length) return;

  const html = articles.map(article => `
    <div class="col-md-4">
      <article class="related-article-card">
        <div class="related-article-image">
          <img src="${article.featuredImage}" alt="${article.title}" onerror="this.src='../assets/images/featured-blog.avif'">
        </div>
        <div class="related-article-content">
          <span class="related-category">${article.category}</span>
          <h4 class="related-title">
            <a href="${article.slug}.html">${article.title}</a>
          </h4>
          <span class="related-date">${new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </article>
    </div>
  `).join('');

  relatedContainer.innerHTML = html;
}