/**
 * Parallax Hero Section - Sanity Integration
 * Loads mid-page parallax hero content from Sanity homePage.parallaxHero
 * Fallback to existing static content if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for parallax hero section
  const PARALLAX_HERO_QUERY = `*[_type=="homePage"][0]{
    parallaxHero {
      title,
      subtitle,
      image {
        asset->{url},
        hotspot,
        crop
      },
      logo {
        asset->{url}
      }
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    section: '#mid-parallax-hero',
    title: '#mid-parallax-hero .parallax-hero-title',
    subtitle: '#mid-parallax-hero .parallax-hero-subtitle',
    logo: '#mid-parallax-hero .parallax-logo-img',
    overlay: '#mid-parallax-hero .parallax-hero-overlay', 
  };

  /**
   * Update parallax hero section content
   * @param {object} heroData - Parallax hero data from Sanity
   */
  function updateParallaxHero(heroData) {
    if (!heroData) {
      console.log('ℹ️ No parallax hero data available');
      return false;
    }

    const section = document.querySelector(SELECTORS.section);
    if (!section) {
       console.warn('⚠️ Parallax Hero: Section element not found');
       return;
    }

    try {
      console.log('📝 Updating parallax hero with Sanity data...');

      // Update background image
      if (heroData.image && heroData.image.asset && heroData.image.asset.url) {
        section.style.backgroundImage = `url('${heroData.image.asset.url}')`;
        console.log('✅ Updated parallax hero background image');
      }

      // Update title
      if (heroData.title) {
        const titleEl = document.querySelector(SELECTORS.title);
        if (titleEl) {
          titleEl.textContent = heroData.title;
          console.log('✅ Updated parallax hero title:', heroData.title);
        }
      }

      // Update subtitle
      if (heroData.subtitle) {
        const subtitleEl = document.querySelector(SELECTORS.subtitle);
        if (subtitleEl) {
          subtitleEl.textContent = heroData.subtitle;
          console.log('✅ Updated parallax hero subtitle:', heroData.subtitle);
        }
      }

      // Update logo
      if (heroData.logo && heroData.logo.asset && heroData.logo.asset.url) {
        const logoEl = document.querySelector(SELECTORS.logo);
        if (logoEl) {
          logoEl.src = heroData.logo.asset.url;
          console.log('✅ Updated parallax hero logo');
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Error updating parallax hero:', error);
      return false;
    }
  }

  /**
   * Load and apply parallax hero data from Sanity
   */
  async function loadParallaxHeroFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available for parallax hero section');
      return false;
    }

    try {
      console.log('🔄 Loading parallax hero from Sanity...');
      
      // Query homepage data
      const result = await window.SanityRead.query(PARALLAX_HERO_QUERY);
      // console.log('📦 Parallax hero query result:', result);
      
      const heroData = result?.parallaxHero;
      
      if (!heroData) {
        console.warn('⚠️ No parallax hero data found in Sanity');
        return false;
      }

      // Update section with Sanity data
      const success = updateParallaxHero(heroData);
      
      if (success) {
        console.log('✅ Parallax hero loaded from Sanity successfully');
        window.__SANITY_PARALLAX_HERO_DONE__ = true;
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ Failed to load parallax hero from Sanity:', error);
      console.log('🔄 Keeping static fallback content');
      return false;
    }
  }
  
  /**
   * Initialize parallax hero loader
   */
  function init() {
     // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Check if section exists on this page
    if (!document.querySelector(SELECTORS.section)) {
      console.log('ℹ️ Parallax hero section not found on this page');
      return;
    }

    // Small delay to ensure SanityRead is initialized
    setTimeout(async () => {
       const success = await loadParallaxHeroFromSanity();
       
       if (!success) {
         console.log('ℹ️ Parallax hero: Using static fallback content');
       }
    }, 100); 
  }

  // Initialize
  init();

})();
