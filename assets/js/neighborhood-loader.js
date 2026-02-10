/**
 * Neighborhood Loader
 * Dynamically loads neighborhood cards from Sanity
 */
document.addEventListener('DOMContentLoaded', async () => {
  const slider = document.querySelector('.neighborhoods-slider');
  if (!slider) return;

  // Configuration
  const config = window.SanityConfig;
  if (!config) {
    console.error('❌ Neighborhood Loader: SanityConfig missing');
    return;
  }

  const QUERY = encodeURIComponent(`*[_type == "neighborhood"] | order(name asc) {
    _id,
    name,
    "imageUrl": featuredImage.asset->url,
    "slug": slug.current
  }`);

  const URL = `https://${config.projectId}.api.sanity.io/v${config.apiVersion}/data/query/${config.dataset}?query=${QUERY}`;

  try {
    const res = await fetch(URL);
    const { result } = await res.json();

    if (!result || result.length === 0) {
      console.warn('⚠️ Neighborhood Loader: No neighborhoods found');
      return;
    }

    // Clear existing static slides
    // slider.innerHTML = ''; 
    // Wait... if we clear it, we lose the fallback.
    // Let's clear it only if we have data.
    
    const cardsHtml = result.map(n => `
      <div class="neighborhood-card" data-sanity-id="${n._id}" data-title="${n.name}">
        <a href="#" data-bs-toggle="modal" data-bs-target="#propertiesModal" class="neighborhood-link">
          <div class="neighborhood-image">
            <img src="${n.imageUrl || 'assets/images/placeholder.jpg'}" alt="${n.name}" loading="lazy">
          </div>
          <div class="neighborhood-title">
            <div class="vertical-line"></div>
            <span>${n.name}</span>
          </div>
        </a>
      </div>
    `).join('');

    slider.innerHTML = cardsHtml;
    console.log(`✅ Loaded ${result.length} neighborhoods from Sanity`);

  } catch (err) {
    console.error('❌ Neighborhood Loader Failed:', err);
    // Keep fallback HTML
  }
});
