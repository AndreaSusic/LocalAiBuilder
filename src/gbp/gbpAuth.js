// Helper to turn refresh token into bearer token
import { google } from 'googleapis';

export async function getAccessToken(refreshToken) {
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
export async function fetchGbpProducts(locationId, refreshToken) {
  try {
    const token = await getAccessToken(refreshToken);
    
    const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=priceLists`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`GBP API Error: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('🏢 GBP Business Information API Response:', JSON.stringify(data, null, 2));
    
    // Products/services are inside priceLists[0].serviceItems
    const products = data.priceLists?.[0]?.serviceItems || [];
    console.log(`📦 Found ${products.length} authentic GBP products/services`);
    
    return products.map((item, index) => ({
      id: `gbp_product_${index + 1}`,
      name: item.name || item.description || `Service ${index + 1}`,
      description: item.description || `Professional ${item.name || 'service'} from authentic GBP data`,
      price: item.price ? `${item.price.currencyCode} ${item.price.amountMicros / 1000000}` : null,
      category: item.category || 'authentic_service',
      source: 'gbp_business_api'
    }));
    
  } catch (error) {
    console.error('❌ GBP Business Information API Error:', error.message);
    throw error;
  }
}