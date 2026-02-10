# Sanity Migration Quick Reference

## 🚨 NEXT STEPS REQUIRED

### 1. Get Write Token
```
Visit: https://manage.sanity.io/projects/xwla8vtz/settings/tokens
Create token with "Editor" permissions
```

### 2. Add Token to .env
```bash
cd /Users/Dubai_Projects/joshflagg/sanity
echo "SANITY_WRITE_TOKEN=your_token_here" >> .env
```

### 3. Test & Import
```bash
npm run test        # Test connection
npm run import:dry  # Preview import
npm run import:all  # Run full import
```

## 📋 Current Status
✅ Project ID: xwla8vtz (fixed)
✅ Dataset: production  
✅ Read connection: Working
❌ Write token: **REQUIRED** for import

## Setup Commands

### From Repository Root (`/joshflagg`)
```bash
cd sanity
cp .env.example .env
# Edit .env with your credentials
```

### From Sanity Directory (`/joshflagg/sanity`)
```bash
# Test connection (always run first)
npm run test

# Preview what would be imported (dry run)
npm run import:dry

# Import everything
npm run import:all

# Import specific content
npm run import:properties
npm run import:blogs
```

## Environment Setup

Create `/joshflagg/sanity/.env`:
```
SANITY_PROJECT_ID=your-project-id-here
SANITY_DATASET=production
SANITY_API_VERSION=2024-08-01
SANITY_WRITE_TOKEN=sk_your_write_token_here
```

## File Structure After Setup

```
sanity/
├── .env                          # Your credentials (never commit)
├── scripts/
│   ├── _utils/
│   │   └── assetUploader.js      # Image upload utility
│   ├── import-properties.js      # Property migration script
│   ├── import-blogs.js           # Blog migration script 
│   ├── test-connection.js        # Connection test
│   └── .asset-cache.json         # Asset cache (generated after first run)
├── lib/
│   ├── sanityClientWrite.js      # Authenticated client
│   └── sanityClientRead.js       # Read-only client
└── ...
```

## Troubleshooting

### 401 Error
- Check `SANITY_WRITE_TOKEN` in `.env`
- Get token from: https://manage.sanity.io/projects/YOUR-PROJECT/settings/tokens

### CORS Error  
- Add origins in Sanity dashboard: https://manage.sanity.io/projects/YOUR-PROJECT/settings/api
- Add: `http://localhost:3333`

### Missing Files
- Check paths in `../../assets/data/properties.json`
- Check paths in `../../blog/data/blogs.json`
- Ensure image files exist in expected locations

### Import Hangs
- Run with dry mode first: `npm run import:dry`
- Check network connection
- Verify project access in Sanity dashboard

## Import Features

✅ **Idempotent**: Re-run safely without duplicates  
✅ **Asset Upload**: Automatically uploads images to Sanity  
✅ **Asset Caching**: Prevents re-uploading same files  
✅ **Legacy IDs**: Preserves original JSON IDs  
✅ **Error Recovery**: Continues on errors, reports issues  
✅ **Dry Run**: Preview before executing  

## Next Steps

1. Test connection: `npm run test`
2. Dry run: `npm run import:dry` 
3. Full import: `npm run import:all`
4. Verify in Studio: `npm run dev` → http://localhost:3333