/**
 * Navigation Section - Sanity Integration
 * Loads navigation and logo from Sanity siteSettings
 * Fallback to existing hardcoded content if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for site settings with navigation and logo
  const SITE_SETTINGS_QUERY = `*[_type=="siteSettings"][0]{
    title,
    logo{
      asset->{url}
    },
    navigation{
      leftLinks[]{
        label,
        url,
        isModal,
        modalTarget
      },
      rightLinks[]{
        label,
        url,
        isButton,
        isModal,
        modalTarget
      }
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    // Logo selectors
    logoImages: '.logo-img',
    
    // Desktop navigation
    leftLinksContainer: '.navbar .d-none.d-lg-flex.me-auto',
    rightLinksContainer: '.navbar .d-none.d-lg-flex.ms-auto',
    
    // Mobile navigation
    mobileLinksContainer: '.navbar .d-lg-none .d-flex.flex-column:first-child',
    mobileSecondaryContainer: '.navbar .d-lg-none .d-flex.flex-column.mt-3'
  };

  /**
   * Attach click listeners to all mobile nav links so the Bootstrap
   * collapse menu closes automatically when a link is tapped.
   * Safe to call multiple times (uses event delegation on the collapse element).
   */
  function setupMobileNavAutoClose() {
    const navbarCollapse = document.getElementById('navbarContent');
    if (!navbarCollapse) return;

    // Remove previous delegated listener (if any) to avoid duplicates
    if (navbarCollapse._mobileCloseHandler) {
      navbarCollapse.removeEventListener('click', navbarCollapse._mobileCloseHandler);
    }

    const handler = function(e) {
      // Only act on link / button clicks inside the mobile nav area
      const link = e.target.closest('a.navigation__link, a.btn');
      if (!link) return;

      // Only collapse when we're actually on mobile (collapse is visible)
      if (!navbarCollapse.classList.contains('show')) return;

      // Use Bootstrap API to toggle/hide the collapse
      const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse, { toggle: false });
      bsCollapse.hide();
    };

    navbarCollapse.addEventListener('click', handler);
    navbarCollapse._mobileCloseHandler = handler;

    console.log('✅ Mobile nav auto-close handler attached');
  }

  /**
   * Update logo images
   * @param {object} siteSettings - Site settings data from Sanity
   */
  function updateLogo(siteSettings) {
    if (!siteSettings.logo?.asset?.url) {
      console.log('⚠️ No logo URL found in Sanity, keeping existing logo');
      return;
    }

    const logoImages = document.querySelectorAll(SELECTORS.logoImages);
    const logoUrl = siteSettings.logo.asset.url;
    
    logoImages.forEach(img => {
      img.src = logoUrl;
      img.alt = siteSettings.title || 'Site Logo';
    });
    
    console.log('✅ Updated', logoImages.length, 'logo images to:', logoUrl);
  }

  /**
   * Create navigation link HTML
   * @param {object} link - Link data from Sanity
   * @param {boolean} isDesktop - Whether this is for desktop navigation
   * @returns {string} - HTML string for the link
   */
  function createLinkHTML(link, isDesktop = true) {
    const baseClasses = isDesktop ? 'navigation__link' : 'navigation__link';
    const buttonClasses = 'btn btn-outline-light btn-sm';
    
    const classes = link.isButton ? buttonClasses : baseClasses;
    const modalAttrs = link.isModal ? `data-bs-toggle="modal" data-bs-target="${link.modalTarget}"` : '';
    
    return `<a href="${link.url}" class="${classes}" ${modalAttrs}>${link.label}</a>`;
  }

  /**
   * Update desktop navigation
   * @param {object} navigation - Navigation data from Sanity
   */
  function updateDesktopNavigation(navigation) {
    // Update left links
    const leftContainer = document.querySelector(SELECTORS.leftLinksContainer);
    if (leftContainer && navigation.leftLinks) {
      const leftLinksHTML = navigation.leftLinks.map(link => createLinkHTML(link, true)).join('\n          ');
      leftContainer.innerHTML = leftLinksHTML;
      console.log('✅ Updated desktop left navigation with', navigation.leftLinks.length, 'links');
    }

    // Update right links
    const rightContainer = document.querySelector(SELECTORS.rightLinksContainer);
    if (rightContainer && navigation.rightLinks) {
      // Create right links HTML - preserve the structure with me-3 spacing for non-button links
      let rightLinksHTML = '';
      navigation.rightLinks.forEach((link, index) => {
        const isLastItem = index === navigation.rightLinks.length - 1;
        const spacing = !link.isButton && !isLastItem ? ' me-3' : '';
        const classes = link.isButton ? 'btn btn-outline-light btn-sm' : `navigation__link${spacing}`;
        const modalAttrs = link.isModal ? `data-bs-toggle="modal" data-bs-target="${link.modalTarget}"` : '';
        
        rightLinksHTML += `<a href="${link.url}" class="${classes}" ${modalAttrs}>${link.label}</a>\n          `;
      });
      
      rightContainer.innerHTML = rightLinksHTML.trim();
      console.log('✅ Updated desktop right navigation with', navigation.rightLinks.length, 'links');
    }
  }

  /**
   * Update mobile navigation
   * @param {object} navigation - Navigation data from Sanity
   */
  function updateMobileNavigation(navigation) {
    // Update first mobile section (main links)
    const mobileContainer = document.querySelector(SELECTORS.mobileLinksContainer);
    if (mobileContainer && navigation.leftLinks) {
      // Add both left links and first right link (non-button) to mobile main section
      const allMainLinks = [...navigation.leftLinks];
      
      // Add non-button right links to main section
      if (navigation.rightLinks) {
        navigation.rightLinks.forEach(link => {
          if (!link.isButton) {
            allMainLinks.push(link);
          }
        });
      }
      
      const mobileLinksHTML = allMainLinks.map(link => createLinkHTML(link, false)).join('\n            ');
      mobileContainer.innerHTML = mobileLinksHTML;
      
      console.log('✅ Updated mobile main navigation with', allMainLinks.length, 'links');
    }

    // Update second mobile section (button links)
    const mobileSecondaryContainer = document.querySelector(SELECTORS.mobileSecondaryContainer);
    if (mobileSecondaryContainer && navigation.rightLinks) {
      const buttonLinks = navigation.rightLinks.filter(link => link.isButton);
      const secondaryLinksHTML = buttonLinks.map(link => createLinkHTML(link, false)).join('\n            ');
      
      mobileSecondaryContainer.innerHTML = secondaryLinksHTML;
      console.log('✅ Updated mobile secondary navigation with', buttonLinks.length, 'button links');
    }
  }

  /**
   * Update navigation content
   * @param {object} siteSettings - Site settings data from Sanity
   */
  function updateNavigation(siteSettings) {
    if (!siteSettings.navigation) {
      console.warn('⚠️ No navigation data found in Sanity, keeping existing navigation');
      return;
    }

    const navigation = siteSettings.navigation;
    console.log('🔄 Updating navigation with data:', navigation);

    // Update desktop navigation
    updateDesktopNavigation(navigation);
    
    // Update mobile navigation
    updateMobileNavigation(navigation);

    // Re-attach mobile nav auto-close after DOM replacement
    setupMobileNavAutoClose();
    
    console.log('✅ Navigation updated successfully');
  }

  /**
   * Load and apply navigation and logo from Sanity
   */
  async function loadNavigationFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available, keeping existing navigation and logo');
      return;
    }

    try {
      console.log('🔄 Loading navigation and logo from Sanity...');
      
      // Query Sanity for site settings
      const result = await window.SanityRead.query(SITE_SETTINGS_QUERY);
      
      if (!result) {
        console.warn('⚠️ No site settings found in Sanity, keeping existing content');
        return;
      }

      console.log('📦 Site settings loaded:', result);

      // Update logo
      updateLogo(result);
      
      // Update navigation
      updateNavigation(result);
      
      console.log('✅ Navigation and logo updated from Sanity successfully');
      
    } catch (error) {
      console.error('❌ Failed to load navigation from Sanity:', error);
      console.log('🔄 Keeping existing navigation and logo as fallback');
    }
  }

  /**
   * Initialize navigation section
   */
  function init() {
    console.log('🚀 Navigation section initializing...');
    
    // Wait for DOM and SanityRead to be ready
    if (document.readyState === 'loading') {
      console.log('⏳ DOM still loading, waiting...');
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Attach mobile nav auto-close for hardcoded/fallback links immediately
    setupMobileNavAutoClose();

    console.log('✅ DOM ready, checking SanityRead...');
    
    // Delay to ensure SanityRead is initialized
    setTimeout(() => {
      if (window.SanityRead) {
        console.log('✅ SanityRead available, loading navigation data...');
        loadNavigationFromSanity();
      } else {
        console.error('❌ SanityRead not available for navigation!');
        // Try again after a longer delay
        setTimeout(() => {
          if (window.SanityRead) {
            console.log('✅ SanityRead available on retry, loading navigation data...');
            loadNavigationFromSanity();
          } else {
            console.error('❌ SanityRead still not available for navigation after retry!');
          }
        }, 1000);
      }
    }, 300); // Earlier than other sections to load first
  }

  // Initialize
  console.log('🚀 Navigation section script loaded');
  init();

})();