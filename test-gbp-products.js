#!/usr/bin/env node

// Quick test script to check GBP products once quota is active
const { fetchGbpProducts } = require('./src/gbp/gbpAuth.js');
const { Pool } = require('pg');

async function testGbpProducts() {
  console.log('🔍 Testing GBP Business Information API for products...');
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Get user's refresh token
    const result = await pool.query(
      'SELECT refresh_token FROM user_tokens WHERE user_id = $1', 
      ['110795423852052644529']
    );
    
    const refreshToken = result.rows[0]?.refresh_token;
    if (!refreshToken) {
      console.log('❌ No refresh token found');
      return;
    }
    
    console.log('✅ Found user refresh token');
    
    // Test different location ID formats
    const locationFormats = [
      'locations/ChIJvW8VATCFWUcRDDXH5bhDN4k',  // Standard format
      'ChIJvW8VATCFWUcRDDXH5bhDN4k',           // Just place_id
      'accounts/-/locations/ChIJvW8VATCFWUcRDDXH5bhDN4k'  // Account format
    ];
    
    for (const locationId of locationFormats) {
      console.log(`\n📍 Testing location format: ${locationId}`);
      
      try {
        const products = await fetchGbpProducts(locationId, refreshToken);
        
        if (products.length > 0) {
          console.log('🎉 SUCCESS! Found GBP products:');
          products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name}`);
            console.log(`     Description: ${product.description}`);
            console.log(`     Price: ${product.price || 'Not specified'}`);
            console.log(`     Source: ${product.source}`);
          });
          break;
        } else {
          console.log('📦 API accessible but no products found in Business Profile');
        }
        
      } catch (error) {
        if (error.message.includes('429')) {
          console.log('⏳ Quota still propagating...');
        } else if (error.message.includes('403')) {
          console.log('🔐 Permission issue - may need different scope');
        } else if (error.message.includes('404')) {
          console.log('📍 Location format not recognized');
        } else {
          console.log(`❌ Error: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the test
testGbpProducts().catch(console.error);