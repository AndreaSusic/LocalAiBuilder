// Helper to turn refresh token into bearer token
const { google } = require('googleapis');

async function getAccessToken(refreshToken) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "postmessage"  // redirect isn't used for refresh flow
  );
  oauth2.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2.refreshAccessToken();
  return credentials.access_token;  // valid ~60 min
}

// Fetch real GBP products/services 
async function fetchGbpProducts(locationId, refreshToken) {
  try {
    const token = await getAccessToken(refreshToken);
    
    // Try multiple API endpoints for GBP data
    const apiEndpoints = [
      // Business Information API with price lists
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=priceLists`,
      // Business Information API with basic info
      `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}`,
      // Account Management API for locations
      `https://mybusinessaccountmanagement.googleapis.com/v1/accounts/-/locations/${locationId.replace('locations/', '')}`
    ];
    
    for (const [index, url] of apiEndpoints.entries()) {
      console.log(`🔄 Trying GBP API endpoint ${index + 1}: ${url.split('?')[0]}`);
      
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.status === 429) {
          console.log('⚠️ Rate limit reached - quota may need increase in Google Cloud Console');
          if (index === apiEndpoints.length - 1) {
            throw new Error('GBP API quota exceeded - need to enable My Business API in Google Cloud Console');
          }
          continue;
        }
        
        if (response.status === 403) {
          console.log('⚠️ Permission denied - may need additional scopes or API enablement');
          continue;
        }
        
        if (!response.ok) {
          console.log(`❌ API endpoint ${index + 1} failed: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        console.log('🏢 GBP API Response:', JSON.stringify(data, null, 2));
        
        // Extract products from various possible locations in response
        let products = [];
        
        // Check for price lists
        if (data.priceLists?.[0]?.serviceItems) {
          products = data.priceLists[0].serviceItems;
          console.log(`📦 Found ${products.length} products in priceLists`);
        }
        
        // Check for services in other locations
        if (products.length === 0 && data.services) {
          products = data.services;
          console.log(`📦 Found ${products.length} products in services`);
        }
        
        // Check for menu items
        if (products.length === 0 && data.menuItems) {
          products = data.menuItems;
          console.log(`📦 Found ${products.length} products in menuItems`);
        }
        
        if (products.length > 0) {
          return products.map((item, idx) => ({
            id: `gbp_product_${idx + 1}`,
            name: item.name || item.description || item.title || `Service ${idx + 1}`,
            description: item.description || item.summary || `Professional ${item.name || 'service'} from authentic GBP data`,
            price: item.price ? `${item.price.currencyCode || 'EUR'} ${(item.price.amountMicros || item.price.amount || 0) / 1000000}` : null,
            category: item.category || item.type || 'authentic_service',
            source: 'gbp_business_api'
          }));
        }
        
        console.log('✅ GBP API accessible but no products configured in Business Profile');
        return [];
        
      } catch (endpointError) {
        console.log(`❌ Endpoint ${index + 1} error:`, endpointError.message);
        if (index === apiEndpoints.length - 1) {
          throw endpointError;
        }
      }
    }
    
    return [];
    
  } catch (error) {
    console.error('❌ GBP Business Information API Error:', error.message);
    throw error;
  }
}

module.exports = { getAccessToken, fetchGbpProducts };