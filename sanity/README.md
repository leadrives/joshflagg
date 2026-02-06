# Sanity CMS Setup for Josh Flagg Real Estate

This directory contains the Sanity Studio configuration for managing content on the Josh Flagg Real Estate website.

## 🏗️ Project Structure

```
sanity/
├── schemaTypes/
│   ├── siteSettings.ts      # Global site configuration
│   ├── homePage.ts          # Homepage content management
│   ├── property.ts          # Property listings
│   ├── blogPost.ts          # Blog articles
│   ├── neighborhood.ts      # Community/area information
│   ├── brandPartner.ts      # Partner/developer logos
│   ├── testimonial.ts       # Client testimonials
│   └── index.ts             # Schema exports
├── static/                  # Static assets
├── .env.local              # Environment variables
└── sanity.config.ts        # Main configuration
```

## 🚀 Quick Start

### 1. Start Development Server
```bash
cd sanity
npm run dev
```

This will start Sanity Studio at `http://localhost:3333`

### 2. Access Studio
- Open `http://localhost:3333` in your browser
- Sign in with your Sanity account credentials
- Start managing your content!

## 📝 Content Types Overview

### Core Content
- **Properties**: Villa listings, apartments, penthouses with images, pricing, and details
- **Blog Posts**: Real estate articles, market analysis, and guides
- **Neighborhoods**: Community information, amenities, and location details

### Site Management
- **Site Settings**: Global configurations, contact info, social media links
- **Homepage**: Hero sections, featured properties, notable transactions
- **Brand Partners**: Developer and partner logos for trust display
- **Testimonials**: Client feedback and success stories

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy Studio to Sanity hosting
npm run deploy

# Export data backup
npm run export

# Import data from backup
npm run import backup.tar.gz

# Open project management dashboard
npm run manage

# Open documentation
npm run docs
```

## 🌐 Environment Variables

Key variables in `.env.local`:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`: Your Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET`: Dataset name (usually "production")
- `NEXT_PUBLIC_SANITY_API_VERSION`: API version for consistency

## 📊 Data Migration

To migrate existing JSON data:
1. Start with the property.json data in `/assets/data/`
2. Import blog content from existing HTML files
3. Extract partner logos and testimonials
4. Configure homepage sections to match current design

## 🔗 Integration with Website

The schemas are designed to match your existing website structure:
- Property fields align with `properties.json`
- Blog posts support your current article format
- Homepage sections match your current layout
- All content types include SEO fields for optimization

## 🛡️ Security & Access

- Studio access is controlled via Sanity authentication
- API tokens can be generated for programmatic access
- Dataset can be configured as public (read-only) or private
- All write operations require authentication

## 📚 Next Steps

1. **Content Migration**: Import existing property and blog data
2. **Frontend Integration**: Connect your HTML/CSS site to Sanity's APIs
3. **Deployment**: Deploy Studio to Sanity's hosting platform
4. **Team Access**: Invite team members to manage content

## 🆘 Support

- [Sanity Documentation](https://www.sanity.io/docs)
- [Schema Documentation](https://www.sanity.io/docs/schema-types)
- [Studio Configuration](https://www.sanity.io/docs/studio)

---

**Created**: February 2026  
**Version**: 1.0.0  
**Project**: Josh Flagg Real Estate CMS
