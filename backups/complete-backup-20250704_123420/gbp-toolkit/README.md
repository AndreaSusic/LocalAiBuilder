# GBP Business Information API Toolkit

## Current Status

**❌ OAuth Required:** The Google My Business Business Information API requires OAuth authentication to access real business products/services from your Google Business Profile.

**✅ Ready to Deploy:** Once OAuth credentials are provided, this toolkit will fetch authentic business data.

## What's Currently Working

1. **Google Places API**: Basic business information (name, address, phone, photos, reviews)
2. **Website Extraction**: Fallback service extraction from business websites
3. **Infrastructure**: Complete API endpoints and error handling

## What Needs OAuth (GOOGLE_REFRESH_TOKEN)

1. **Real GBP Products**: The actual products/services you've configured in your Google Business Profile dashboard
2. **Business Categories**: Primary and secondary business categories
3. **Service Areas**: Geographic areas you serve
4. **Detailed Attributes**: Business-specific attributes and features

## API Endpoints

### Current (Working)
- `POST /api/gbp-details` - Google Places API + website extraction
- `GET /api/oauth-status` - Check OAuth configuration status

### Future (Needs OAuth)
- `GET /api/gbp-business-info/:locationId` - Real GBP Business Information API
- `GET /api/gbp-products/:locationId` - Direct GBP products/services

## Setting Up OAuth

1. **Google Cloud Console**
   - Enable "My Business Business Information API"
   - Create OAuth 2.0 credentials
   - Add scope: `https://www.googleapis.com/auth/business.manage`

2. **Generate Refresh Token**
   ```bash
   # Use Google OAuth playground or custom flow
   # Scope: https://www.googleapis.com/auth/business.manage
   ```

3. **Add to Replit Secrets**
   - `GOOGLE_REFRESH_TOKEN`: Your OAuth refresh token
   - `GOOGLE_CLIENT_ID`: OAuth client ID (already configured)
   - `GOOGLE_CLIENT_SECRET`: OAuth client secret (already configured)

## Testing

```bash
# Test current Google Places API
curl -X POST "http://localhost:5000/api/gbp-details" \
  -H "Content-Type: application/json" \
  -d '{"placeUrl": "https://maps.google.com/maps?place_id=ChIJvW8VATCFWUcRDDXH5bhDN4k"}'

# Check OAuth status
curl "http://localhost:5000/api/oauth-status"
```

## Data Flow

```
1. Google Places API (current) → Basic business info
2. Website Extraction (current) → Fallback services
3. GBP Business Information API (needs OAuth) → Real products/services
```