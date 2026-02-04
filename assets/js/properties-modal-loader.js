/**
 * Properties Modal Loader for Dynamic Property Cards
 * Created: 2026-02-04
 * Purpose: Load all property cards from JSON with comprehensive rollback
 * Integrates: Valley & Grand Polo communities from centralized JSON data
 */

class PropertiesModalLoader {
  constructor() {
    this.properties = null;
    this.isLoaded = false;
    this.fallbackEnabled = false;
  }

  /**
   * Initialize the properties modal loader
   */
  async init() {
    try {
      await this.loadProperties();
      this.renderPropertyCards();
      this.isLoaded = true;
      console.log('✅ Properties Modal: Successfully initialized with JSON data');
    } catch (error) {
      console.warn('⚠️ Properties Modal: Failed to load JSON data, using fallback');
      console.error('Error details:', error);
      this.useFallback();
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
      
      if (!data || !data.communities) {
        throw new Error('Invalid JSON structure: Missing communities data');
      }
      
      this.properties = data;
      console.log('✅ Properties Modal: JSON data loaded successfully');
      
    } catch (error) {
      console.error('❌ Properties Modal: JSON loading failed:', error);
      throw error;
    }
  }

  /**
   * Use fallback when JSON fails - keeps existing HTML intact
   */
  useFallback() {
    this.fallbackEnabled = true;
    // Don't modify existing HTML - let hardcoded cards remain
    console.log('🔄 Properties Modal: Using existing hardcoded cards as fallback');
  }

  /**
   * Render all property cards dynamically
   */
  renderPropertyCards() {
    // Render Valley properties
    this.renderCommunityProperties('valley', 'valley-properties');
    
    // Render Grand Polo properties  
    this.renderCommunityProperties('grandpolo', 'grandpolo-properties');
    
    console.log('✅ Properties Modal: All property cards rendered from JSON');
  }

  /**
   * Render properties for a specific community
   */
  renderCommunityProperties(communityKey, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`❌ Properties Modal: Container ${containerId} not found`);
      return;
    }

    const communityData = this.properties.communities[communityKey];
    if (!communityData || !Array.isArray(communityData)) {
      console.error(`❌ Properties Modal: No data for community ${communityKey}`);
      return;
    }

    // Clear existing content
    container.innerHTML = '';
    
    // Generate property cards
    communityData.forEach(property => {
      const card = this.createPropertyCard(property);
      container.appendChild(card);
    });

    console.log(`✅ Properties Modal: Rendered ${communityData.length} cards for ${communityKey}`);
  }

  /**
   * Create a property card element from JSON data
   */
  createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';

    const priceFormatted = this.formatPrice(property.price, property.currency);

    card.innerHTML = `
      <div class="property-image-wrapper">
        <img src="${property.images.main}" alt="${property.name}" class="property-image">
        <div class="property-overlay">
          <div class="property-status">${property.status}</div>
          <div class="property-hover-content">
            <button class="property-details-btn" data-bs-toggle="modal" data-bs-target="#consultationModal">View More Details</button>
          </div>
        </div>
      </div>
      <div class="property-info">
        <h3 class="property-name">${property.name}</h3>
        <p class="property-description">${property.description}</p>
        
        <div class="property-details-grid">
          <div class="detail-item">
            <span class="detail-icon">💰</span>
            <div class="detail-content">
              <span class="detail-label">Starting from</span>
              <span class="detail-value">${priceFormatted}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">📋</span>
            <div class="detail-content">
              <span class="detail-label">Payment Plan</span>
              <span class="detail-value">${property.paymentPlan}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">📐</span>
            <div class="detail-content">
              <span class="detail-label">Area (sq. ft.)</span>
              <span class="detail-value">${property.area}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">📅</span>
            <div class="detail-content">
              <span class="detail-label">Handover</span>
              <span class="detail-value">${property.handover}</span>
            </div>
          </div>
          
          <div class="detail-item">
            <span class="detail-icon">🏠</span>
            <div class="detail-content">
              <span class="detail-label">Bedrooms</span>
              <span class="detail-value">${property.bedrooms}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    return card;
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
   * Emergency rollback to original hardcoded cards
   */
  async emergencyRollback() {
    try {
      console.log('🚨 Properties Modal: Executing emergency rollback...');
      
      const response = await fetch('assets/backup/properties-modal-original.html');
      if (!response.ok) throw new Error('Rollback file not found');
      
      const originalHtml = await response.text();
      
      // Replace the properties grid content
      const propertiesGrid = document.querySelector('.properties-grid');
      if (propertiesGrid) {
        propertiesGrid.innerHTML = originalHtml;
        console.log('✅ Properties Modal: Emergency rollback completed');
      }
      
    } catch (error) {
      console.error('❌ Properties Modal: Emergency rollback failed:', error);
      // Final fallback - reload page
      window.location.reload();
    }
  }

  /**
   * Refresh property data (for future API integration)
   */
  async refresh() {
    if (this.fallbackEnabled) {
      console.log('⚠️ Properties Modal: Cannot refresh - using fallback mode');
      return;
    }

    try {
      await this.loadProperties();
      this.renderPropertyCards();
      console.log('✅ Properties Modal: Data refreshed successfully');
    } catch (error) {
      console.error('❌ Properties Modal: Refresh failed:', error);
      this.useFallback();
    }
  }

  /**
   * Get property data by community and ID
   */
  getProperty(community, propertyId) {
    if (!this.properties || this.fallbackEnabled) return null;
    
    const communityData = this.properties.communities[community];
    if (!communityData) return null;
    
    return communityData.find(prop => prop.id === propertyId);
  }

  /**
   * Check if loader is working properly
   */
  getStatus() {
    return {
      isLoaded: this.isLoaded,
      fallbackEnabled: this.fallbackEnabled,
      hasData: !!this.properties
    };
  }
}

// Global instance
let propertiesModalLoader;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Slight delay to ensure other scripts are ready
  setTimeout(() => {
    propertiesModalLoader = new PropertiesModalLoader();
    propertiesModalLoader.init();
  }, 100);
});

// Global functions for external access
window.propertiesModalLoader = {
  refresh: () => propertiesModalLoader?.refresh(),
  emergencyRollback: () => propertiesModalLoader?.emergencyRollback(),
  getProperty: (community, id) => propertiesModalLoader?.getProperty(community, id),
  getStatus: () => propertiesModalLoader?.getStatus()
};