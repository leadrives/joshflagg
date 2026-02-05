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
    try {
      const response = await fetch('data/blogs.json');
      if (!response.ok) {
        throw new Error('Failed to load blog data');
      }
      this.blogData = await response.json();
      this.filteredBlogs = [...this.blogData.blogs];
    } catch (error) {
      console.error('Error loading blog data:', error);
      throw error;
    }
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
document.addEventListener('DOMContentLoaded', () => {
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