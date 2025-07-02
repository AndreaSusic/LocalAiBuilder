// Test script to demonstrate the product rendering system with mock data
const testBootstrap = {
  gbpCid: '9887445968323294476', // Kigen Plastika CID
  userProducts: [
    {
      id: 'user1',
      name: 'Septic Tank System',
      description: 'Complete septic tank solutions for residential and commercial properties',
      image: 'https://via.placeholder.com/300x200?text=Septic+Tank'
    },
    {
      id: 'user2', 
      name: 'Plastic Containers',
      description: 'Durable plastic storage containers for various applications',
      image: 'https://via.placeholder.com/300x200?text=Plastic+Container'
    }
  ]
};

// Function to test the loadProducts logic
async function testLoadProducts(bootstrap) {
  let products = [];
  
  console.log('🔍 Testing product loading with 3-tier fallback system');
  
  // Tier 1: Try to fetch GBP products if we have a CID
  if (bootstrap.gbpCid) {
    console.log('📋 Fetching GBP products for CID:', bootstrap.gbpCid);
    try {
      const response = await fetch(`http://localhost:5000/api/gbp-products?cid=${bootstrap.gbpCid}`);
      if (response.ok) {
        products = await response.json();
        console.log(`📦 Got ${products.length} GBP products`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch GBP products:', error.message);
    }
  }
  
  // Tier 2: Fall back to user products if no GBP products found
  if (!products.length && bootstrap.userProducts?.length) {
    products = bootstrap.userProducts;
    console.log(`👤 Using ${products.length} user products as fallback`);
  }
  
  // Tier 3: Keep placeholders if no products (do nothing)
  if (!products.length) {
    console.log('📝 No products found, keeping placeholder content');
    return;
  }
  
  console.log('✅ Products to render:', products);
  return products;
}

// Run the test
testLoadProducts(testBootstrap);