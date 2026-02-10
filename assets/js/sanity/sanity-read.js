/**
 * Sanity Read Client
 * Provides a simple interface for querying Sanity content
 * Requires: sanity-config.js to be loaded first
 */

window.SanityRead = (function() {
  'use strict';
  
  // Check if config is available
  if (typeof window.SanityConfig === 'undefined') {
    console.error('❌ SanityRead: SanityConfig not found. Make sure sanity-config.js is loaded first.');
    return null;
  }
  
  const config = window.SanityConfig;
  
  /**
   * Execute a GROQ query against Sanity
   * @param {string} groqQuery - GROQ query string
   * @param {object} params - Optional query parameters
   * @returns {Promise} - Promise resolving to query results
   */
  async function query(groqQuery, params = {}) {
    // Validate inputs
    if (!groqQuery || typeof groqQuery !== 'string') {
      console.error('❌ SanityRead.query: Invalid GROQ query provided');
      return null;
    }
    
    // Check configuration
    if (!config.projectId || !config.dataset) {
      console.warn('⚠️ SanityRead.query: Missing projectId or dataset in configuration');
      return null;
    }
    
    try {
      // Build query URL
      const queryUrl = new URL(config.apiUrl);
      queryUrl.searchParams.set('query', groqQuery);
      
      // Add parameters if provided
      if (params && Object.keys(params).length > 0) {
        queryUrl.searchParams.set('$', JSON.stringify(params));
      }
      
      // Log query for debugging
      console.log('🔍 Sanity Query:', groqQuery, params);
      
      // Execute fetch
      const response = await fetch(queryUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Check response status
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      
      // Log success
      console.log('✅ Sanity Query Success:', data.result?.length || 0, 'results');
      
      // Return results
      return data.result;
      
    } catch (error) {
      // Handle errors gracefully
      console.error('❌ SanityRead.query failed:', error.message);
      console.error('Query was:', groqQuery);
      
      // Return null to allow fallback handling
      return null;
    }
  }
  
  /**
   * Get a single document by ID
   * @param {string} documentId - Document ID to fetch
   * @returns {Promise} - Promise resolving to document or null
   */
  async function getDocument(documentId) {
    if (!documentId) {
      console.error('❌ SanityRead.getDocument: Document ID required');
      return null;
    }
    
    const groqQuery = `*[_id == $id][0]`;
    return await query(groqQuery, { id: documentId });
  }
  
  /**
   * Get documents by type
   * @param {string} docType - Document type (e.g., 'property', 'blogPost')
   * @param {number} limit - Optional limit (default: 100)
   * @returns {Promise} - Promise resolving to documents array or null
   */
  async function getDocumentsByType(docType, limit = 100) {
    if (!docType) {
      console.error('❌ SanityRead.getDocumentsByType: Document type required');
      return null;
    }
    
    const groqQuery = `*[_type == $type][0...$limit]`;
    return await query(groqQuery, { type: docType, limit: limit - 1 });
  }
  
  /**
   * Test connection to Sanity
   * @returns {Promise<boolean>} - True if connection works
   */
  async function testConnection() {
    console.log('🧪 Testing Sanity connection...');
    
    try {
      const result = await query('count(*)');
      
      if (result !== null) {
        console.log('✅ Sanity connection successful! Total documents:', result);
        return true;
      } else {
        console.warn('⚠️ Sanity connection test returned null');
        return false;
      }
    } catch (error) {
      console.error('❌ Sanity connection test failed:', error);
      return false;
    }
  }
  
  // Public API
  return {
    query,
    getDocument,
    getDocumentsByType,
    testConnection,
    
    // Expose config for debugging
    get config() {
      return config;
    }
  };
})();

// Auto-test connection in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Test connection after a short delay to ensure everything is loaded
  setTimeout(() => {
    if (window.SanityRead) {
      window.SanityRead.testConnection();
    }
  }, 1000);
}

// Log successful initialization
if (window.SanityRead) {
  console.log('🚀 SanityRead client initialized successfully');
} else {
  console.error('❌ SanityRead client failed to initialize');
}