/**
 * Properties Modal Loader for Dynamic Property Cards via Sanity
 * Rewritten: 2026-02-04
 * Purpose: Load properties from Sanity based on clicked Neighborhood
 */

class PropertiesModalLoader {
  constructor() {
    this.currentNeighborhoodId = null;
  }

  init() {
    this.attachEventListeners();
    console.log('✅ Sanity Properties Loader: Initialized');
  }

  attachEventListeners() {
    // We use event delegation on the document to catch clicks on dynamically added neighborhood cards
    document.addEventListener('click', (e) => {
      // Find the closest neighborhood card
      const card = e.target.closest('.neighborhood-card');
      
      // Check if the click was inside a link that triggers the modal
      if (card && e.target.closest('[data-bs-target="#propertiesModal"]')) {
        const id = card.dataset.sanityId;
        const name = card.dataset.title;
        const communitySlug = card.dataset.community;
        
        if (id) {
          // Best case: We have the Sanity ID from dynamic loader
          this.loadPropertiesForNeighborhood(id, name);
        } else if (name || communitySlug) {
          // Fallback: We have name/slug from static HTML
          console.warn('⚠️ No Sanity ID found, falling back to name match');
          this.loadPropertiesForNeighborhood(null, name, communitySlug);
        }
      }
    });
  }

  async loadPropertiesForNeighborhood(neighborhoodId, neighborhoodName, communitySlug) {
    this.currentNeighborhoodId = neighborhoodId;
    
    // Use fallback name if available
    const displayName = neighborhoodName || communitySlug || 'Neighborhood';
    
    // UI Cleanup
    this.hideStaticContainers();
    
    // Update Modal Title
    const modalTitle = document.getElementById('propertiesModalLabel');
    if (modalTitle) modalTitle.textContent = `${displayName} Properties`;
    
    const modalSubtitle = document.querySelector('.properties-subtitle');
    if (modalSubtitle) modalSubtitle.textContent = `Discover Premium Developments in ${displayName}`;

    const container = document.getElementById('dynamic-properties');
    if (!container) return;
    
    // Show container and loading state
    container.style.display = 'contents';
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading properties for ${displayName}...</p>
      </div>
    `;

    // Fetch from Sanity
    try {
      const properties = await this.fetchProperties(neighborhoodId, neighborhoodName, communitySlug);
      this.renderProperties(properties, container, displayName);
    } catch (error) {
      console.error('Failed to load properties:', error);
      container.innerHTML = `
        <div class="col-12 text-center py-5 text-danger">
          <p>Unable to load properties. Please try again later.</p>
        </div>
      `;
    }
  }

  async fetchProperties(neighborhoodId, neighborhoodName, communitySlug) {
    if (!window.SanityPropertyFetcher) {
        throw new Error('SanityPropertyFetcher not loaded');
    }
    
    // Use the shared fetcher
    // Note: getPropertiesByCommunity handles ID or name/slug filtering
    return window.SanityPropertyFetcher.getPropertiesByCommunity(neighborhoodId, neighborhoodName || communitySlug);
  }

  renderProperties(properties, container, neighborhoodName) {
    if (!properties || properties.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <p class="text-muted">No properties found in ${neighborhoodName}.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = ''; // Clear loading spinner

    properties.forEach(prop => {
      const card = this.createPropertyCard(prop);
      container.appendChild(card);
    });
  }

  createPropertyCard(prop) {
    const card = document.createElement('div');
    card.className = 'property-card';
    
    // Format Price
    const priceDisplay = prop.price 
      ? `AED ${prop.price.toLocaleString()}` 
      : 'Price on Application';
      
    // Default Image
    const imageSrc = prop.imageUrl || 'assets/images/placeholder.jpg';

    // Generate HTML
    card.innerHTML = `
      <div class="property-image-wrapper">
        <img src="${imageSrc}" alt="${prop.title}" class="property-image">
        <div class="property-overlay">
          <div class="property-status">${prop.propertyType || 'Exclusive'}</div>
          <div class="property-hover-content">
            <button class="property-details-btn" 
              data-bs-toggle="modal" 
              data-bs-target="#consultationModal"
              data-property-name="${prop.title}"
              data-property-id="${prop._id}"
              data-property-community="${prop.communityName || ''}"
            >View More Details</button>
          </div>
        </div>
      </div>
      <div class="property-info">
        <h3 class="property-name">${prop.title}</h3>
        <p class="property-description">${this.truncate(prop.description, 100)}</p>
        
        <div class="property-details-grid">
          <div class="detail-item">
            <span class="detail-icon">💰</span>
            <div class="detail-content">
              <span class="detail-label">Price</span>
              <span class="detail-value">${priceDisplay}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">📐</span>
            <div class="detail-content">
              <span class="detail-label">Area (sq. ft.)</span>
              <span class="detail-value">${prop.area || 'TBD'}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">📅</span>
            <div class="detail-content">
              <span class="detail-label">Handover</span>
              <span class="detail-value">${prop.completionDate || 'TBD'}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">🏠</span>
            <div class="detail-content">
              <span class="detail-label">Bedrooms</span>
              <span class="detail-value">${prop.bedrooms || 'TBD'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  hideStaticContainers() {
    // List of known static IDs to hide
    const staticIds = ['valley-properties', 'grandpolo-properties'];
    staticIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }

  truncate(str, n) {
    if (!str) return '';
    return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  window.propertiesLoader = new PropertiesModalLoader();
  window.propertiesLoader.init();
});
