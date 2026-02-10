/**
 * Sanity Property Fetcher
 * Centralized logic for fetching property data from Sanity
 */

class SanityPropertyFetcher {
  constructor() {
    this.config = window.SanityConfig;
  }

  /**
   * Helper to check config availability
   */
  _checkConfig() {
    if (!this.config) {
      console.warn('⚠️ Sanity Config missing. Waiting for init...');
      if (window.SanityConfig) this.config = window.SanityConfig;
      return !!this.config;
    }
    return true;
  }

  /**
   * Standard GROQ projection for Property documents
   */
  _getProjection() {
    return `{
      _id,
      title,
      legacyId,
      listingType,
      status,
      price,
      priceNumeric,
      location,
      "communityTitle": coalesce(community->title, community->name),
      "communityId": community->_id,
      "imageUrl": coalesce(heroImage.asset->url, images[0].asset->url),
      bedrooms,
      bathrooms,
      area,
      developer,
      propertyType,
      "description": pt::text(description)
    }`;
  }

  async _fetch(query) {
    if (!this._checkConfig()) {
        // Retry once after 500ms if config loads late
        await new Promise(r => setTimeout(r, 500));
        if (!this._checkConfig()) throw new Error('Sanity Config not initialized');
    }

    const url = `https://${this.config.projectId}.api.sanity.io/v${this.config.apiVersion}/data/query/${this.config.dataset}?query=${encodeURIComponent(query)}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Sanity fetch error: ${res.status}`);
      const { result } = await res.json();
      return result;
    } catch (err) {
      console.error('❌ Sanity Query Failed:', err);
      return [];
    }
  }

  /**
   * 1. Get Notable Transactions (Sold / Notable)
   */
  async getNotableTransactions() {
    // Only fetch properties explicitly marked as Notable Transactions
    const query = `*[_type == "property" && listingType == "notable"] | order(priceNumeric desc) ${this._getProjection()}`;
    return this._fetch(query);
  }

  /**
   * 2. Get Exclusive Listings (For Sale / Exclusive)
   */
  async getExclusiveListings() {
    // Priority: Explicit 'exclusive' type
    const query = `*[_type == "property" && listingType == "exclusive" && status != "sold"] | order(priceNumeric desc) ${this._getProjection()}`;
    return this._fetch(query);
  }

  /**
   * 2b. Get Curated Exclusive Listings (From HomePage)
   * This respects the manual global ordering set in Sanity Studio
   */
  async getCuratedExclusiveListings() {
    const projection = this._getProjection();
    // We need to unwrap the projection slightly because it expects to be at the document root, 
    // but here we are expanding an array of references.
    // Actually, query: *[_type=="homePage"][0].exclusiveListings.properties[]-> {...}
    
    // We reuse the projection string body by stripping outer braces if needed, 
    // but standard projection is fine if applied to the dereferenced object.
    
    const query = `*[_type=="homePage"][0].exclusiveListings{
      title,
      subtitle,
      "properties": properties[]->${projection}
    }`;
    
    return this._fetch(query);
  }

  /**
   * 3. Get Properties for Community (Related Inventory)
   */
  async getPropertiesByCommunity(communityId, communityName) {
    let filter = '';
    if (communityId) {
        filter = `community._ref == "${communityId}"`;
    } else if (communityName) {
        // Approximate match if no ID
        filter = `community->title match "${communityName}" || community->name match "${communityName}" || location match "${communityName}"`;
    } else {
        return [];
    }

    // Exclude sold properties from "Inventory"? Or keep them? Usually inventory = available.
    // Let's hide sold ones unless specified.
    const query = `*[_type == "property" && (${filter}) && status != "sold"] ${this._getProjection()}`;
    return this._fetch(query);
  }

  /**
   * 4. Get Single Property Details
   */
  async getPropertyById(id) {
    const query = `*[_type == "property" && _id == "${id}"][0] ${this._getProjection()}`;
    return this._fetch(query);
  }
}

// Attach to window for global access
window.SanityPropertyFetcher = new SanityPropertyFetcher();
