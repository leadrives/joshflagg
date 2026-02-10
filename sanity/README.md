# Sanity CMS Setup for Josh Flagg Real Estate

This directory contains the Sanity Studio configuration and migration tools for managing content on the Josh Flagg Real Estate website.

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
├── scripts/
│   ├── _utils/
│   │   └── assetUploader.js # Image upload utility with caching
│   ├── import-properties.js # Property data migration
│   ├── import-blogs.js      # Blog content migration
│   └── .asset-cache.json    # Asset upload cache (generated)
├── lib/
│   ├── sanityClientWrite.js # Write client with auth token
│   └── sanityClientRead.js  # Read-only client
├── .env                     # Environment variables (add to .gitignore)
├── .env.example            # Environment template
└── sanity.config.ts        # Main configuration
```

## 🚀 Quick Start

### 1. Environment Setup
```bash
cd sanity
cp .env.example .env
```

Edit `.env` with your credentials:
```
SANITY_PROJECT_ID=your-project-id
SANITY_DATASET=production
SANITY_API_VERSION=2024-08-01
SANITY_WRITE_TOKEN=your-write-token
```

**⚠️ IMPORTANT**: Never commit the `.env` file. Use `.env.example` for documentation.

### 2. Start Development Server
```bash
npm run dev
```

This will start Sanity Studio at `http://localhost:3333`

### 3. Access Studio
- Open `http://localhost:3333` in your browser
- Sign in with your Sanity account credentials
- Start managing your content!

## 📊 Data Migration

### Import Commands

```bash
# Run dry-run to see what would happen (recommended first)
npm run import:dry

# Import properties only
npm run import:properties

# Import blogs only  
npm run import:blogs

# Import everything
npm run import:all
```

### Import Features
- **Idempotent**: Re-running won't create duplicates
- **Asset Upload**: Automatically uploads images to Sanity Assets
- **Asset Caching**: Prevents re-uploading same files
- **Legacy ID Preservation**: Maintains connection to original data
- **Error Handling**: Continues on errors, reports missing files
- **Dry Run Mode**: Preview changes before executing

### Troubleshooting Import Issues

#### 401 Authorization Error
```bash
# Check your token
echo $SANITY_WRITE_TOKEN

# Token should start with 'sk' and be about 40 characters
# Get token from: https://manage.sanity.io/projects/YOUR-PROJECT/settings/tokens
```

#### CORS Errors
```bash
# Add CORS origins in Sanity manage dashboard:
# https://manage.sanity.io/projects/YOUR-PROJECT/settings/api
# Add: http://localhost:3333 (for Studio)
```

#### Missing File Paths
- Check image paths in `properties.json` and `blogs.json`
- Ensure files exist in `/assets/images/` and `/blog/images/`
- Script reports missing files in summary

#### Network Issues
```bash
# Test connection
npm run test

# Check if project is accessible
curl "https://api.sanity.io/v1/projects/YOUR-PROJECT"
```

### File Path Resolution
The import scripts expect these image paths:
- Properties: `assets/images/...` (relative to repo root)
- Blogs: `blog/images/...` or `images/...` (relative to repo root)

Images are resolved from repo root automatically.

## 📝 Content Types Overview

### Core Content
- **Properties**: Villa listings, apartments, penthouses with images, pricing, and details
- **Blog Posts**: Real estate articles, market analysis, and guides with Portable Text content
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

# Data migration
npm run import:dry        # Preview import changes
npm run import:properties # Import property data
npm run import:blogs     # Import blog content
npm run import:all       # Import everything

# Backup & restore
npm run export           # Export data backup
npm run import backup.tar.gz # Import from backup

# Utilities
npm run manage          # Open project management dashboard
npm run docs           # Open documentation
npm run test           # Test connection
```

## 🌐 Environment Variables

Required variables in `.env`:
```
SANITY_PROJECT_ID=        # Your project ID from Sanity dashboard  
SANITY_DATASET=production # Dataset name
SANITY_API_VERSION=2024-08-01  # API version for consistency
SANITY_WRITE_TOKEN=       # Write token for migrations (starts with 'sk')
```

Legacy support (still works):
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`  
- `SANITY_API_TOKEN`

## 🔄 Migration Process

1. **Prepare Environment**
   ```bash
   cd sanity
   cp .env.example .env
   # Edit .env with your credentials
   ```

2. **Test Connection**
   ```bash
   npm run test
   ```

3. **Dry Run Import**
   ```bash
   npm run import:dry
   ```

4. **Run Full Import**
   ```bash
   npm run import:all
   ```

5. **Verify in Studio**
   - Check property documents under "Properties"
   - Review blog posts under "Blog Posts"  
   - Verify images uploaded correctly

## 🗃️ Asset Management

- **Automatic Upload**: Images are uploaded during migration
- **Deduplication**: SHA1 hashing prevents duplicate uploads
- **Cache File**: `.asset-cache.json` tracks uploaded assets
- **Error Recovery**: Missing files are reported, not blocking
- **Path Resolution**: Handles various image path formats

## 🔗 Integration with Website

The schemas are designed to match your existing website structure:
- Property fields align with `properties.json`
- Blog posts support your current article format with Portable Text conversion
- Homepage sections match your current layout
- All content types include SEO fields for optimization
- Legacy IDs preserved for reference and re-import capability

## 🛡️ Security & Access

- **Environment Variables**: Keep tokens secure, never commit `.env`
- **Write Token**: Only needed for imports, not for Studio usage
- **CORS**: Configure allowed origins in Sanity dashboard
- **Token Scope**: Use minimal permissions (Editor role sufficient)

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
