/**
 * Projects Modal Loader (Notable Transactions)
 * Fetches "Notable Transactions" from Sanity and renders them in the modal.
 * Implements property type filtering (Villa, Apartment, etc).
 */

class ProjectsModalLoader {
  constructor() {
    this.container = document.getElementById('projects-grid');
    this.tabsContainer = document.getElementById('projects-filter-tabs');
    this.loader = document.getElementById('projects-loader');
    
    // Default search types until data loads
    this.propertyTypes = new Set(['Villa', 'Apartment', 'Penthouse', 'Townhouse']);
    this.currentFilter = 'all';
    this.transactions = []; // Store fetched data
    this.isLoaded = false;
  }

  init() {
    // Wait for Sanity Config
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
      return;
    }
    
    // Only load when modal is opened to save resources
    const modal = document.getElementById('projectsModal');
    if (modal) {
      modal.addEventListener('show.bs.modal', () => {
        if (!this.isLoaded) {
          this.loadData();
        }
      });
      // Reset filter on close
      modal.addEventListener('hidden.bs.modal', () => {
        this.filterBy('all');
        this.updateActiveTab('all');
      });
    }
  }

  async loadData() {
    // If container not found (maybe because script ran before DOM update), re-query
    if (!this.container) this.container = document.getElementById('projects-grid');
    if (!this.tabsContainer) this.tabsContainer = document.getElementById('projects-filter-tabs');
    if (!this.loader) this.loader = document.getElementById('projects-loader');

    if (!this.container) return;
    
    // Show Loader
    this.container.style.display = 'none';
    if (this.loader) this.loader.style.display = 'block';

    try {
      if (window.SanityPropertyFetcher) {
        // Query: Notable Transactions only
        const query = `*[_type == "property" && listingType == "notable"] | order(priceNumeric desc) {
            _id,
            title,
            location,
            price,
            status,
            propertyType,
            "description": pt::text(description),
            "imageUrl": coalesce(heroImage.asset->url, images[0].asset->url)
        }`;
        
        const results = await window.SanityPropertyFetcher._fetch(query);
        this.transactions = results || [];
        
        this.processPropertyTypes();
        this.renderTabs();
        this.renderCards(this.transactions);
        this.isLoaded = true;
      }
    } catch (err) {
      console.error('Failed to load notable transactions:', err);
      this.container.innerHTML = `<div class="col-12 text-center text-danger">Failed to load content.</div>`;
    } finally {
      if (this.loader) this.loader.style.display = 'none';
      if (this.container) this.container.style.display = 'grid';
    }
  }

  processPropertyTypes() {
    // Extract unique types from actual data
    if (this.transactions.length > 0) {
        // Filter out nulls and normalize
        const types = this.transactions
            .map(t => t.propertyType)
            .filter(Boolean)
            .map(t => t.toLowerCase()); // normalize to lowercase
            
        if (types.length > 0) {
            this.propertyTypes = new Set(types);
        }
    }
  }

  renderTabs() {
    if (!this.tabsContainer) return;
    
    // Capitalize helper
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    let html = `<button class="filter-tab active" data-filter="all">All Projects</button>`;
    
    // If we have actual types from data, use them. Otherwise fallback to defaults.
    const typesToRender = Array.from(this.propertyTypes);
    
    typesToRender.forEach(type => {
        const label = capitalize(type);
        html += `<button class="filter-tab" data-filter="${type}">${label}</button>`;
    });

    this.tabsContainer.innerHTML = html;

    // Attach listeners
    this.tabsContainer.querySelectorAll('.filter-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            this.filterBy(filter);
            this.updateActiveTab(filter);
        });
    });
  }

  updateActiveTab(filter) {
      this.tabsContainer.querySelectorAll('.filter-tab').forEach(btn => {
          if (btn.dataset.filter === filter) btn.classList.add('active');
          else btn.classList.remove('active');
      });
  }

  filterBy(filter) {
      this.currentFilter = filter;
      const cards = this.container.querySelectorAll('.project-card');
      
      cards.forEach(card => {
          const type = (card.dataset.type || '').toLowerCase(); 
          if (filter === 'all' || type === filter) {
              card.style.display = 'block';
              card.style.animation = 'fadeInUp 0.6s ease forwards';
          } else {
              card.style.display = 'none';
          }
      });
  }

  renderCards(items) {
      if (items.length === 0) {
          this.container.innerHTML = '<div class="col-12 text-center text-muted">No notable transactions found.</div>';
          return;
      }

      this.container.innerHTML = items.map(item => this.createCard(item)).join('');
      
      // Re-attach "View Details" to show an alert or modal (as requested by existing legacy code pattern)
      this.container.querySelectorAll('.project-view-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.preventDefault();
              alert(`View details for: ${btn.dataset.title}\nID: ${btn.dataset.id}`);
          });
      });
  }

  createCard(item) {
      const type = item.propertyType || 'unknown';
      const statusClass = item.status && item.status.toLowerCase() === 'sold' ? 'sold' : '';
      const statusText = item.status || 'Available';
      
      // Default image fallback
      const img = item.imageUrl || 'assets/images/placeholder.jpg';

      return `
        <div class="project-card" data-type="${type}" data-id="${item._id}">
          <div class="project-image-wrapper">
            <img src="${img}" alt="${item.title}" class="project-image">
            <div class="project-overlay">
              <div class="project-status ${statusClass}">${statusText}</div>
              <div class="project-hover-content">
                <div class="project-monogram">
                  <img src="assets/images/Logo/mronelogo2.png" alt="MR One Properties">
                </div>
                <button class="project-view-btn" data-id="${item._id}" data-title="${item.title}">View Details</button>
              </div>
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-name">${item.title}</h3>
            <p class="project-location">${item.location}</p>
            <div class="project-details">
              <span class="project-price">${item.price ? item.price + ' AED' : 'Price on Request'}</span>
              <span class="project-type">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </div>
            <p class="project-description w-line-clamp-3">${this.truncate(item.description, 100)}</p>
          </div>
        </div>
      `;
  }

  truncate(str, n) {
      if (!str) return '';
      return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ProjectsModalLoader();
    loader.init();
});
