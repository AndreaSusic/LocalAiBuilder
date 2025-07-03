import express from 'express';
import { businessInfoClient } from './googleClient.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());

// Real GBP Business Information API endpoint
app.get('/api/gbp-business-info/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const gmb = businessInfoClient();
    
    console.log(`🏢 Fetching business info for location: ${locationId}`);
    
    // Fetch complete business information including products
    const response = await gmb.locations.get({
      name: `locations/${locationId}`,
      readMask: 'name,locationName,primaryCategory,categories,storefrontAddress,regularHours,specialHours,serviceArea,labels,adWordsLocationExtensions,profile,relationshipData,metadata'
    });
    
    console.log('📋 GBP Business Info Response:', JSON.stringify(response.data, null, 2));
    
    // Try to fetch products/services if available
    let products = [];
    try {
      const productsResponse = await gmb.locations.products.list({
        parent: `locations/${locationId}`
      });
      products = productsResponse.data.localPosts || [];
      console.log(`📦 Found ${products.length} products from GBP`);
    } catch (productError) {
      console.log('📦 No products found or error fetching products:', productError.message);
    }
    
    res.json({
      business: response.data,
      products: products,
      source: 'gbp_business_api'
    });
    
  } catch (error) {
    console.error('❌ GBP Business Info API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch GBP business information',
      details: error.response?.data || error.message
    });
  }
});

// Test endpoint for OAuth status
app.get('/api/oauth-status', (req, res) => {
  const hasRefreshToken = !!process.env.REFRESH_TOKEN;
  const hasClientId = !!process.env.CLIENT_ID;
  const hasClientSecret = !!process.env.CLIENT_SECRET;
  
  res.json({
    oauth_configured: hasRefreshToken && hasClientId && hasClientSecret,
    refresh_token: hasRefreshToken ? 'present' : 'missing',
    client_id: hasClientId ? 'present' : 'missing',
    client_secret: hasClientSecret ? 'present' : 'missing'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 GBP Business Information API Server running on port ${PORT}`);
  console.log(`📡 OAuth Status: ${process.env.REFRESH_TOKEN ? 'Configured' : 'Missing refresh token'}`);
});