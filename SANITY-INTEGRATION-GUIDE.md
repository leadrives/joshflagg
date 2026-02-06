# Sanity CMS Integration Guide

This guide explains how to integrate your existing HTML/CSS/JavaScript website with Sanity CMS.

## 🏗️ Integration Architecture

```
Current Website (HTML/CSS/JS)
├── Static files remain unchanged
├── JavaScript loaders modified to fetch from Sanity
└── New Sanity client library added

Sanity CMS
├── Content management via Studio
├── REST API for data fetching
└── Image optimization & CDN
```

## 📡 API Integration Options

### Option 1: JavaScript Client (Recommended for HTML sites)
```html
<!-- Add to your HTML head -->
<script src="https://unpkg.com/@sanity/client@latest/umd/sanityClient.min.js"></script>
```

### Option 2: HTTP REST API (Alternative)
Direct HTTP requests to Sanity's REST API endpoints.

## 🔧 Implementation Steps

### 1. Create Sanity Client
Create `/assets/js/sanity-client.js`:

```javascript
const client = window.SanityClient({
  projectId: 'xwla8vtz', // Your project ID from sanity.config.ts
  dataset: 'production',
  apiVersion: '2024-02-06',
  useCdn: true, // Enable for faster, cached responses
})

// Export for use in other scripts
window.sanityClient = client;
```

### 2. Update Property Loader
Modify `/assets/js/property-loader.js`:

```javascript
// Replace JSON loading with Sanity API call
async function loadProperties() {
  try {
    const query = `
      *[_type == "property" && status == "for-sale"] | order(publishedAt desc) {
        _id,
        title,
        price,
        location,
        propertyType,
        bedrooms,
        bathrooms,
        area,
        "heroImageUrl": heroImage.asset->url,
        description,
        features,
        isFeatured,
        isExclusive
      }
    `;
    
    const properties = await window.sanityClient.fetch(query);
    return properties;
  } catch (error) {
    console.error('Error loading properties:', error);
    // Fallback to existing JSON file
    return loadPropertiesFromJSON();
  }
}
```

### 3. Update Blog Manager
Modify `/assets/js/blog-manager.js`:

```javascript
async function loadBlogPosts() {
  try {
    const query = `
      *[_type == "blogPost" && isPublished == true] | order(publishedAt desc) {
        _id,
        title,
        "slug": slug.current,
        excerpt,
        "featuredImageUrl": featuredImage.asset->url,
        "authorName": author.name,
        categories,
        readingTime,
        publishedAt,
        isFeatured
      }
    `;
    
    const blogPosts = await window.sanityClient.fetch(query);
    return blogPosts;
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return loadBlogsFromJSON();
  }
}
```

### 4. Update Homepage Content
Create `/assets/js/homepage-loader.js`:

```javascript
async function loadHomepageContent() {
  try {
    const query = `
      *[_type == "homePage"][0] {
        heroSection,
        featuredProperties {
          ...,
          "properties": properties[]-> {
            _id,
            title,
            price,
            location,
            "heroImageUrl": heroImage.asset->url
          }
        },
        aboutSection,
        seoSettings
      }
    `;
    
    const homepage = await window.sanityClient.fetch(query);
    return homepage;
  } catch (error) {
    console.error('Error loading homepage content:', error);
    return null;
  }
}

// Update hero section dynamically
async function updateHeroSection() {
  const content = await loadHomepageContent();
  if (content?.heroSection) {
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    
    if (heroTitle) heroTitle.textContent = content.heroSection.title;
    if (heroSubtitle) heroSubtitle.textContent = content.heroSection.subtitle;
  }
}
```

### 5. Image Optimization
Sanity provides automatic image optimization:

```javascript
// Helper function for optimized images
function getSanityImageUrl(asset, width = 800, quality = 90) {
  if (!asset?.url) return '';
  return `${asset.url}?w=${width}&q=${quality}&auto=format`;
}

// Usage in property cards
function renderPropertyCard(property) {
  const optimizedImageUrl = getSanityImageUrl(property.heroImage, 400, 85);
  // Use optimizedImageUrl in your template
}
```

## 📝 GROQ Query Examples

### Featured Properties
```groq
*[_type == "property" && isFeatured == true] | order(publishedAt desc) [0...6] {
  _id,
  title,
  price,
  location,
  "imageUrl": heroImage.asset->url,
  propertyType,
  bedrooms,
  bathrooms
}
```

### Blog Posts for Homepage
```groq
*[_type == "blogPost" && isPublished == true && isFeatured == true] [0...3] {
  _id,
  title,
  excerpt,
  "slug": slug.current,
  "imageUrl": featuredImage.asset->url,
  publishedAt,
  readingTime
}
```

### Notable Transactions
```groq
*[_type == "homePage"][0] {
  notableTransactions {
    title,
    transactions[] {
      propertyName,
      salePrice,
      location,
      saleDate,
      "imageUrl": image.asset->url
    }
  }
}
```

## 🚀 Deployment Steps

### 1. Test Integration Locally
1. Ensure Sanity Studio is running (`npm run dev` in `/sanity/`)
2. Add sample content through the Studio interface
3. Test API calls in browser developer console
4. Verify fallbacks work when Sanity is unavailable

### 2. Deploy Sanity Studio
```bash
cd sanity
npm run build
npm run deploy
```

This will give you a public Studio URL like: `https://yourproject.sanity.studio`

### 3. Update Production Configuration
Update your production HTML to use the deployed Sanity project:

```javascript
const client = window.SanityClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  apiVersion: '2024-02-06',
  useCdn: true,
})
```

### 4. Content Migration
Use the migration script to import existing data:

```bash
cd sanity
npm run migrate
```

## 🔄 Migration Strategy

### Phase 1: Parallel Operation
- Keep existing JSON files as fallback
- Gradually migrate sections (properties → blogs → homepage)
- Test each section thoroughly

### Phase 2: Sanity Primary
- Use Sanity as primary data source
- JSON files as backup only
- Monitor performance and reliability

### Phase 3: Full Migration
- Remove JSON dependencies
- Content managed entirely through Sanity
- Optimize for performance

## 📊 Performance Considerations

### Caching Strategy
```javascript
// Cache Sanity responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(query, params = {}) {
  const cacheKey = query + JSON.stringify(params);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await window.sanityClient.fetch(query, params);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### Image Optimization
- Use Sanity's CDN for automatic optimization
- Implement lazy loading for property images
- Use appropriate image sizes for different viewports

### Error Handling
```javascript
async function safeApiCall(apiFunction, fallbackFunction) {
  try {
    return await apiFunction();
  } catch (error) {
    console.warn('Sanity API call failed, using fallback:', error);
    return fallbackFunction();
  }
}
```

## 🛠️ Development Tools

### GROQ Playground
Access at `http://localhost:3333/vision` while Studio is running
- Test queries in real-time
- Explore your data structure
- Optimize query performance

### Browser DevTools
- Monitor API calls in Network tab
- Check cache performance
- Debug query responses

## 🔐 Security & API Tokens

### Public API (Read-only)
- No authentication needed for published content
- Enable CDN for better performance
- Safe for client-side use

### Private/Write API (Future enhancement)
```javascript
const writeClient = window.SanityClient({
  projectId: 'xwla8vtz',
  dataset: 'production',
  apiVersion: '2024-02-06',
  token: 'your-write-token', // Only if needed
  useCdn: false, // Don't use CDN for write operations
})
```

## 📈 Next Steps

1. **Start Integration**: Begin with property loading from Sanity
2. **Add Content**: Use Studio to add/edit properties and blog posts
3. **Test Thoroughly**: Ensure fallbacks work and performance is good
4. **Monitor Usage**: Track API calls and optimize as needed
5. **Expand Features**: Add new content types as your site grows

---

**Integration Guide Version**: 1.0  
**Compatible with**: Sanity v5.8.1+  
**Last Updated**: February 2026