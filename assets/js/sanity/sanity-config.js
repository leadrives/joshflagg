/**
 * Sanity Configuration
 * Update these values with your actual Sanity project details
 */

window.SanityConfig = {
  // TODO: Replace with your actual Sanity project ID from sanity.config.js
  projectId: 'xwla8vtz', // Your project ID here
  
  // TODO: Update dataset name if different
  dataset: 'production',
  
  // API version - use current date or stable version
  apiVersion: '2024-02-06',
  
  // CDN for faster reads (set to false for fresh data)
  useCdn: true,
  
  // Base URL for Sanity API
  get apiUrl() {
    return `https://${this.projectId}.api.sanity.io/v${this.apiVersion}/data/query/${this.dataset}`;
  }
};

// Validate configuration on load
(function validateConfig() {
  const config = window.SanityConfig;
  
  if (!config.projectId || config.projectId === 'your-project-id-here') {
    console.warn('⚠️ Sanity Config: projectId not set. Update assets/js/sanity/sanity-config.js');
  }
  
  if (!config.dataset) {
    console.warn('⚠️ Sanity Config: dataset not set. Update assets/js/sanity/sanity-config.js');
  }
  
  console.log('📡 Sanity Config loaded:', {
    projectId: config.projectId,
    dataset: config.dataset,
    apiVersion: config.apiVersion
  });
})();