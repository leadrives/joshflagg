/**
 * Hero Section - Sanity Integration
 * Loads hero content from Sanity homePage.heroSection
 * Fallback to existing hardcoded content if Sanity fails
 */

(function() {
  'use strict';

  // GROQ query for homepage hero data
  const HERO_QUERY = `*[_type=="homePage"][0]{
    heroSection{
      title,
      subtitle,
      ctaText,
      ctaLink,
      mediaType,
      youtubeId,
      posterImage{
        asset->{url}
      },
      heroImage{
        asset->{url}
      }
    }
  }`;

  // DOM selectors
  const SELECTORS = {
    heroTitle: '.hero-title',
    heroSubtitle: '.hero-subtitle',
    heroVideo: '.hero-bg-video',
    heroFallbackImg: '.hero-fallback-img', 
    heroSection: '.hero-section',
    ctaButtons: '.hero-buttons a'
  };

  /**
   * Safe YouTube ID extraction
   * Handles full URLs, nested URLs, and iframe tags
   * @param {string} urlOrId
   * @returns {string|null} 11-char ID or null
   */
  function getYouTubeId(urlOrId) {
    if (!urlOrId || typeof urlOrId !== 'string') return null;
    
    let input = urlOrId.trim();
    if (input.includes('%')) {
        try { input = decodeURIComponent(input); } catch (e) {}
    }

    // 1. Handle HTML strings (iframe tags)
    if (input.includes('<iframe') || input.includes('src=')) {
        const srcMatch = input.match(/src=["']([^"']+)["']/);
        if (srcMatch) input = srcMatch[1];
    }

    // Helper: Validates ID format (Exact 11 chars)
    const isValidId = (id) => /^[a-zA-Z0-9_-]{11}$/.test(id);

    // 2. Immediate check
    if (isValidId(input)) return input;

    // 3. Extraction Logic
    let extractedId = null;

    try {
        const urlStr = input.startsWith('http') ? input : `https://${input}`;
        const url = new URL(urlStr);

        // Check 'v' parameter
        if (url.searchParams.has('v')) {
            const v = url.searchParams.get('v');
            if (v.includes('http')) return getYouTubeId(v); // Recurse
            extractedId = v;
        }
        // Check /embed/ path
        else if (url.pathname.includes('/embed/')) {
            const parts = url.pathname.split('/');
            const embedIndex = parts.indexOf('embed');
            if (embedIndex !== -1 && embedIndex < parts.length - 1) {
                const afterEmbed = parts.slice(embedIndex + 1).join('/');
                if (afterEmbed.includes('http') || afterEmbed.includes('www.')) {
                    return getYouTubeId(afterEmbed);
                }
                extractedId = parts[embedIndex + 1];
            }
        }
        // Check youtu.be/ID
        else if (url.hostname.includes('youtu.be')) {
            extractedId = url.pathname.substring(1).split('/')[0];
        }
    } catch (e) { /* Not a URL, proceed to regex */ }

    if (extractedId && isValidId(extractedId)) return extractedId;

    // 4. Fallback Regex
    const patterns = [
        /[?&]v=([a-zA-Z0-9_-]{11})/,
        /\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];

    for (const p of patterns) {
        const match = input.match(p);
        if (match && isValidId(match[1])) return match[1];
    }

    return null;
  }

  /**
   * Create YouTube iframe element
   * @param {string} youtubeId - YouTube video ID
   * @param {string} posterUrl - Optional poster image URL
   * @returns {HTMLElement|null} - YouTube iframe wrapper or null if ID invalid
   */
  function createYouTubeIframe(youtubeId, posterUrl) {
    const videoId = getYouTubeId(youtubeId);
    
    if (!videoId) {
      console.warn('❌ Invalid YouTube ID provided:', youtubeId);
      return null;
    }

    console.log('🎥 Processed YouTube ID:', videoId);

    // Create iframe wrapper for proper styling
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-youtube-wrapper';
    wrapper.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: -3; /* Behind overlay */
    `;

    // Extract ID if a URL was provided
    // Logic moved to getYouTubeId()


    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'hero-youtube-iframe';
    
    // Safe YouTube embed parameters
    const embedParams = new URLSearchParams({
      autoplay: '1',
      mute: '1', 
      controls: '0',
      playsinline: '1',
      loop: '1',
      playlist: videoId, // Required for loop to work
      rel: '0', // Don't show related videos
      modestbranding: '1', // Minimal YouTube branding
      iv_load_policy: '3', // Hide annotations
      start: '0' // Start from beginning
    });
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?${embedParams.toString()}`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    // Style iframe to cover container
    iframe.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100vw;
      height: 56.25vw; /* 16:9 aspect ratio */
      min-height: 100vh;
      min-width: 177.78vh; /* 16:9 aspect ratio */
      transform: translate(-50%, -50%);
      border: none;
      pointer-events: none; /* Prevent interaction */
    `;

    // Add poster image as fallback if provided
    if (posterUrl) {
      const poster = document.createElement('div');
      poster.className = 'hero-youtube-poster';
      poster.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('${posterUrl}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: 2;
        opacity: 1;
        transition: opacity 3s ease-out;
      `;
      
      // Hide poster after iframe loads
      iframe.onload = () => {
        setTimeout(() => {
          poster.style.opacity = '0';
          setTimeout(() => poster.remove(), 3000);
        }, 2000);
      };
      
      wrapper.appendChild(poster);
    }

    wrapper.appendChild(iframe);
    return wrapper;
  }

  /**
   * Update hero background media
   * @param {object} heroSection - Hero section data from Sanity
   */
  function updateHeroMedia(heroSection) {
    const heroContainer = document.querySelector(SELECTORS.heroSection);
    const existingVideo = document.querySelector(SELECTORS.heroVideo);
    
    if (!heroContainer || !heroSection) return;

    // If YouTube video is specified
    if (heroSection.mediaType === 'youtube' && heroSection.youtubeId) {
      console.log('🎬 Setting up YouTube background video:', heroSection.youtubeId);
      
      // Create YouTube iframe
      const posterUrl = heroSection.posterImage?.asset?.url || heroSection.heroImage?.asset?.url;
      const youtubeIframe = createYouTubeIframe(heroSection.youtubeId, posterUrl);
      
      // Only proceed if frame was created (ID was valid)
      if (youtubeIframe) {
          // Hide existing video but keep it as fallback
          if (existingVideo) {
            existingVideo.style.display = 'none';
          }
          
          // Insert YouTube iframe after existing video
          if (existingVideo && existingVideo.parentNode) {
            existingVideo.parentNode.insertBefore(youtubeIframe, existingVideo.nextSibling);
          } else {
            heroContainer.insertBefore(youtubeIframe, heroContainer.firstChild);
          }
      }
      
    } else if (heroSection.heroImage?.asset?.url) {
      // Use image background
      console.log('🖼️ Setting up image background:', heroSection.heroImage.asset.url);
      
      // Hide video and show image fallback
      if (existingVideo) {
        existingVideo.style.display = 'none';
      }
      
      // Update fallback image
      const fallbackImg = document.querySelector(SELECTORS.heroFallbackImg);
      if (fallbackImg) {
        fallbackImg.src = heroSection.heroImage.asset.url;
        fallbackImg.style.display = 'block';
      } else {
        // Create new background image
        const bgImage = document.createElement('div');
        bgImage.className = 'hero-bg-image';
        bgImage.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('${heroSection.heroImage.asset.url}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 1;
        `;
        heroContainer.insertBefore(bgImage, heroContainer.firstChild);
      }
    }
  }

  /**
   * Update hero text content
   * @param {object} heroSection - Hero section data from Sanity
   */
  function updateHeroText(heroSection) {
    console.log('🔄 Updating hero text with data:', heroSection);
    
    // Update title
    const titleElement = document.querySelector(SELECTORS.heroTitle);
    console.log('📍 Title element found:', titleElement);
    if (titleElement && heroSection.title) {
      // Handle line breaks in title
      const formattedTitle = heroSection.title.replace(/\\n/g, '<br/>');
      titleElement.innerHTML = formattedTitle;
      console.log('✅ Updated hero title:', formattedTitle);
    } else {
      console.warn('❌ Title element not found or no title data');
    }

    // Update subtitle  
    const subtitleElement = document.querySelector(SELECTORS.heroSubtitle);
    console.log('📍 Subtitle element found:', subtitleElement);
    if (subtitleElement && heroSection.subtitle) {
      subtitleElement.textContent = heroSection.subtitle;
      console.log('✅ Updated hero subtitle:', heroSection.subtitle);
    } else {
      console.warn('❌ Subtitle element not found or no subtitle data');
    }

    // Update CTA button text and link
    const ctaButtons = document.querySelectorAll(SELECTORS.ctaButtons);
    console.log('📍 CTA buttons found:', ctaButtons.length);
    if (ctaButtons.length > 0 && heroSection.ctaText) {
      // Update first button (primary CTA)
      const primaryCta = ctaButtons[0];
      if (primaryCta) {
        primaryCta.textContent = heroSection.ctaText;
        if (heroSection.ctaLink) {
          primaryCta.href = heroSection.ctaLink;
        }
        console.log('✅ Updated primary CTA button:', heroSection.ctaText);
      }
    } else {
      console.warn('❌ CTA buttons not found or no CTA text data');
    }
  }

  /**
   * Load and apply hero content from Sanity
   */
  async function loadHeroFromSanity() {
    // Check if SanityRead is available
    if (!window.SanityRead) {
      console.warn('⚠️ SanityRead not available, keeping existing hero content');
      return;
    }

    try {
      console.log('🔄 Loading hero content from Sanity...');
      
      // Query Sanity for hero data
      const result = await window.SanityRead.query(HERO_QUERY);
      
      if (!result || !result.heroSection) {
        console.warn('⚠️ No hero data found in Sanity, keeping existing content');
        return;
      }

      const heroSection = result.heroSection;
      console.log('📦 Hero data loaded:', heroSection);

      // Update content
      updateHeroText(heroSection);
      updateHeroMedia(heroSection);
      
      console.log('✅ Hero section updated from Sanity successfully');
      
    } catch (error) {
      console.error('❌ Failed to load hero from Sanity:', error);
      console.log('🔄 Keeping existing hero content as fallback');
    }
  }

  /**
   * Initialize hero section
   */
  function init() {
    console.log('🚀 Hero section initializing...');
    
    // Wait for DOM and SanityRead to be ready
    if (document.readyState === 'loading') {
      console.log('⏳ DOM still loading, waiting...');
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    console.log('✅ DOM ready, checking SanityRead...');
    
    // Longer delay to ensure SanityRead and other scripts are initialized
    setTimeout(() => {
      if (window.SanityRead) {
        console.log('✅ SanityRead available, loading hero data...');
        loadHeroFromSanity();
      } else {
        console.error('❌ SanityRead not available!');
        // Try again after a longer delay
        setTimeout(() => {
          if (window.SanityRead) {
            console.log('✅ SanityRead available on retry, loading hero data...');
            loadHeroFromSanity();
          } else {
            console.error('❌ SanityRead still not available after retry!');
          }
        }, 1000);
      }
    }, 500);
  }

  // Initialize
  console.log('🚀 Hero section script loaded');
  init();

})();